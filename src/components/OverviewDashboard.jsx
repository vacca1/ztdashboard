import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { TrendingUp, Package, DollarSign, Activity, Target, RefreshCw, AlertCircle, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportOverview } from '../utils/exportUtils';

/* ─── Soft UI icon box ─── */
const IconBox = ({ icon: Icon, gradient = 'gradient-brand', shadow = 'shadow-soft-brand' }) => (
  <div className={`soft-icon-box ${gradient} shadow-[var(--shadow-soft-brand)]`}>
    <Icon className="w-5 h-5" />
  </div>
);

/* ─── Chart tooltip ─── */
const ChartTooltip = ({ active, payload, label, isCurrency }) => {
  const fmt = (v) =>
    isCurrency
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
      : Number(v).toLocaleString('pt-BR');

  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-soft-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-gray-500 dark:text-gray-400">{entry.name || 'Valor'}:</span>
          <span className="font-bold text-gray-800 dark:text-white">{fmt(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const OverviewDashboard = () => {
  const {
    stockData, filteredMonthlyData: monthlyPurchasesData,
    shipmentsData, hasShipments, presentationSettings,
    goals, clientProfile, periodFilter,
  } = useApp();
  const ticketMedioIdeal   = goals.ticketMedio;
  const frequenciaIdeal    = goals.frequencia;
  /* ─── KPIs ─── */
  const totalItemsSold = useMemo(
    () => (monthlyPurchasesData ?? []).reduce((a, c) => a + (c.totalUnits ?? 0), 0),
    [monthlyPurchasesData],
  );

  const totalSales = useMemo(
    () => (monthlyPurchasesData ?? []).reduce((a, c) => a + (c.totalRevenue ?? 0), 0),
    [monthlyPurchasesData],
  );

  const avgTicket = totalSales / (totalItemsSold || 1);

  /* ─── Benchmarks vêm do AppContext (configuráveis em Settings) ─── */

  /* ─── Radar ─── */
  const radarData = [
    { subject: 'Ticket Médio',    A: Math.min((avgTicket / ticketMedioIdeal) * 100, 100), fullMark: 100 },
    { subject: 'Volume',          A: Math.min((totalItemsSold / frequenciaIdeal) * 100, 100), fullMark: 100 },
    { subject: 'Mix Produtos',    A: 45,  fullMark: 100 },
    { subject: 'Frequência',      A: 85,  fullMark: 100 },
    { subject: 'Margem Estimada', A: 70,  fullMark: 100 },
  ];

  /* ─── Top Products ─── */
  const topProductsData = useMemo(() => {
    if (!monthlyPurchasesData) return [];
    return [...monthlyPurchasesData]
      .map((item) => ({
        name:  item.name || item.code || 'Produto',
        value: item.totalRevenue ?? 0,
        total: item.totalUnits ?? 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [monthlyPurchasesData]);

  /* ─── Most Reordered ─── */
  const mostReorderedProducts = useMemo(() => {
    if (!monthlyPurchasesData) return [];
    const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    return [...monthlyPurchasesData]
      .map((item) => ({
        name:         item.name,
        reorderCount: months.filter((m) => (item.monthlyUnits?.[m] ?? 0) > 0).length,
        totalUnits:   item.totalUnits ?? 0,
      }))
      .filter((i) => i.reorderCount > 0)
      .sort((a, b) => b.reorderCount - a.reorderCount);
  }, [monthlyPurchasesData]);

  /* ─── Never Purchased (in stock, not in purchases) ─── */
  const neverPurchasedProducts = useMemo(() => {
    if (!stockData || !monthlyPurchasesData) return [];
    const purchasedCodes = new Set(monthlyPurchasesData.map((p) => p.code));
    return stockData.filter((s) => !purchasedCodes.has(s.code) && s.quantity > 0);
  }, [stockData, monthlyPurchasesData]);

  /* ─── Revenue trend (monthly aggregation) ─── */
  const revenueTrend = useMemo(() => {
    if (!monthlyPurchasesData) return [];
    const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const labels  = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return months.map((m, i) => ({
      name: labels[i],
      value: monthlyPurchasesData.reduce((a, c) => a + (c.monthlyRevenue?.[m] ?? 0), 0),
      units: monthlyPurchasesData.reduce((a, c) => a + (c.monthlyUnits?.[m] ?? 0), 0),
    }));
  }, [monthlyPurchasesData]);

  const ticketPct = Math.min((avgTicket / ticketMedioIdeal) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Export button */}
      <div className="flex justify-end">
        <button
          onClick={() => exportOverview({ monthlyPurchasesData, stockData, clientProfile, periodFilter })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar Excel
        </button>
      </div>

      {/* ══════════════════════════════════════
          KPI Cards — Soft UI style
         ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* KPI 1 — Faturamento */}
        <div className="soft-card soft-card-hover p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="metric-label">Faturamento Total</p>
              <p className="metric-value mt-1">
                {presentationSettings?.hideCosts ? 'R$ •••' : formatCurrency(totalSales)}
              </p>
            </div>
            <IconBox icon={DollarSign} gradient="gradient-brand" />
          </div>
          <div className="flex items-center gap-2 text-xs text-success-600 dark:text-success-400 font-semibold bg-success-50 dark:bg-success-500/10 px-3 py-1.5 rounded-full w-fit border border-success-100 dark:border-success-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
            Top 15% na região SC
          </div>
        </div>

        {/* KPI 2 — Giro */}
        <div className="soft-card soft-card-hover p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="metric-label">Giro de Produtos</p>
              <p className="metric-value mt-1">
                {totalItemsSold.toLocaleString('pt-BR')}{' '}
                <span className="text-base font-normal text-gray-400">und</span>
              </p>
            </div>
            <div className="soft-icon-box gradient-success" style={{ boxShadow: 'var(--shadow-soft-success)' }}>
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Potencial para diversificação de mix
          </p>
        </div>

        {/* KPI 3 — Ticket Médio */}
        <div className="soft-card soft-card-hover p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="metric-label">Ticket Médio (TM)</p>
              <p className="metric-value mt-1">
                {presentationSettings?.hideCosts ? 'R$ •••' : formatCurrency(avgTicket)}
              </p>
            </div>
            <div className="soft-icon-box gradient-warning" style={{ boxShadow: 'var(--shadow-soft-warning)' }}>
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <span>TM atual</span>
              <span className="text-brand-500 font-semibold">Meta SC: {formatCurrency(ticketMedioIdeal)}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full gradient-brand transition-all duration-700"
                style={{ width: `${ticketPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4 — Inteligência */}
        <div className="soft-card soft-card-hover p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="metric-label">Itens em Embarque</p>
              <p className="metric-value mt-1">
                {shipmentsData?.detailed?.length ?? 0}{' '}
                <span className="text-base font-normal text-gray-400">SKUs</span>
              </p>
            </div>
            <div className="soft-icon-box gradient-dark" style={{ boxShadow: 'var(--shadow-soft-xs)' }}>
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 text-xs">
            {mostReorderedProducts[0] && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <RefreshCw className="w-3 h-3 text-brand-400 shrink-0" />
                <span className="line-clamp-1 font-medium">{mostReorderedProducts[0].name}</span>
                <span className="text-gray-400">({mostReorderedProducts[0].reorderCount}x)</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-error-500">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{neverPurchasedProducts.length} produtos nunca comprados</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          Revenue Trend (área mensal)
         ══════════════════════════════════════ */}
      <div className="soft-card p-6">
        <div className="mb-5">
          <h3 className="text-base font-bold text-gray-800 dark:text-white">Evolução de Faturamento Mensal</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Receita consolidada ao longo do ano</p>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                hide={presentationSettings?.hideCosts}
                tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
              />
              <RechartsTooltip content={<ChartTooltip isCurrency />} />
              <Area
                type="monotone"
                dataKey="value"
                name="Faturamento"
                stroke="#7c3aed"
                strokeWidth={2.5}
                fill="url(#brandGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══════════════════════════════════════
          Charts — Top Products + Radar
         ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bar Chart: Top 10 */}
        <div className="soft-card p-6 lg:col-span-2 flex flex-col">
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Faturamento por Produto (Top 10)</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Itens com maior receita no período</p>
          </div>
          <div className="flex-1 min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData.slice(0, 10)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.length > 12 ? v.substring(0, 12) + '…' : v}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  hide={presentationSettings?.hideCosts}
                  tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                />
                <RechartsTooltip content={<ChartTooltip isCurrency />} />
                <Bar dataKey="value" name="Faturamento" radius={[6, 6, 0, 0]}>
                  {topProductsData.slice(0, 10).map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? '#7c3aed' : i < 3 ? '#a78bfa' : '#c4b5fd'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar: Diagnóstico */}
        <div className="soft-card p-6 flex flex-col">
          <div className="mb-3">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Diagnóstico Competitivo</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sua loja vs. Médias do Mercado SC</p>
          </div>
          <div className="flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="rgba(124,58,237,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Sua Loja"
                  dataKey="A"
                  stroke="#7c3aed"
                  fill="#7c3aed"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-soft-md)' }}
                  formatter={(v) => [`${Number(v).toFixed(0)}%`, 'Score']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-center text-xs text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-500/10 px-3 py-2 rounded-xl border border-warning-100 dark:border-warning-500/20">
            ⚠️ Alta lacuna no <strong>Mix de Produtos</strong> vs. volume de vendas
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          Produtos Mais Repostos
         ══════════════════════════════════════ */}
      {mostReorderedProducts.length > 0 && (
        <div className="soft-card p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Produtos Mais Repostos</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Itens comprados com maior frequência ao longo dos meses</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {mostReorderedProducts.slice(0, 8).map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.reorderCount} meses · {item.totalUnits.toLocaleString('pt-BR')} und
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          Nunca Comprados (em estoque)
         ══════════════════════════════════════ */}
      {neverPurchasedProducts.length > 0 && (
        <div className="soft-card p-6 border-l-4 border-l-error-400">
          <div className="mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-white">
                {neverPurchasedProducts.length} Produtos em Estoque Nunca Comprados
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Estes itens estão disponíveis mas nenhum cliente comprou — oportunidade de venda ativa
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 pb-2 pr-4">Código</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 pb-2 pr-4">Produto</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 pb-2">Qtde em Estoque</th>
                </tr>
              </thead>
              <tbody>
                {neverPurchasedProducts.slice(0, 10).map((item, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-2.5 pr-4 text-xs font-mono text-gray-500 dark:text-gray-400">{item.code}</td>
                    <td className="py-2.5 pr-4 text-xs font-medium text-gray-800 dark:text-white">{item.name}</td>
                    <td className="py-2.5 text-right">
                      <span className="soft-badge bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400 border border-error-100 dark:border-error-500/20">
                        {item.quantity.toLocaleString('pt-BR')} und
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewDashboard;
