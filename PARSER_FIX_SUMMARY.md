# Parser Fix Summary - Excel File Structure Analysis

## Quick Overview

I analyzed the 3 Excel files in the PLANILHAS directory and compared them with your existing parser code. **All three parsers need updates** to work with the actual file structures.

---

## Files Analyzed

1. **MODELO DE ESTOQUE.xlsx** - Stock/Inventory file
2. **MODELO DE COMPRAS CLIENTE.xls** - Customer purchases by month
3. **MODELO DE CHEGADA FUTURA.xlsx** - Future arrivals/shipments

---

## Critical Issues Found

### ❌ Issue 1: ESTOQUE Parser (parseStockExcel)

**File:** `/Users/macbook/Documents/DASHBOARD FRANCIEL/src/utils/excelParser.js` (lines 56-116)

**Problem:**
- Parser expects columns: `Nome`, `Disponível para venda`
- File actually has: `ITEM`, `MODELO`, `QUANTIDADE`

**Result:** Will throw error immediately

**File Structure:**
```
| ITEM          | MODELO | QUANTIDADE |
|---------------|--------|------------|
| ACD-340       | (empty)| 37.63      |
| DW-902 POWER  | (empty)| 4.349      |
| DW-602/MAX    | (empty)| 4.293      |
```
- 50 products total
- MODELO column is 100% empty
- QUANTIDADE has mix of integers and decimals

---

### ❌ Issue 2: COMPRAS Parser (parseTopProductsExcel)

**File:** `/Users/macbook/Documents/DASHBOARD FRANCIEL/src/utils/excelParser.js` (lines 121-174)

**Problem:**
- Parser expects: `Categorias e Produtos`, `Quantidade vendida`, `Valor vendido`
- File actually has: `ITEM`, `MODELO`, `Jan`, `Fev`, `Mar`, ..., `Dez` (14 columns total)

**Result:** Complete mismatch - this file contains monthly purchase data, NOT top products sold

**File Structure:**
```
| ITEM  | MODELO                          | Jan | Fev | Mar | ... | Nov | Dez  |
|-------|----------------------------------|-----|-----|-----|-----|-----|------|
| DD-2  | MICROFONE DYLAN CONDENSADOR...  | 0   | 0   | 0   | ... | 300 | 890  |
| DSM-300| SISTEMA DYLAN DE MONITORAMENTO...| 0   | 0   | 0   | ... | 0   | 1030 |
```
- 72 products total
- MODELO column 98.6% filled with full descriptions
- 12 month columns with integer quantities
- This is a **time-series dataset** showing monthly purchases

---

### ⚠️ Issue 3: CHEGADA Parser (parseShipmentsExcel)

**File:** `/Users/macbook/Documents/DASHBOARD FRANCIEL/src/utils/excelParser.js` (lines 179-232)

**Problem:**
- Parser expects: `Item`, `Quantidade` (lowercase)
- File actually has: `ITEM`, `QUANTIDADE` (uppercase)
- Uses case-sensitive `indexOf()` which will fail

**File Structure:**
```
| ITEM          | MODELO | QUANTIDADE |
|---------------|--------|------------|
| ACD-340       | (empty)| 24         |
| DW-902 POWER  | (empty)| 2342       |
| DW-602/MAX    | (empty)| 3242       |
```
- 50 products total (same as ESTOQUE)
- MODELO column is 100% empty
- Different quantities than ESTOQUE file

---

## Required Fixes

### Fix 1: Update parseStockExcel (ESTOQUE)

**Location:** Line 86-87 in `/Users/macbook/Documents/DASHBOARD FRANCIEL/src/utils/excelParser.js`

**Current Code:**
```javascript
const nameIdx = headers.indexOf('Nome');
let qtyIdx = headers.findIndex(h => h && h.includes('Disponível'));
```

**Updated Code:**
```javascript
const nameIdx = headers.findIndex(h =>
    h && (h.toLowerCase() === 'nome' || h.toLowerCase() === 'item')
);
let qtyIdx = headers.findIndex(h =>
    h && (h.toLowerCase().includes('disponível') || h.toLowerCase() === 'quantidade')
);
```

**Why:** Makes parser accept both old format (Nome/Disponível) and new format (ITEM/QUANTIDADE)

---

### Fix 2: Update parseShipmentsExcel (CHEGADA)

**Location:** Line 209-210 in `/Users/macbook/Documents/DASHBOARD FRANCIEL/src/utils/excelParser.js`

**Current Code:**
```javascript
const itemIdx = headers.indexOf('Item');
const qtyIdx = headers.indexOf('Quantidade');
```

**Updated Code:**
```javascript
const itemIdx = headers.findIndex(h => h && h.toLowerCase() === 'item');
const qtyIdx = headers.findIndex(h => h && h.toLowerCase() === 'quantidade');
```

**Why:** Makes parser case-insensitive to handle uppercase column names

---

### Fix 3: Create New Parser for COMPRAS (NEW FUNCTION)

**Location:** Add new function to `/Users/macbook/Documents/DASHBOARD FRANCIEL/src/utils/excelParser.js`

The COMPRAS file needs a completely new parser because it's a different data structure (monthly time-series).

**New Function:**
```javascript
/**
 * Parses the "Compras por Mês" spreadsheet with monthly purchase data
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
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                await yieldToMain();

                const rawJson = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

                // Find header row
                let headerRowIdx = -1;
                for (let i = 0; i < Math.min(20, rawJson.length); i++) {
                    if (rawJson[i] && rawJson[i].includes('ITEM') && rawJson[i].includes('Jan')) {
                        headerRowIdx = i;
                        break;
                    }
                }

                if (headerRowIdx === -1) {
                    throw new Error("Cabeçalhos 'ITEM' e meses não encontrados na planilha de Compras.");
                }

                const headers = rawJson[headerRowIdx];
                const itemIdx = headers.findIndex(h => h && h.toLowerCase() === 'item');
                const modeloIdx = headers.findIndex(h => h && h.toLowerCase() === 'modelo');

                // Find month columns
                const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
                const monthIndices = monthNames.map(month =>
                    headers.findIndex(h => h && h.toLowerCase() === month)
                );

                if (itemIdx === -1 || monthIndices.some(idx => idx === -1)) {
                    throw new Error("Colunas necessárias não encontradas na planilha de Compras.");
                }

                // Process rows in chunks
                const dataRows = rawJson.slice(headerRowIdx + 1);
                const purchasesData = await processInChunks(dataRows, (row) => {
                    if (!row || !row[itemIdx]) return null;

                    const monthlyData = {};
                    let total = 0;

                    monthNames.forEach((month, idx) => {
                        const value = parseToNumber(row[monthIndices[idx]]);
                        monthlyData[month] = value;
                        total += value;
                    });

                    return {
                        name: String(row[itemIdx]).trim(),
                        modelo: row[modeloIdx] ? String(row[modeloIdx]).trim() : '',
                        monthly: monthlyData,
                        total: total
                    };
                }, 50);

                resolve(purchasesData.filter(item => item.total > 0));
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};
```

**Why:** The COMPRAS file has a completely different structure with 12 month columns, requiring time-series data extraction.

---

## Data Insights

### Common Items
All three files share **50 common product codes**:
- ESTOQUE shows current stock levels
- CHEGADA shows future shipment quantities
- COMPRAS shows monthly purchase history (has 22 additional items = 72 total)

### Empty MODELO Columns
- **ESTOQUE:** 100% empty
- **CHEGADA:** 100% empty
- **COMPRAS:** Only 1.4% empty (71/72 rows filled)

This suggests MODELO is a template column in ESTOQUE/CHEGADA files.

### Quantity Data Types
Both ESTOQUE and CHEGADA have:
- Mix of integers and decimals
- Some floating-point precision issues (e.g., 694.8000000000001)
- The existing `parseToNumber()` function handles this correctly

---

## Testing Checklist

After implementing fixes:

- [ ] Test ESTOQUE parser with actual file
- [ ] Verify case-insensitive matching works
- [ ] Test CHEGADA parser with uppercase headers
- [ ] Test new COMPRAS parser
- [ ] Verify monthly data aggregation is correct
- [ ] Check empty MODELO columns don't break parsing
- [ ] Confirm floating-point values parse correctly

---

## Reference Files Created

All analysis files are in: `/Users/macbook/Documents/DASHBOARD FRANCIEL/`

1. **STRUCTURE_ANALYSIS_REPORT.md** - Comprehensive written analysis
2. **quick-reference.txt** - Visual structure comparison
3. **analyze-excel-structure.js** - Reusable structure analyzer script
4. **detailed-analysis.js** - Data quality analysis script
5. **compras-full-analysis.js** - COMPRAS monthly breakdown script
6. **final-structure-report.js** - Complete report generator

Run any script with: `node <script-name>.js`

---

## Next Steps

1. **Apply Fix 1** to parseStockExcel for ESTOQUE compatibility
2. **Apply Fix 2** to parseShipmentsExcel for CHEGADA compatibility
3. **Add Fix 3** (new function) for COMPRAS monthly data parsing
4. **Test** with actual files in PLANILHAS directory
5. **Update** UI components to handle monthly time-series data from COMPRAS

---

## Summary

| File | Status | Action Required |
|------|--------|-----------------|
| ESTOQUE | ❌ Will Fail | Update column matching (case-insensitive + alternate names) |
| COMPRAS | ❌ Will Fail | Create new parser for monthly data structure |
| CHEGADA | ⚠️ Will Fail | Update to case-insensitive matching |

**All parsers need updates before they can successfully read the files in PLANILHAS directory.**
