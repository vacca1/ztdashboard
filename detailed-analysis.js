import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  'MODELO DE ESTOQUE.xlsx',
  'MODELO DE COMPRAS CLIENTE.xls',
  'MODELO DE CHEGADA FUTURA.xlsx'
];

const planilhasDir = path.join(__dirname, 'PLANILHAS');

files.forEach((filename) => {
  const filePath = path.join(planilhasDir, filename);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`FILE: ${filename}`);
  console.log(`${'='.repeat(80)}\n`);

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Get all data as JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log(`Total rows (including header): ${jsonData.length}`);
  console.log(`Header row: ${JSON.stringify(jsonData[0])}\n`);

  // Show all unique items
  if (filename.includes('ESTOQUE') || filename.includes('CHEGADA')) {
    console.log('ALL ITEMS:');
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row[0]) {
        console.log(`  ${i}. ${row[0]} - Quantidade: ${row[2]}`);
      }
    }
  } else if (filename.includes('COMPRAS')) {
    console.log('ALL ITEMS (showing first 15):');
    for (let i = 1; i < Math.min(16, jsonData.length); i++) {
      const row = jsonData[i];
      if (row && row[0]) {
        const monthValues = row.slice(2).map((v, idx) => {
          const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          return `${months[idx]}:${v || 0}`;
        }).join(', ');
        console.log(`  ${i}. ${row[0]} - ${monthValues}`);
      }
    }
  }

  // Check for empty cells and data patterns
  console.log('\nDATA QUALITY ANALYSIS:');
  let emptyModels = 0;
  let emptyQuantities = 0;

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row) {
      if (!row[1] || row[1] === '') emptyModels++;
      if (filename.includes('COMPRAS')) {
        // Check if all months are zero
        const allZero = row.slice(2).every(v => !v || v === 0);
        if (allZero) emptyQuantities++;
      } else {
        if (!row[2] || row[2] === '') emptyQuantities++;
      }
    }
  }

  console.log(`  Empty MODELO fields: ${emptyModels} out of ${jsonData.length - 1} rows`);
  console.log(`  Empty/Zero quantity rows: ${emptyQuantities} out of ${jsonData.length - 1} rows`);

  console.log('\n');
});
