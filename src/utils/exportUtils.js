/**
 * exportUtils — Exportação de dados para Excel e PDF
 * Usa a biblioteca XLSX já instalada no projeto
 */
import * as XLSX from 'xlsx';

const MONTH_KEYS   = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const MONTH_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const fmtCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

// ────────────────────────────────────────────────────────────────
// Utility: trigger browser download of a workbook
// ────────────────────────────────────────────────────────────────
function downloadWorkbook(wb, filename) {
  XLSX.writeFile(wb, filename);
}

// ────────────────────────────────────────────────────────────────
// 1. Exportar Overview (KPIs + Top produtos)
// ────────────────────────────────────────────────────────────────
export function exportOverview({ monthlyPurchasesData, stockData, clientProfile, periodFilter }) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: KPIs resumo
  const totalSales = (monthlyPurchasesData ?? []).reduce((a, c) => a + (c.totalRevenue ?? 0), 0);
  const totalUnits = (monthlyPurchasesData ?? []).reduce((a, c) => a + (c.totalUnits ?? 0), 0);
  const avgTicket  = totalSales / (totalUnits || 1);

  const kpiRows = [
    ['ZT Dashboard BI — Relatório de Visão Geral'],
    ['Cliente:', clientProfile?.name || '—'],
    ['Período:', `Mês ${(periodFilter?.start ?? 0) + 1} a ${(periodFilter?.end ?? 11) + 1}`],
    ['Gerado em:', new Date().toLocaleString('pt-BR')],
    [],
    ['Indicador', 'Valor'],
    ['Faturamento Total', fmtCurrency(totalSales)],
    ['Giro Total (und)', totalUnits],
    ['Ticket Médio', fmtCurrency(avgTicket)],
    ['SKUs Analisados', monthlyPurchasesData?.length ?? 0],
    ['SKUs em Estoque', stockData?.length ?? 0],
  ];

  const wsKPI = XLSX.utils.aoa_to_sheet(kpiRows);
  XLSX.utils.book_append_sheet(wb, wsKPI, 'Resumo KPIs');

  // Sheet 2: Top Produtos
  const topRows = [
    ['Produto', 'Faturamento (R$)', 'Unidades'],
    ...(monthlyPurchasesData ?? [])
      .sort((a, b) => (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0))
      .map((p) => [p.name, p.totalRevenue ?? 0, p.totalUnits ?? 0]),
  ];
  const wsTop = XLSX.utils.aoa_to_sheet(topRows);
  XLSX.utils.book_append_sheet(wb, wsTop, 'Top Produtos');

  // Sheet 3: Evolução mensal
  const trendHeader = ['Produto', ...MONTH_LABELS, 'Total'];
  const trendRows = (monthlyPurchasesData ?? []).map((p) => [
    p.name,
    ...MONTH_KEYS.map((m) => p.monthlyRevenue?.[m] ?? 0),
    p.totalRevenue ?? 0,
  ]);
  const wsTrend = XLSX.utils.aoa_to_sheet([trendHeader, ...trendRows]);
  XLSX.utils.book_append_sheet(wb, wsTrend, 'Evolução Mensal');

  downloadWorkbook(wb, `ZT_Overview_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// ────────────────────────────────────────────────────────────────
// 2. Exportar Gap Analysis
// ────────────────────────────────────────────────────────────────
export function exportGapAnalysis({ monthlyPurchasesData, clientProfile }) {
  const wb = XLSX.utils.book_new();

  const rows = [
    ['ZT Dashboard BI — Análise de Gap (Omissões)'],
    ['Cliente:', clientProfile?.name || '—'],
    ['Gerado em:', new Date().toLocaleString('pt-BR')],
    [],
    ['Produto', 'Meses Ativos', 'Faturamento Realizado (R$)', 'Potencial Estimado (R$)', 'Gap (R$)', 'Aproveitamento (%)'],
  ];

  (monthlyPurchasesData ?? [])
    .sort((a, b) => (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0))
    .forEach((item) => {
      const activeMonths  = MONTH_KEYS.filter((m) => (item.monthlyRevenue?.[m] ?? 0) > 0);
      const avgActive     = activeMonths.length > 0
        ? activeMonths.reduce((s, m) => s + (item.monthlyRevenue[m] ?? 0), 0) / activeMonths.length
        : 0;
      const potential     = avgActive * 12;
      const realized      = item.totalRevenue ?? 0;
      const gap           = Math.max(0, potential - realized);
      const aproveitamento = potential > 0 ? ((realized / potential) * 100).toFixed(1) : '100';

      rows.push([item.name, activeMonths.length, realized, potential, gap, `${aproveitamento}%`]);
    });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Gap Analysis');
  downloadWorkbook(wb, `ZT_GapAnalysis_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// ────────────────────────────────────────────────────────────────
// 3. Exportar Previsão de Ruptura
// ────────────────────────────────────────────────────────────────
export function exportRestock({ ruptureRisks, clientProfile }) {
  const wb = XLSX.utils.book_new();

  const rows = [
    ['ZT Dashboard BI — Previsão de Ruptura'],
    ['Cliente:', clientProfile?.name || '—'],
    ['Gerado em:', new Date().toLocaleString('pt-BR')],
    [],
    ['Produto', 'Estoque Atual', 'Consumo Médio/mês', 'Meses Sem Compra', 'Qtde Recomendada', 'Investimento Est.', 'Chegada Prevista'],
  ];

  (ruptureRisks ?? []).forEach((r) => {
    rows.push([
      r.product,
      r.stockAvailable,
      r.avgMonthlyVolume,
      r.monthsSinceLastPurchase,
      r.recommendedRestockQty,
      r.totalInvestment ?? 0,
      r.futureArrivalDate ?? '—',
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Ruptura');
  downloadWorkbook(wb, `ZT_Ruptura_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// ────────────────────────────────────────────────────────────────
// 4. Exportar Embarques
// ────────────────────────────────────────────────────────────────
export function exportShipments({ shipmentsData, clientProfile }) {
  const wb = XLSX.utils.book_new();

  const rows = [
    ['ZT Dashboard BI — Embarques'],
    ['Cliente:', clientProfile?.name || '—'],
    ['Gerado em:', new Date().toLocaleString('pt-BR')],
    [],
    ['Código', 'Produto', 'Quantidade', 'Data de Chegada'],
  ];

  (shipmentsData?.detailed ?? []).forEach((s) => {
    rows.push([s.code, s.name, s.quantity, s.arrivalDateFormatted ?? '—']);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Embarques');
  downloadWorkbook(wb, `ZT_Embarques_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// ────────────────────────────────────────────────────────────────
// 5. Exportar relatório completo (todas as abas)
// ────────────────────────────────────────────────────────────────
export function exportFullReport({ monthlyPurchasesData, stockData, shipmentsData, clientProfile, periodFilter }) {
  exportOverview({ monthlyPurchasesData, stockData, clientProfile, periodFilter });
}

// ────────────────────────────────────────────────────────────────
// 6. PDF via window.print()
// ────────────────────────────────────────────────────────────────
export function printToPDF() {
  window.print();
}
