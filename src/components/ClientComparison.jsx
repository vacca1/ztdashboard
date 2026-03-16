/**
 * ClientComparison — Comparativo entre clientes salvos
 * Permite visualizar side-by-side KPIs de até 2 clientes
 */
import React, { useState, useMemo } from 'react';
import { Users, TrendingUp, Package, DollarSign, BarChart3, Trash2, UserPlus } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router';

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

function computeKPIs(data) {
  if (!data?.monthlyPurchasesData) return null;
  const totalSales = data.monthlyPurchasesData.reduce((a, c) => a + (c.totalRevenue ?? 0), 0);
  const totalUnits = data.monthlyPurchasesData.reduce((a, c) => a + (c.totalUnits ?? 0), 0);
  const avgTicket  = totalSales / (totalUnits || 1);
  const skuCount   = data.monthlyPurchasesData.length;
  const stockCount = data.stockData?.length ?? 0;
  return { totalSales, totalUnits, avgTicket, skuCount, stockCount };
}

const COLORS = ['#7c3aed', '#12b76a', '#f79009', '#f04438'];

export default function ClientComparison() {
  const { clients, removeClient, stockData, monthlyPurchasesData, shipmentsData, clientProfile, saveCurrentClient } = useApp();
  const [saveNameInput, setSaveNameInput] = useState('');

  const currentKPIs = useMemo(() => computeKPIs({ monthlyPurchasesData, stockData }), [monthlyPurchasesData, stockData]);

  // All entries: current + saved
  const allEntries = useMemo(() => {
    const current = currentKPIs ? [{
      id: 'current',
      name: clientProfile.name || 'Cliente Atual',
      kpis: currentKPIs,
    }] : [];
    const saved = clients.map((c) => ({
      id:   c.id,
      name: c.name,
      kpis: computeKPIs(c),
    })).filter((e) => e.kpis);
    return [...current, ...saved].slice(0, 4);
  }, [clients, currentKPIs, clientProfile]);

  // Radar comparison
  const radarData = useMemo(() => {
    if (allEntries.length < 2) return [];
    const maxSales  = Math.max(...allEntries.map((e) => e.kpis.totalSales));
    const maxUnits  = Math.max(...allEntries.map((e) => e.kpis.totalUnits));
    const maxTicket = Math.max(...allEntries.map((e) => e.kpis.avgTicket));
    const maxSku    = Math.max(...allEntries.map((e) => e.kpis.skuCount));

    const metrics = ['Faturamento', 'Volume', 'Ticket Médio', 'Mix SKUs'];
    return metrics.map((subject, mi) => {
      const row = { subject };
      allEntries.forEach((e) => {
        const vals = [e.kpis.totalSales / maxSales, e.kpis.totalUnits / maxUnits, e.kpis.avgTicket / maxTicket, e.kpis.skuCount / maxSku];
        row[e.name] = Math.round(vals[mi] * 100);
      });
      return row;
    });
  }, [allEntries]);

  // Bar comparison
  const barData = useMemo(() =>
    allEntries.map((e) => ({
      name:          e.name.substring(0, 12) + (e.name.length > 12 ? '…' : ''),
      Faturamento:   e.kpis.totalSales,
      Ticket:        e.kpis.avgTicket,
      Volume:        e.kpis.totalUnits,
    })),
  [allEntries]);

  const handleSave = () => {
    if (!saveNameInput.trim()) return;
    saveCurrentClient(saveNameInput.trim());
    setSaveNameInput('');
  };

  if (!monthlyPurchasesData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="soft-icon-box gradient-brand w-16 h-16">
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Nenhum dado carregado</h3>
        <Link to="/upload" className="text-sm text-brand-500 font-medium hover:underline">
          Ir para Upload →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Comparativo de Clientes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Compare KPIs entre diferentes clientes ou períodos</p>
        </div>
      </div>

      {/* ── Save current ── */}
      <div className="soft-card p-5 flex flex-wrap items-center gap-3">
        <UserPlus className="w-5 h-5 text-brand-500 shrink-0" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
          Salvar dados do cliente atual para comparação:
        </p>
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Nome do cliente..."
            value={saveNameInput}
            onChange={(e) => setSaveNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-400"
          />
          <button
            onClick={handleSave}
            disabled={!saveNameInput.trim()}
            className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium disabled:opacity-40"
          >
            Salvar
          </button>
        </div>
      </div>

      {/* ── Client cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {allEntries.map((entry, i) => (
          <div key={entry.id} className="soft-card p-5 relative">
            {entry.id !== 'current' && (
              <button
                onClick={() => removeClient(entry.id)}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg hover:bg-error-50 dark:hover:bg-error-500/10 text-gray-400 hover:text-error-500 flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate pr-4">{entry.name}</p>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Faturamento', value: fmt(entry.kpis.totalSales) },
                { label: 'Volume',      value: `${entry.kpis.totalUnits.toLocaleString('pt-BR')} und` },
                { label: 'Ticket Médio', value: fmt(entry.kpis.avgTicket) },
                { label: 'SKUs',        value: entry.kpis.skuCount },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">{label}</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {allEntries.length === 0 && (
          <div className="col-span-full text-center py-8 text-sm text-gray-400 dark:text-gray-500">
            Salve o cliente atual e carregue outros dados para comparar.
          </div>
        )}
      </div>

      {/* ── Charts (only if 2+ entries) ── */}
      {allEntries.length >= 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Radar */}
          <div className="soft-card p-6">
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">Radar Comparativo</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(0,0,0,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  {allEntries.map((e, i) => (
                    <Radar
                      key={e.id}
                      name={e.name}
                      dataKey={e.name}
                      stroke={COLORS[i % COLORS.length]}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-soft-md)' }}
                    formatter={(v) => `${v}%`}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar: Faturamento */}
          <div className="soft-card p-6">
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">Faturamento Comparado</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-soft-md)' }}
                    formatter={(v) => fmt(v)}
                  />
                  <Bar dataKey="Faturamento" radius={[6, 6, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
