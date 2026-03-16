const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'PLANILHAS', 'MODELO DE COMPRAS CLIENTE.xls');

try {
    const workbook = xlsx.readFile(filePath);

    console.log('=== ANÁLISE DA PLANILHA DE COMPRAS ===\n');
    console.log('Abas encontradas:', workbook.SheetNames);
    console.log('');

    workbook.SheetNames.forEach((sheetName, index) => {
        console.log(`\n=== ABA ${index + 1}: "${sheetName}" ===`);
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        console.log(`Número de linhas: ${jsonData.length}`);

        // Mostrar primeiras 5 linhas
        console.log('\nPrimeiras 5 linhas:');
        jsonData.slice(0, 5).forEach((row, i) => {
            console.log(`Linha ${i}:`, row);
        });

        // Tentar identificar cabeçalho
        for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i];
            const hasItem = row.some(cell =>
                cell && String(cell).toLowerCase().includes('item')
            );
            const hasMonth = row.some(cell =>
                cell && (String(cell).toLowerCase().includes('jan') ||
                         String(cell).toLowerCase().includes('janeiro'))
            );

            if (hasItem && hasMonth) {
                console.log(`\n>>> CABEÇALHO ENCONTRADO na linha ${i}:`);
                console.log(row);

                // Mostrar primeira linha de dados
                if (jsonData[i + 1]) {
                    console.log('\nPrimeira linha de DADOS:');
                    console.log(jsonData[i + 1]);
                }
                break;
            }
        }
    });

} catch (error) {
    console.error('Erro ao analisar planilha:', error.message);
}
