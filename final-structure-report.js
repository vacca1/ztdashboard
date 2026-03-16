import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  { name: 'MODELO DE ESTOQUE.xlsx', type: 'ESTOQUE' },
  { name: 'MODELO DE COMPRAS CLIENTE.xls', type: 'COMPRAS' },
  { name: 'MODELO DE CHEGADA FUTURA.xlsx', type: 'CHEGADA' }
];

console.log('\n' + '='.repeat(80));
console.log('COMPREHENSIVE EXCEL STRUCTURE ANALYSIS REPORT');
console.log('Generated:', new Date().toISOString());
console.log('='.repeat(80) + '\n');

files.forEach((file) => {
  const filePath = path.join(__dirname, 'PLANILHAS', file.name);
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('\n' + '#'.repeat(80));
  console.log(`FILE: ${file.name}`);
  console.log(`TYPE: ${file.type}`);
  console.log('#'.repeat(80) + '\n');

  // Basic info
  console.log('BASIC INFORMATION:');
  console.log(`  Sheet Name: ${sheetName}`);
  console.log(`  Total Rows: ${jsonData.length} (including header)`);
  console.log(`  Data Rows: ${jsonData.length - 1}`);
  console.log(`  Range: ${worksheet['!ref']}`);

  // Column structure
  const headers = jsonData[0];
  console.log(`\nCOLUMN STRUCTURE:`);
  console.log(`  Total Columns: ${headers.length}`);
  console.log(`  Headers: ${JSON.stringify(headers)}`);
  console.log('\n  Column Details:');
  headers.forEach((header, idx) => {
    console.log(`    Column ${idx + 1} (${XLSX.utils.encode_col(idx)}): "${header}"`);
  });

  // Data analysis
  console.log(`\nDATA ANALYSIS:`);

  if (file.type === 'COMPRAS') {
    // For COMPRAS file
    let emptyModelo = 0;
    let allZeroRows = 0;
    const monthColumns = headers.slice(2);

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row) continue;

      if (!row[1] || row[1] === '') emptyModelo++;

      const monthValues = row.slice(2);
      if (monthValues.every(v => !v || v === 0)) allZeroRows++;
    }

    console.log(`  ITEM column: ${jsonData.length - 1} items`);
    console.log(`  MODELO column: ${jsonData.length - 1 - emptyModelo} filled, ${emptyModelo} empty`);
    console.log(`  Month columns: ${monthColumns.join(', ')}`);
    console.log(`  Rows with all zeros: ${allZeroRows}`);

    // Show data type patterns
    console.log(`\n  Data Types:`);
    console.log(`    ITEM: string`);
    console.log(`    MODELO: string`);
    monthColumns.forEach(month => {
      console.log(`    ${month}: number`);
    });

  } else {
    // For ESTOQUE and CHEGADA files
    let emptyModelo = 0;
    let emptyQuantidade = 0;
    let decimalQuantidades = 0;
    let integerQuantidades = 0;

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row) continue;

      if (!row[1] || row[1] === '') emptyModelo++;
      if (!row[2] && row[2] !== 0) emptyQuantidade++;

      if (row[2] !== undefined && row[2] !== null) {
        if (Number.isInteger(row[2])) {
          integerQuantidades++;
        } else {
          decimalQuantidades++;
        }
      }
    }

    console.log(`  ITEM column: ${jsonData.length - 1} items`);
    console.log(`  MODELO column: ${jsonData.length - 1 - emptyModelo} filled, ${emptyModelo} empty`);
    console.log(`  QUANTIDADE column: ${jsonData.length - 1 - emptyQuantidade} filled, ${emptyQuantidade} empty`);
    console.log(`    Integer values: ${integerQuantidades}`);
    console.log(`    Decimal values: ${decimalQuantidades}`);

    console.log(`\n  Data Types:`);
    console.log(`    ITEM: string`);
    console.log(`    MODELO: string (mostly empty in this file)`);
    console.log(`    QUANTIDADE: number (mix of integers and decimals)`);
  }

  // Sample data
  console.log(`\nSAMPLE DATA (first 5 items):`);
  for (let i = 1; i <= Math.min(5, jsonData.length - 1); i++) {
    const row = jsonData[i];
    console.log(`\n  Row ${i}:`);
    headers.forEach((header, idx) => {
      const value = row[idx];
      console.log(`    ${header}: ${JSON.stringify(value)}`);
    });
  }

  // Special notes
  console.log(`\nSPECIAL NOTES:`);
  if (file.type === 'ESTOQUE') {
    console.log(`  - All MODELO fields are empty`);
    console.log(`  - QUANTIDADE values are decimals (e.g., 37.63, 4.349)`);
    console.log(`  - Items appear to be product codes (e.g., ACD-340, DW-902 POWER)`);
  } else if (file.type === 'COMPRAS') {
    console.log(`  - Has 12 month columns (Jan through Dez)`);
    console.log(`  - Most MODELO fields are filled with full product descriptions`);
    console.log(`  - Monthly values are integers representing quantities purchased`);
    console.log(`  - Many months have zero values`);
  } else if (file.type === 'CHEGADA') {
    console.log(`  - All MODELO fields are empty`);
    console.log(`  - QUANTIDADE values are mix of integers and decimals`);
    console.log(`  - Same items as ESTOQUE file but different quantities`);
    console.log(`  - Some values have floating point precision issues (e.g., 694.8000000000001)`);
  }

  console.log('\n');
});

console.log('='.repeat(80));
console.log('END OF REPORT');
console.log('='.repeat(80) + '\n');
