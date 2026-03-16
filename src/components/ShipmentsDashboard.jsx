/**
 * ShipmentsDashboard — Visualização completa dos embarques (chegada futura)
 */
import React, { useMemo, useState } from 'react';
import { Ship, Package, Calendar, Search, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportShipments } from '../utils/exportUtils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
} from 'recharts';

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

export default function ShipmentsDashboard() {
  const { shipmentsData, monthlyPurchasesData, clientProfile, presentationSettings } = useApp();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'qty' | 'name'

  const items = useMemo(() => {
    if (!shipmentsData?.detailed) return [];

    // Enrich with purchase history
    const result = shipmentsData.detailed.map((s) => {
      const history = monthlyPurchasesData?.find(
        (p) => p.code === s.code || p.name === s.name,
      );
      const hasHistory   = !!history;
      const avgMonthly   = history ? (history.totalUnits / 12) : 0;
      const monthsOfStock = avgMonthly > 0 ? (s.quantity / avgMonthly).toFixed(1) : null;
      const status =
        !hasHistory             ? 'new'      :
        s.quantity < avgMonthly ? 'low'      :
                                  'adequate' ;

      return { ...s, hasHistory, avgMonthly, monthsOfStock, totalRevHistory: history?.totalRevenue ?? 0, status };
    });

    // Filter
    const filtered = search.trim()
      ? result.filter((i) => (i.name ?? '').toLowerCase().includes(search.toLowerCase()) || (i.code ?? '').toLowerCase().includes(search.toLowerCase()))
      : result;

    // Sort
    return [...filtered].sort((a, b) => {
      if (sortBy === 'qty')  return b.quantity - a.quantity;
      if (sortBy === 'name') return (a.name ?? '').localeCompare(b.name ?? '');
      // date sort
      if (a.arrivalDateFormatted && b.arrivalDateFormatted) return a.arrivalDateFormatted.localeCompare(b.arrivalDateFormatted);
      if (a.arrivalDateFormatted) return -1;
      if (b.arrivalDateFormatted) return 1;
      return 0;
    });
  }, [shipmentsData, monthlyPurchasesData, search, sortBy]);

  // Chart: top items by quantity
  const chartData = useMemo(
    () => [...(shipmentsData?.detailed ?? [])].sort((a, b) => b.quantity - a.quantity).slice(0, 10),
    [shipmentsData],
  );

  const totalQty   = items.reduce((s, i) => s + (i.quantity ?? 0), 0);
  const newSkus    = items.filter((i) => i.status === 'new').length;
  const lowSkus    = items.filter((i) => i.status === 'low').length;

  if (!shipmentsData?.detailed?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="soft-icon-box gradient-dark w-16 h-16">
          <Ship className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Nenhum embarque carregado</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Carregue a planilha de Chegada Futura na tela de upload.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Dashboard de Embarques</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Chegadas previstas e análise do mix entrante</p>
        </div>
        <button
          onClick={() => exportShipments({ shipmentsData, clientProfile })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-[var(--shadow-soft-brand)]"
        >
          <Download className="w-4 h-4" />
          Exportar Excel
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de SKUs',  value: items.length,  icon: Package,        gradient: 'gradient-brand', shadow: '--shadow-soft-brand' },
          { label: 'Total de Peças', value: totalQty.toLocaleString('pt-BR'), icon: Ship, gradient: 'gradient-success', shadow: '--shadow-soft-success' },
          { label: 'SKUs Novos',     value: newSkus,        icon: AlertTriangle,  gradient: 'gradient-warning', shadow: '--shadow-soft-warning' },
          { label: 'Estoque Baixo',  value: lowSkus,        icon: AlertTriangle,  gradient: 'gradient-error', shadow: '--shadow-soft-error' },
        ].map(({ label, value, icon: Icon, gradient, shadow }) => (
          <div key={label} className="soft-card p-5 flex items-center gap-4">
            <div className={`soft-icon-box ${gradient} shrink-0`} style={{ boxShadow: `var(${shadow})` }}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="metric-label">{label}</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white font-space">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="soft-card p-6">
        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">Top 10 Itens por Quantidade</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v?.substring(0, 12) + (v?.length > 12 ? '…' : '')}
              />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <RechartsTooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-soft-md)' }}
              />
              <Bar dataKey="quantity" name="Qtde" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#7c3aed' : i < 3 ? '#a78bfa' : '#c4b5fd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="soft-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-bold text-gray-800 dark:text-white">Lista Completa de Embarques</h3>
          <div className="flex gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400 w-48"
              />
            </div>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="date">Data de chegada</option>
              <option value="qty">Quantidade</option>
              <option value="name">Nome</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                {['Código','Produto','Qtde','Chegada','Histórico','Cobertura','Status'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 pb-3 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 pr-4 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.code}</td>
                  <td className="py-3 pr-4 font-medium text-gray-800 dark:text-white max-w-[200px] truncate">{item.name}</td>
                  <td className="py-3 pr-4 font-bold text-gray-800 dark:text-white">{item.quantity?.toLocaleString('pt-BR')}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    {item.arrivalDateFormatted ? (
                      <span className="flex items-center gap-1 text-success-600 dark:text-success-400 text-xs font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.arrivalDateFormatted}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-xs">
                    {item.hasHistory ? (
                      <span className="text-success-600 dark:text-success-400 font-medium">
                        {item.avgMonthly.toFixed(0)} und/mês
                      </span>
                    ) : (
                      <span className="text-warning-500 font-medium">Sem histórico</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-xs">
                    {item.monthsOfStock ? (
                      <span className={`font-medium ${Number(item.monthsOfStock) < 1 ? 'text-error-500' : Number(item.monthsOfStock) < 2 ? 'text-warning-500' : 'text-success-600 dark:text-success-400'}`}>
                        {item.monthsOfStock} meses
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-3">
                    <span className={`soft-badge border text-[10px] ${
                      item.status === 'new'
                        ? 'bg-warning-50 text-warning-600 border-warning-100 dark:bg-warning-500/10 dark:text-warning-400 dark:border-warning-500/20'
                        : item.status === 'low'
                          ? 'bg-error-50 text-error-600 border-error-100 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20'
                          : 'bg-success-50 text-success-600 border-success-100 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20'
                    }`}>
                      {item.status === 'new' ? 'SKU Novo' : item.status === 'low' ? 'Estoque Baixo' : 'Adequado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
