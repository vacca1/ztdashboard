import React, { useMemo } from 'react';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { AlertTriangle, TrendingDown, TrendingUp, Info, ArrowUpRight } from 'lucide-react';

const fmt = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const ChartTooltip = ({ active, payload, label, hideCosts }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-soft-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1 truncate max-w-[200px]">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.fill }} />
          <span className="text-gray-500 dark:text-gray-400">{entry.name}:</span>
          <span className={`font-bold ${entry.name === 'Potencial' ? 'text-brand-500' : 'text-success-600 dark:text-success-400'}`}>
            {hideCosts ? 'R$ •••' : fmt(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const GapAnalysisTab = ({ shipmentsData, monthlyPurchasesData, hasShipments, presentationSettings }) => {
  const MONTHS_LOW = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

  /**
   * Gap Analysis:
   * - "Realizado": receita real do item (totalRevenue do VALOR)
   * - "Potencial": se o item mantivesse a média dos meses ativos em todos os 12 meses
   * - gap = potencial - realizado
   */
  const analysis = useMemo(() => {
    if (!monthlyPurchasesData?.length) {
      return { missedRevenue: 0, gapItems: [], chartData: [], neverPurchased: [] };
    }

    let missedRevenueTotal = 0;
    const gapItems = [];
    const chartData = [];

    // Sort by revenue desc — top 10 for chart
    const sorted = [...monthlyPurchasesData]
      .sort((a, b) => (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0))
      .slice(0, 10);

    sorted.forEach((item) => {
      const realized = item.totalRevenue ?? 0;

      // Active months (months with revenue > 0)
      const activeMonths = MONTHS_LOW.filter((m) => (item.monthlyRevenue?.[m] ?? 0) > 0);
      const avgActiveRevenue = activeMonths.length > 0
        ? activeMonths.reduce((s, m) => s + (item.monthlyRevenue[m] ?? 0), 0) / activeMonths.length
        : 0;

      // Potential = avg of active months × 12
      const potential = avgActiveRevenue * 12;
      const gap = Math.max(0, potential - realized);

      missedRevenueTotal += gap;

      if (gap > 0) {
        gapItems.push({ name: item.name, realized, potential, gap, activeMonths: activeMonths.length });
      }

      chartData.push({
        name: (item.name ?? '').substring(0, 15) + ((item.name ?? '').length > 15 ? '…' : ''),
        Realizado: realized,
        Potencial: gap,
      });
    });

    // Products in shipments but never purchased historically
    const purchasedCodes = new Set((monthlyPurchasesData ?? []).map((p) => p.code));
    const neverPurchased = (shipmentsData?.detailed ?? []).filter(
      (s) => !purchasedCodes.has(s.code),
    );

    return { missedRevenue: missedRevenueTotal, gapItems, chartData, neverPurchased };
  }, [monthlyPurchasesData, shipmentsData]);

  return (
    <div className="space-y-6">

      {/* ══════════════ Hero: Custo de Oportunidade ══════════════ */}
      <div className="soft-card p-8 border-l-4 border-l-error-400 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none select-none">
          <AlertTriangle className="w-64 h-64 text-error-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div>
            <span className="soft-badge bg-error-50 text-error-600 border border-error-100 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20 mb-4 inline-flex">
              <TrendingDown className="w-3.5 h-3.5" />
              Custo de Oportunidade
            </span>
            <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-2 tracking-tight">
              {presentationSettings?.hideCosts ? 'R$ •••' : fmt(analysis.missedRevenue)}
            </h2>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Receita bruta deixada na mesa nos últimos 12 meses.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
              Calculado comparando o faturamento realizado com o <strong className="text-gray-700 dark:text-gray-200">potencial máximo</strong>
              {' '}caso os produtos tivessem mantido sua média de venda durante todos os meses.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-success-50 dark:bg-success-500/10 border border-success-100 dark:border-success-500/20">
              <div className="soft-icon-box gradient-success shrink-0 w-10 h-10">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">Potencial de Crescimento</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Regularizar a frequência de compra pode aumentar seu faturamento sem adicionar novos produtos.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20">
              <div className="soft-icon-box gradient-brand shrink-0 w-10 h-10">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">Meses com Ruptura</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Produtos que ficaram sem compra em determinados meses geraram perda de faturamento nesse período.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ Chart + Top Gaps ══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Stacked Bar Chart */}
        <div className="soft-card p-6 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Realizado vs. Potencial — Top 10 Produtos</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Roxo = receita não capturada (meses zerados); Verde = receita efetivada
            </p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analysis.chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  hide={presentationSettings?.hideCosts}
                  tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                />
                <RechartsTooltip content={<ChartTooltip hideCosts={presentationSettings?.hideCosts} />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                  formatter={(v) => <span className="text-gray-600 dark:text-gray-400">{v}</span>}
                />
                <Bar dataKey="Realizado" stackId="a" fill="#12b76a" radius={[0, 0, 4, 4]} barSize={30} />
                <Bar dataKey="Potencial" stackId="a" fill="#7c3aed" fillOpacity={0.75} radius={[4, 4, 0, 0]} barSize={30} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Gap Items */}
        <div className="soft-card p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Maiores Lacunas</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Produtos com maior receita deixada na mesa</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {analysis.gapItems.length > 0 ? (
              analysis.gapItems.slice(0, 6).map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs font-semibold text-gray-800 dark:text-white line-clamp-2 leading-tight">{item.name}</p>
                    <span className="soft-badge bg-error-50 text-error-600 border border-error-100 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20 shrink-0">
                      -{presentationSettings?.hideCosts ? '•••' : fmt(item.gap)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{item.activeMonths}/12 meses ativos</span>
                    <span className="text-success-600 dark:text-success-400">{presentationSettings?.hideCosts ? '•••' : fmt(item.realized)}</span>
                  </div>
                  {/* Progress bar: realized / potential */}
                  <div className="mt-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                    <div
                      className="h-1 rounded-full gradient-success"
                      style={{ width: `${Math.min((item.realized / (item.potential || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 opacity-60">
                <div className="w-12 h-12 rounded-full gradient-success flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Portfólio consistente!</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Não foram detectadas lacunas relevantes.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════ Embarques nunca comprados ══════════════ */}
      {hasShipments && analysis.neverPurchased.length > 0 && (
        <div className="soft-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="soft-icon-box gradient-warning w-10 h-10 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-white">
                {analysis.neverPurchased.length} Itens no Embarque Nunca Comprados Historicamente
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Chegadas previstas sem histórico de venda — requer atenção</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analysis.neverPurchased.slice(0, 9).map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-warning-50 dark:bg-warning-500/10 border border-warning-100 dark:border-warning-500/20">
                <div className="w-8 h-8 rounded-lg gradient-warning flex items-center justify-center text-white shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.quantity ?? '—'} und previstas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GapAnalysisTab;
