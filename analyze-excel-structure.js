import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to analyze
const files = [
  'MODELO DE ESTOQUE.xlsx',
  'MODELO DE COMPRAS CLIENTE.xls',
  'MODELO DE CHEGADA FUTURA.xlsx'
];

const planilhasDir = path.join(__dirname, 'PLANILHAS');

console.log('='.repeat(80));
console.log('EXCEL FILE STRUCTURE ANALYSIS');
console.log('='.repeat(80));
console.log('\n');

files.forEach((filename, fileIndex) => {
  const filePath = path.join(planilhasDir, filename);

  console.log(`\n${'#'.repeat(80)}`);
  console.log(`FILE ${fileIndex + 1}: ${filename}`);
  console.log(`${'#'.repeat(80)}\n`);

  if (!fs.existsSync(filePath)) {
    console.log(`ERROR: File not found at ${filePath}\n`);
    return;
  }

  try {
    // Read the workbook
    const workbook = XLSX.readFile(filePath);

    console.log(`Sheet Names: ${workbook.SheetNames.join(', ')}`);
    console.log(`Number of Sheets: ${workbook.SheetNames.length}\n`);

    // Analyze each sheet
    workbook.SheetNames.forEach((sheetName, sheetIndex) => {
      console.log(`\n${'-'.repeat(80)}`);
      console.log(`SHEET ${sheetIndex + 1}: "${sheetName}"`);
      console.log(`${'-'.repeat(80)}\n`);

      const worksheet = workbook.Sheets[sheetName];

      // Get the range of the sheet
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      const numRows = range.e.r - range.s.r + 1;
      const numCols = range.e.c - range.s.c + 1;

      console.log(`Range: ${worksheet['!ref']}`);
      console.log(`Total Rows (including header): ${numRows}`);
      console.log(`Total Columns: ${numCols}`);
      console.log(`Data Rows (excluding header): ${numRows - 1}\n`);

      // Convert sheet to JSON to get column headers and data
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        console.log('Sheet is empty.\n');
        return;
      }

      // Get column headers (first row)
      const headers = jsonData[0] || [];
      console.log('COLUMN HEADERS:');
      headers.forEach((header, index) => {
        const colLetter = XLSX.utils.encode_col(index);
        console.log(`  ${colLetter}: ${header || '(empty)'}`);
      });

      // Check for merged cells
      if (worksheet['!merges'] && worksheet['!merges'].length > 0) {
        console.log(`\nMERGED CELLS: ${worksheet['!merges'].length} merge(s) detected`);
        worksheet['!merges'].forEach((merge, idx) => {
          console.log(`  Merge ${idx + 1}: ${XLSX.utils.encode_range(merge)}`);
        });
      }

      // Show sample data (first 5 rows including header)
      const sampleRows = Math.min(6, jsonData.length);
      console.log(`\nSAMPLE DATA (first ${sampleRows} rows):`);
      console.log('─'.repeat(80));

      for (let i = 0; i < sampleRows; i++) {
        const row = jsonData[i] || [];
        console.log(`\nRow ${i + 1}:`);
        headers.forEach((header, colIndex) => {
          const value = row[colIndex];
          const displayValue = value === undefined ? '(empty)' :
                              value === null ? '(null)' :
                              typeof value === 'string' ? `"${value}"` :
                              value;
          console.log(`  ${header || `Column ${colIndex + 1}`}: ${displayValue}`);
        });
      }

      // Analyze data types in each column (sampling first 10 rows)
      console.log(`\nDATA TYPE ANALYSIS (first 10 rows):`);
      const analysisRows = Math.min(11, jsonData.length); // Including header
      const columnTypes = {};

      headers.forEach((header, colIndex) => {
        const types = new Set();
        for (let rowIndex = 1; rowIndex < analysisRows; rowIndex++) {
          const value = jsonData[rowIndex] ? jsonData[rowIndex][colIndex] : undefined;
          if (value !== undefined && value !== null && value !== '') {
            types.add(typeof value);
          }
        }
        columnTypes[header || `Column ${colIndex + 1}`] = Array.from(types);
      });

      Object.entries(columnTypes).forEach(([header, types]) => {
        console.log(`  ${header}: ${types.length > 0 ? types.join(', ') : 'no data'}`);
      });

      // Check for formulas
      let formulaCount = 0;
      Object.keys(worksheet).forEach(cell => {
        if (cell[0] !== '!' && worksheet[cell].f) {
          formulaCount++;
        }
      });
      if (formulaCount > 0) {
        console.log(`\nFORMULAS DETECTED: ${formulaCount} cell(s) contain formulas`);
      }

      // Check for special formatting
      if (worksheet['!cols']) {
        console.log(`\nCOLUMN WIDTHS: Custom column widths detected`);
      }
      if (worksheet['!rows']) {
        console.log(`ROW HEIGHTS: Custom row heights detected`);
      }
    });
  } catch (error) {
    console.log(`ERROR reading file: ${error.message}\n`);
    console.log(error.stack);
  }

  console.log('\n');
});

console.log('='.repeat(80));
console.log('ANALYSIS COMPLETE');
console.log('='.repeat(80));
