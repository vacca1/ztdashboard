const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'PLANILHAS', 'MODELO DE CHEGADA FUTURA.xlsx');

try {
  const workbook = xlsx.readFile(filePath);

  console.log('=== ANÁLISE: MODELO DE CHEGADA FUTURA ===\n');
  console.log('Abas encontradas:', workbook.SheetNames);

  workbook.SheetNames.forEach((sheetName, idx) => {
    console.log(`\n=== ABA ${idx + 1}: "${sheetName}" ===`);

    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    console.log(`Total de linhas: ${data.length}`);

    if (data.length > 0) {
      console.log('\nCabeçalhos (primeira linha):');
      console.log(data[0]);

      console.log('\nPrimeiras 5 linhas de dados:');
      for (let i = 0; i < Math.min(6, data.length); i++) {
        console.log(`Linha ${i}:`, data[i]);
      }

      console.log('\nÚltimas 3 linhas de dados:');
      for (let i = Math.max(0, data.length - 3); i < data.length; i++) {
        console.log(`Linha ${i}:`, data[i]);
      }
    }
  });

  console.log('\n=== ANÁLISE COMPLETA ===');

} catch (error) {
  console.error('Erro ao analisar planilha:', error.message);
}
