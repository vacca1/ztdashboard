import * as xlsx from 'xlsx';
import { createDisplayName } from './fuzzyMatch';

/**
 * Helper logic to safely parse stringified Brazilian or US numbers into JS floats
 * regardless of formatting, avoiding NaN returns that crash Recharts.
 */
const parseToNumber = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;

    let str = String(val).trim().replace(/[R$\s%]/g, '');

    // Se tem vírgula, assumimos padrão BR: 1.000,50 -> 1000.50
    // Se não tem vírgula, mas tem ponto, assumimos padrão US: 1000.50 ou 1.000 (mil)
    // Para simplificar: se tem vírgula, troca ponto por nada e vírgula por ponto
    if (str.includes(',')) {
        str = str.replace(/\./g, '').replace(/,/g, '.');
    }

    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
};

/**
 * Convert Excel date serial number to JavaScript Date
 * Excel stores dates as numbers (days since 1900-01-01)
 */
const excelDateToJSDate = (serial) => {
    if (!serial || typeof serial !== 'number') return null;
    // Excel date: 1 = 1900-01-01 (but Excel has a 1900 leap year bug)
    // JavaScript: milliseconds since 1970-01-01
    const utc_days  = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info;
};

/**
 * Format date as DD/MM/YYYY
 */
const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date)) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Helper to yield control back to the browser for UI updates
 */
const yieldToMain = () => {
    return new Promise(resolve => {
        setTimeout(resolve, 0);
    });
};

/**
 * Process array in chunks to avoid blocking the main thread
 */
const processInChunks = async (array, processFn, chunkSize = 100) => {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        for (const item of chunk) {
            const processed = processFn(item);
            if (processed) result.push(processed);
        }
        // Yield to browser every chunk to keep UI responsive
        if (i + chunkSize < array.length) {
            await yieldToMain();
        }
    }
    return result;
};

/**
 * Parses the "Estoque Atual" spreadsheet.
 * Expected columns: ITEM, MODELO (optional), QUANTIDADE
 * Also supports old format: Nome, Disponível para venda
 */
export const parseStockExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);

        // Yield before heavy parsing
        await yieldToMain();

        const workbook = xlsx.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Yield after workbook read
        await yieldToMain();

        // Convert to JSON
        const rawJson = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        // Find header row (case-insensitive search)
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(10, rawJson.length); i++) {
            if (rawJson[i] && rawJson[i].length > 0) {
                const rowLower = rawJson[i].map(h => h ? String(h).toLowerCase() : '');
                if (rowLower.includes('item') || rowLower.includes('nome')) {
                    headerRowIdx = i;
                    break;
                }
            }
        }

        if (headerRowIdx === -1) {
            throw new Error("Cabeçalho não encontrado na planilha de Estoque. Esperado: ITEM ou Nome");
        }

        const headers = rawJson[headerRowIdx];

        // Find columns (case-insensitive, multiple variants)
        const itemIdx = headers.findIndex(h =>
            h && ['item', 'nome', 'código', 'codigo'].includes(String(h).toLowerCase().trim())
        );

        const modeloIdx = headers.findIndex(h =>
            h && ['modelo', 'descrição', 'descricao', 'description'].includes(String(h).toLowerCase().trim())
        );

        const qtyIdx = headers.findIndex(h =>
            h && (String(h).toLowerCase().includes('quantidade') ||
                  String(h).toLowerCase().includes('disponível') ||
                  String(h).toLowerCase().includes('disponivel') ||
                  String(h).toLowerCase().includes('estoque'))
        );

        if (itemIdx === -1 || qtyIdx === -1) {
             throw new Error("Colunas obrigatórias não encontradas na planilha de Estoque. Esperado: ITEM + QUANTIDADE");
        }

        // Process rows in chunks to avoid blocking
        const dataRows = rawJson.slice(headerRowIdx + 1);
        const stockData = await processInChunks(dataRows, (row) => {
            if (!row || !row[itemIdx]) return null;

            const itemCode = String(row[itemIdx]).trim();
            const modelo = modeloIdx !== -1 && row[modeloIdx] ? String(row[modeloIdx]).trim() : '';
            const qty = parseToNumber(row[qtyIdx]);

            // Skip rows with zero or negative quantity
            if (qty <= 0) return null;

            return {
                code: itemCode,                                 // Product code (ITEM)
                modelo: modelo,                                 // Description (MODELO)
                name: createDisplayName(itemCode, modelo),      // Combined display name
                quantity: qty
            };
        }, 50); // Process 50 rows at a time

        resolve(stockData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);

    // Start reading immediately - we have yields inside now
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parses the "Compras Mensais" spreadsheet with monthly purchase data.
 * NOW READS 2 SHEETS: "UNIDADES" (quantities) and "VALOR" (revenue in R$)
 * Expected columns: ITEM, MODELO, Jan, Fev, Mar, Abr, Mai, Jun, Jul, Ago, Set, Out, Nov, Dez
 */
export const parseMonthlyPurchasesExcel = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                await yieldToMain();

                const workbook = xlsx.read(data, { type: 'array' });

                // Find UNIDADES and VALOR sheets
                const unidadesSheetName = workbook.SheetNames.find(name =>
                    name.toLowerCase().includes('unidade')
                );
                const valorSheetName = workbook.SheetNames.find(name =>
                    name.toLowerCase().includes('valor')
                );

                if (!unidadesSheetName || !valorSheetName) {
                    throw new Error("Planilha deve ter abas 'UNIDADES' e 'VALOR'. Encontradas: " + workbook.SheetNames.join(', '));
                }

                // Parse both sheets
                const unidadesSheet = workbook.Sheets[unidadesSheetName];
                const valorSheet = workbook.Sheets[valorSheetName];

                await yieldToMain();

                const unidadesJson = xlsx.utils.sheet_to_json(unidadesSheet, { header: 1 });
                const valorJson = xlsx.utils.sheet_to_json(valorSheet, { header: 1 });

                // Helper function to parse a sheet
                const parseSheet = (rawJson, sheetType) => {
                    // Find header row
                    let headerRowIdx = -1;
                    for (let i = 0; i < Math.min(20, rawJson.length); i++) {
                        if (rawJson[i] && rawJson[i].length > 0) {
                            const rowLower = rawJson[i].map(h => h ? String(h).toLowerCase() : '');
                            if (rowLower.includes('item') && (rowLower.includes('jan') || rowLower.includes('janeiro'))) {
                                headerRowIdx = i;
                                break;
                            }
                        }
                    }

                    if (headerRowIdx === -1) {
                        throw new Error(`Cabeçalhos não encontrados na aba ${sheetType}`);
                    }

                    const headers = rawJson[headerRowIdx];

                    const itemIdx = headers.findIndex(h =>
                        h && ['item', 'código', 'codigo'].includes(String(h).toLowerCase().trim())
                    );

                    const modeloIdx = headers.findIndex(h =>
                        h && ['modelo', 'descrição', 'descricao', 'description'].includes(String(h).toLowerCase().trim())
                    );

                    const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
                    const monthFullNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

                    const monthIndices = monthNames.map((month, idx) => {
                        const index = headers.findIndex(h => {
                            if (!h) return false;
                            const hLower = String(h).toLowerCase().trim();
                            return hLower === month || hLower === monthFullNames[idx];
                        });
                        return index;
                    });

                    if (itemIdx === -1 || monthIndices.some(idx => idx === -1)) {
                        throw new Error(`Colunas necessárias não encontradas na aba ${sheetType}`);
                    }

                    const dataRows = rawJson.slice(headerRowIdx + 1);
                    const result = {};

                    dataRows.forEach(row => {
                        if (!row || !row[itemIdx]) return;

                        const itemCode = String(row[itemIdx]).trim();
                        const modelo = modeloIdx !== -1 && row[modeloIdx] ? String(row[modeloIdx]).trim() : '';

                        const monthlyData = {};
                        let total = 0;

                        monthNames.forEach((month, idx) => {
                            const value = parseToNumber(row[monthIndices[idx]]);
                            monthlyData[month] = value;
                            total += value;
                        });

                        result[itemCode] = {
                            code: itemCode,
                            modelo: modelo,
                            monthly: monthlyData,
                            total: total
                        };
                    });

                    return result;
                };

                // Parse both sheets
                const unidadesData = parseSheet(unidadesJson, 'UNIDADES');
                const valorData = parseSheet(valorJson, 'VALOR');

                // Merge data (use VALOR sheet as primary source since it has the revenue)
                const mergedData = [];

                Object.keys(valorData).forEach(itemCode => {
                    const valorItem = valorData[itemCode];
                    const unidadeItem = unidadesData[itemCode];

                    // Skip if no revenue
                    if (valorItem.total === 0) return;

                    mergedData.push({
                        code: itemCode,
                        modelo: valorItem.modelo,
                        name: createDisplayName(itemCode, valorItem.modelo),
                        monthlyUnits: unidadeItem ? unidadeItem.monthly : {}, // Units sold per month
                        monthlyRevenue: valorItem.monthly,                     // Revenue (R$) per month
                        totalUnits: unidadeItem ? unidadeItem.total : 0,      // Total units
                        totalRevenue: valorItem.total,                         // Total revenue (R$) - REAL DATA!
                        avgMonthlyRevenue: valorItem.total / 12                // Average monthly revenue
                    });
                });

                resolve(mergedData);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Legacy alias for backwards compatibility
 * @deprecated Use parseMonthlyPurchasesExcel instead
 */
export const parseTopProductsExcel = parseMonthlyPurchasesExcel;

/**
 * Parses the "Posição de Embarques" (Future Arrivals) spreadsheet.
 * Expected columns: ITEM, MODELO (optional), QUANTIDADE
 * This file is OPTIONAL - system can work without it.
 */
export const parseShipmentsExcel = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);

                // Yield before heavy parsing
                await yieldToMain();

                const workbook = xlsx.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];

                await yieldToMain();

                const rawJson = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

                // Find header row (case-insensitive)
                let headerRowIdx = -1;
                for (let i = 0; i < Math.min(20, rawJson.length); i++) {
                    if (rawJson[i] && rawJson[i].length > 0) {
                        const rowLower = rawJson[i].map(h => h ? String(h).toLowerCase() : '');
                        if (rowLower.includes('item')) {
                            headerRowIdx = i;
                            break;
                        }
                    }
                }

                if (headerRowIdx === -1) {
                    throw new Error("Cabeçalho 'ITEM' não encontrado na planilha Posição de Embarques.");
                }

                const headers = rawJson[headerRowIdx];

                // Find columns (case-insensitive)
                const itemIdx = headers.findIndex(h =>
                    h && ['item', 'código', 'codigo'].includes(String(h).toLowerCase().trim())
                );

                const modeloIdx = headers.findIndex(h =>
                    h && ['modelo', 'descrição', 'descricao', 'description'].includes(String(h).toLowerCase().trim())
                );

                const qtyIdx = headers.findIndex(h =>
                    h && (String(h).toLowerCase().includes('quantidade') ||
                          String(h).toLowerCase().includes('qtd') ||
                          String(h).toLowerCase().includes('qtde'))
                );

                const dataIdx = headers.findIndex(h =>
                    h && (String(h).toLowerCase().includes('data') ||
                          String(h).toLowerCase().includes('previsão') ||
                          String(h).toLowerCase().includes('previsao') ||
                          String(h).toLowerCase().includes('chegada'))
                );

                if (itemIdx === -1 || qtyIdx === -1) {
                    throw new Error("Colunas obrigatórias não encontradas. Esperado: ITEM + QUANTIDADE");
                }

                // Process rows in chunks
                const dataRows = rawJson.slice(headerRowIdx + 1);
                const shipmentsData = await processInChunks(dataRows, (row) => {
                    if (!row || !row[itemIdx]) return null;

                    const itemCode = String(row[itemIdx]).trim();
                    const modelo = modeloIdx !== -1 && row[modeloIdx] ? String(row[modeloIdx]).trim() : '';
                    const qty = parseToNumber(row[qtyIdx]);

                    // Skip zero quantities
                    if (qty <= 0) return null;

                    // Parse arrival date if available
                    let arrivalDate = null;
                    let arrivalDateFormatted = '';
                    if (dataIdx !== -1 && row[dataIdx]) {
                        arrivalDate = excelDateToJSDate(row[dataIdx]);
                        arrivalDateFormatted = formatDate(arrivalDate);
                    }

                    return {
                        code: itemCode,                                 // Product code (ITEM)
                        modelo: modelo,                                 // Description (MODELO)
                        name: createDisplayName(itemCode, modelo),      // Combined display name
                        quantity: qty,                                  // Quantity arriving
                        arrivalDate: arrivalDate,                       // Date object
                        arrivalDateFormatted: arrivalDateFormatted      // DD/MM/YYYY string
                    };
                }, 50);

                resolve({
                    detailed: shipmentsData,
                    totalItems: shipmentsData.length
                });
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);

        reader.readAsArrayBuffer(file);
    });
};
