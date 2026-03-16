import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'PLANILHAS', 'MODELO DE COMPRAS CLIENTE.xls');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('MODELO DE COMPRAS CLIENTE - Complete Item List\n');
console.log(`Total items: ${jsonData.length - 1}\n`);

for (let i = 1; i < jsonData.length; i++) {
  const row = jsonData[i];
  if (row && row[0]) {
    const item = row[0];
    const modelo = row[1] || '(empty)';
    const monthValues = row.slice(2);
    const total = monthValues.reduce((sum, val) => sum + (val || 0), 0);

    console.log(`${i}. ${item}`);
    console.log(`   MODELO: ${modelo}`);
    console.log(`   Total annual: ${total}`);

    // Show months with non-zero values
    const nonZeroMonths = [];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    monthValues.forEach((val, idx) => {
      if (val && val > 0) {
        nonZeroMonths.push(`${months[idx]}:${val}`);
      }
    });
    if (nonZeroMonths.length > 0) {
      console.log(`   Non-zero months: ${nonZeroMonths.join(', ')}`);
    }
    console.log('');
  }
}
