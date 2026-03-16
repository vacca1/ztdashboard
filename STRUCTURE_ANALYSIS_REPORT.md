# Excel Files Structure Analysis Report

**Generated:** 2026-03-15
**Location:** /Users/macbook/Documents/DASHBOARD FRANCIEL/PLANILHAS

---

## Executive Summary

This report analyzes the structure of three Excel files used in the dashboard and compares them with what the current parser expects. The analysis reveals **critical mismatches** between the actual file structure and parser expectations.

---

## File 1: MODELO DE ESTOQUE.xlsx

### Actual Structure
- **File Path:** `/Users/macbook/Documents/DASHBOARD FRANCIEL/PLANILHAS/MODELO DE ESTOQUE.xlsx`
- **Sheet Name:** Planilha1
- **Total Rows:** 51 (including header)
- **Data Rows:** 50
- **Range:** A1:C51

### Column Structure
| Column | Header | Data Type | Sample Values |
|--------|--------|-----------|---------------|
| A | ITEM | string | "ACD-340", "DW-902 POWER", "DW-602/MAX" |
| B | MODELO | string | **ALL EMPTY** |
| C | QUANTIDADE | number | 37.63, 4.349, 4.293, 2.658 |

### Data Characteristics
- **ITEM Column:** 50 product codes (e.g., "ACD-340", "DW-902 POWER")
- **MODELO Column:** 50/50 rows are EMPTY (0% filled)
- **QUANTIDADE Column:** 50/50 rows filled
  - Integer values: 35 rows (70%)
  - Decimal values: 15 rows (30%)
  - Mix of whole numbers and decimals with up to 3 decimal places

### Sample Data
```
Row 1: ACD-340, (empty), 37.63
Row 2: DW-902 POWER, (empty), 4.349
Row 3: DW-602/MAX, (empty), 4.293
Row 4: DE-115, (empty), 2.658
Row 5: CAP602BK, (empty), 2.173
```

### Current Parser Expectations
**Function:** `parseStockExcel()` in `/Users/macbook/Documents/DASHBOARD FRANCIEL/src/utils/excelParser.js`

Expected columns:
- "Nome" (Product name)
- "Disponível para venda" or contains "Disponível" (Available quantity)

### CRITICAL MISMATCH
❌ **Parser expects:** "Nome" and "Disponível para venda"
❌ **File has:** "ITEM" and "QUANTIDADE"
❌ **Result:** Parser will throw error: "Colunas 'Nome' ou 'Disponível para venda' não encontradas"

### Recommended Parser Changes
1. Update `parseStockExcel()` to look for "ITEM" instead of "Nome"
2. Update to look for "QUANTIDADE" instead of "Disponível"
3. Handle the MODELO column (currently empty, can be ignored)

---

## File 2: MODELO DE COMPRAS CLIENTE.xls

### Actual Structure
- **File Path:** `/Users/macbook/Documents/DASHBOARD FRANCIEL/PLANILHAS/MODELO DE COMPRAS CLIENTE.xls`
- **Sheet Name:** Relatório
- **Total Rows:** 73 (including header)
- **Data Rows:** 72
- **Range:** A1:N73

### Column Structure
| Column | Header | Data Type | Notes |
|--------|--------|-----------|-------|
| A | ITEM | string | Product codes |
| B | MODELO | string | Full product descriptions (71/72 filled) |
| C | Jan | number | Monthly quantity |
| D | Fev | number | Monthly quantity |
| E | Mar | number | Monthly quantity |
| F | Abr | number | Monthly quantity |
| G | Mai | number | Monthly quantity |
| H | Jun | number | Monthly quantity |
| I | Jul | number | Monthly quantity |
| J | Ago | number | Monthly quantity |
| K | Set | number | Monthly quantity |
| L | Out | number | Monthly quantity |
| M | Nov | number | Monthly quantity |
| N | Dez | number | Monthly quantity |

### Data Characteristics
- **ITEM Column:** 72 product codes
- **MODELO Column:** 71/72 rows filled (98.6% filled)
  - Contains full product descriptions (e.g., "MICROFONE DYLAN CONDENSADOR OVERHEAD DD-2")
- **Month Columns:** All integer values
  - Many months have zero values
  - Only 1 row has all zeros across all months
  - Values range from 0 to 1030

### Sample Data
```
Row 1: DD-2, MICROFONE DYLAN CONDENSADOR OVERHEAD DD-2, 0, 0, 0, 0, 0, 0, 0, 0, 200, 380, 300, 890
Row 2: DSM-300, SISTEMA DYLAN DE MONITORAMENTO..., 0, 0, 0, 0, 0, 100, 0, 0, 0, 600, 0, 1030
Row 3: DE-215, FONE DE OUVIDO DYLAN PARA MONITORAMENTO..., 0, 0, 0, 0, 0, 0, 300, 20, 250, 250, 0, 500
```

### Current Parser Expectations
**Function:** `parseTopProductsExcel()` in `/Users/macbook/Documents/DASHBOARD FRANCIEL/src/utils/excelParser.js`

Expected columns:
- "Categorias e Produtos" (Product name)
- "Quantidade vendida" (Quantity sold)
- "Valor vendido" (Value sold)

### CRITICAL MISMATCH
❌ **Parser expects:** Sales data with "Categorias e Produtos", "Quantidade vendida", "Valor vendido"
❌ **File has:** Monthly purchase data with ITEM, MODELO, and 12 month columns (Jan-Dez)
❌ **Result:** Parser will throw error: "Cabeçalhos não encontrados"

### Special Notes
- This file contains **monthly purchase quantities** for each product
- This is NOT a "top products sold" file - it's a **customer purchases by month** file
- The data structure is completely different from what the parser expects
- The file needs a **dedicated parser** that aggregates monthly data

### Recommended Parser Changes
1. Create a NEW parser function: `parseMonthlyPurchasesExcel()`
2. Parse the 12 month columns (Jan through Dez)
3. Calculate total annual purchases: sum of all month columns
4. Return structure: `{ name: string, modelo: string, monthlyData: { jan: number, fev: number, ... }, total: number }`

---

## File 3: MODELO DE CHEGADA FUTURA.xlsx

### Actual Structure
- **File Path:** `/Users/macbook/Documents/DASHBOARD FRANCIEL/PLANILHAS/MODELO DE CHEGADA FUTURA.xlsx`
- **Sheet Name:** Planilha1
- **Total Rows:** 51 (including header)
- **Data Rows:** 50
- **Range:** A1:C51

### Column Structure
| Column | Header | Data Type | Sample Values |
|--------|--------|-----------|---------------|
| A | ITEM | string | "ACD-340", "DW-902 POWER", "DW-602/MAX" |
| B | MODELO | string | **ALL EMPTY** |
| C | QUANTIDADE | number | 24, 2342, 3242, 234, 34 |

### Data Characteristics
- **ITEM Column:** 50 product codes (same items as ESTOQUE file)
- **MODELO Column:** 50/50 rows are EMPTY (0% filled)
- **QUANTIDADE Column:** 50/50 rows filled
  - Integer values: 20 rows (40%)
  - Decimal values: 30 rows (60%)
  - Some values show floating-point precision issues (e.g., 694.8000000000001)
  - Larger quantities than ESTOQUE file

### Sample Data
```
Row 1: ACD-340, (empty), 24
Row 2: DW-902 POWER, (empty), 2342
Row 3: DW-602/MAX, (empty), 3242
Row 4: DE-115, (empty), 234
Row 5: CAP602BK, (empty), 34
```

### Current Parser Expectations
**Function:** `parseShipmentsExcel()` in `/Users/macbook/Documents/DASHBOARD FRANCIEL/src/utils/excelParser.js`

Expected columns:
- "Item" (Product item code)
- "Quantidade" (Quantity)

### PARTIAL MATCH
✅ **File has "ITEM" column** - matches "Item" (case-insensitive match should work)
✅ **File has "QUANTIDADE" column** - matches "Quantidade" (case-insensitive match should work)
⚠️ **Potential issue:** Parser uses `indexOf()` which is case-sensitive

### Recommended Parser Changes
1. Update `parseShipmentsExcel()` to use case-insensitive column matching
2. Change from `indexOf('Item')` to find column that matches /item/i
3. Change from `indexOf('Quantidade')` to find column that matches /quantidade/i
4. This will make it work with "ITEM" and "QUANTIDADE" (uppercase)

---

## Comparison Matrix

| File | Expected By Parser | Actual Headers | Match Status |
|------|-------------------|----------------|--------------|
| ESTOQUE | Nome, Disponível | ITEM, MODELO, QUANTIDADE | ❌ NO MATCH |
| COMPRAS | Categorias e Produtos, Quantidade vendida, Valor vendido | ITEM, MODELO, Jan-Dez | ❌ NO MATCH |
| CHEGADA | Item, Quantidade | ITEM, MODELO, QUANTIDADE | ⚠️ PARTIAL (case issue) |

---

## Data Quality Issues

### 1. Empty MODELO Columns
- **ESTOQUE:** 100% empty (50/50 rows)
- **COMPRAS:** 1.4% empty (1/72 rows)
- **CHEGADA:** 100% empty (50/50 rows)

**Impact:** The MODELO column exists but is unused in ESTOQUE and CHEGADA files. This suggests it may be a template column or for future use.

### 2. Floating Point Precision
**CHEGADA file** shows values like:
- 694.8000000000001
- 504.90000000000003
- 428.40000000000003

**Impact:** These are floating-point arithmetic artifacts. The parser's `parseToNumber()` function handles this correctly by using `parseFloat()`.

### 3. Mixed Data Types in QUANTIDADE
- Both ESTOQUE and CHEGADA have mix of integers and decimals
- ESTOQUE: 70% integers, 30% decimals
- CHEGADA: 40% integers, 60% decimals

**Impact:** Parser handles this well with the `parseToNumber()` function.

---

## Item Consistency

### Same Items Across Files
All three files contain the **same 50 product codes**:
- ACD-340
- DW-902 POWER
- DW-602/MAX
- DE-115
- CAP602BK
- (and 45 more...)

**Note:** COMPRAS file has 72 items (22 additional items not in ESTOQUE/CHEGADA)

This suggests:
- ESTOQUE = Current stock levels
- CHEGADA = Future arrivals/shipments
- COMPRAS = Broader product catalog with monthly purchase history

---

## Recommended Actions

### Priority 1: Fix ESTOQUE Parser
```javascript
// Current code (lines 86-91)
const nameIdx = headers.indexOf('Nome');
let qtyIdx = headers.findIndex(h => h && h.includes('Disponível'));

// Recommended change
const nameIdx = headers.findIndex(h =>
  h && (h.toLowerCase() === 'nome' || h.toLowerCase() === 'item')
);
let qtyIdx = headers.findIndex(h =>
  h && (h.toLowerCase().includes('disponível') || h.toLowerCase() === 'quantidade')
);
```

### Priority 2: Fix CHEGADA Parser
```javascript
// Current code (lines 209-210)
const itemIdx = headers.indexOf('Item');
const qtyIdx = headers.indexOf('Quantidade');

// Recommended change
const itemIdx = headers.findIndex(h =>
  h && h.toLowerCase() === 'item'
);
const qtyIdx = headers.findIndex(h =>
  h && h.toLowerCase() === 'quantidade'
);
```

### Priority 3: Create New COMPRAS Parser
The COMPRAS file needs a completely new parser since its structure doesn't match any existing parser:

```javascript
export const parseMonthlyPurchasesExcel = async (file) => {
  // Parse ITEM, MODELO columns
  // Parse 12 month columns (Jan, Fev, Mar, Abr, Mai, Jun, Jul, Ago, Set, Out, Nov, Dez)
  // Calculate totals and aggregations
  // Return monthly time-series data
};
```

---

## Testing Recommendations

1. **Test with actual files** in PLANILHAS directory
2. **Verify case-insensitive matching** works correctly
3. **Test with empty MODELO columns** to ensure they don't break parsing
4. **Test floating-point values** are handled correctly
5. **Test monthly data aggregation** for COMPRAS file

---

## Additional Files Created

For this analysis, the following helper scripts were created:

1. `/Users/macbook/Documents/DASHBOARD FRANCIEL/analyze-excel-structure.js`
   - Comprehensive structure analysis tool
   - Shows columns, data types, merged cells, formulas

2. `/Users/macbook/Documents/DASHBOARD FRANCIEL/detailed-analysis.js`
   - Lists all items and their data
   - Shows data quality metrics

3. `/Users/macbook/Documents/DASHBOARD FRANCIEL/compras-full-analysis.js`
   - Detailed analysis of COMPRAS file
   - Shows annual totals and monthly breakdowns

4. `/Users/macbook/Documents/DASHBOARD FRANCIEL/final-structure-report.js`
   - Complete structure report generator
   - Can be re-run anytime to verify file structure

All scripts can be run with: `node <script-name>.js`

---

## Conclusion

The analysis reveals that **all three files have structural mismatches** with the current parser:

- **ESTOQUE:** Column names don't match (ITEM vs Nome, QUANTIDADE vs Disponível)
- **COMPRAS:** Completely different structure (monthly data vs sales data)
- **CHEGADA:** Case-sensitivity issue (ITEM vs Item, QUANTIDADE vs Quantidade)

The parsers need to be updated to handle these actual file structures before they can successfully parse the files in the PLANILHAS directory.
