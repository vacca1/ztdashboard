/**
 * SalesOpportunitiesTab — Venda Certa
 * Sugestões de oportunidades baseadas em dados reais de compra e estoque
 */
import React, { useMemo, useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, TrendingUp, Star, LayoutGrid, List, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportOverview } from '../utils/exportUtils';

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

export default function SalesOpportunitiesTab() {
  const { stockData, filteredMonthlyData, shipmentsData, addToCart, presentationSettings, clientProfile, periodFilter } = useApp();
  const [filter, setFilter]     = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const opportunities = useMemo(() => {
    if (!stockData || !filteredMonthlyData) return [];

    const sorted = [...filteredMonthlyData].sort((a, b) => (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0));
    const suggestions = [];

    sorted.forEach((item, index) => {
      // Find matching stock
      const inStock = stockData.find((s) =>
        s.code === item.code ||
        s.name === item.name ||
        s.name.includes(item.code) ||
        item.code.includes(s.code),
      );

      if (!inStock || inStock.quantity < 2) return;

      const MONTH_KEYS   = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
      const activeMonths = MONTH_KEYS.filter((m) => (item.monthlyUnits?.[m] ?? 0) > 0);
      const missingMonths = 12 - activeMonths.length;

      // High revenue + missing months = cross-sell gap
      const isCrossSell = missingMonths >= 4 && item.totalRevenue > 0;
      const isRestock   = activeMonths.length >= 8;

      if (!isCrossSell && !isRestock) return;

      const type = isCrossSell ? 'cross-sell' : 'restock';

      let socialProof = 'Item em Ascensão';
      if (index < 3) socialProof = 'Top 3 Absoluto';
      else if (index < 7) socialProof = 'Alta Demanda';

      const avgRevPerMonth     = activeMonths.length > 0 ? item.totalRevenue / activeMonths.length : 0;
      const potentialAddRevenue = avgRevPerMonth * missingMonths;
      const costPerUnit         = item.totalRevenue / (item.totalUnits || 1);

      suggestions.push({
        id:             `opp-${item.code}-${index}`,
        type,
        badge:          isCrossSell ? 'Oportunidade' : 'Giro Rápido',
        product:        item.name,
        stock:          inStock.quantity,
        socialProof,
        activeMonths:   activeMonths.length,
        missingMonths,
        costPerUnit,
        potentialRevenue: potentialAddRevenue,
        totalRevenue:   item.totalRevenue,
        confidence:     100 - index,
      });
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 12);
  }, [stockData, filteredMonthlyData]);

  const filteredOpps = opportunities.filter((o) => filter === 'all' || o.type === filter);

  const handleAdd = (opp) => {
    addToCart({
      id:             opp.id,
      product:        opp.product,
      costPrice:      opp.costPerUnit,
      suggestedRetail: opp.costPerUnit * 2,
      qty:            1,
    });
  };

  return (
    <div className="space-y-5">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Oportunidades de Venda</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Baseado em padrão de compra e estoque disponível.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type filter */}
          {[
            { key: 'all',        label: 'Todos',       color: 'gradient-brand' },
            { key: 'cross-sell', label: 'Oportunidade', color: 'gradient-brand' },
            { key: 'restock',    label: 'Reposição',    color: 'gradient-success' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === key
                  ? `${color} text-white shadow-[var(--shadow-soft-brand)]`
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
          {/* View mode */}
          {[
            { mode: 'grid', icon: LayoutGrid },
            { mode: 'list', icon: List },
          ].map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`p-2 rounded-xl transition-colors ${viewMode === mode ? 'gradient-brand text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
          {/* Export */}
          <button
            onClick={() => exportOverview({ monthlyPurchasesData: filteredMonthlyData, stockData, clientProfile, periodFilter })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredOpps.length > 0 ? filteredOpps.map((opp) => (
          <div key={opp.id} className="soft-card soft-card-hover overflow-hidden flex flex-col">
            {/* Banner */}
            <div className={`h-20 relative p-4 flex items-start justify-between ${opp.type === 'cross-sell' ? 'gradient-brand' : 'gradient-success'}`}>
              <span className="soft-badge bg-white/20 border border-white/30 text-white text-[10px]">
                {opp.badge}
              </span>
              <span className="soft-badge bg-black/20 border-0 text-white text-[10px]">
                {opp.type === 'cross-sell' ? <Sparkles className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                {opp.socialProof}
              </span>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col gap-3">
              <h4 className="text-sm font-bold text-gray-800 dark:text-white line-clamp-2" title={opp.product}>
                {opp.product}
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                  <p className="text-gray-400 dark:text-gray-500 mb-0.5">Meses ativos</p>
                  <p className="font-bold text-gray-700 dark:text-gray-300">{opp.activeMonths}/12</p>
                </div>
                <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20">
                  <p className="text-brand-400 mb-0.5">Potencial</p>
                  <p className="font-bold text-brand-600 dark:text-brand-300">
                    {presentationSettings?.hideCosts ? '•••' : fmt(opp.potentialRevenue)}
                  </p>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                  <span className="text-gray-600 dark:text-gray-300 font-medium">{opp.stock} em estoque</span>
                </div>
                <button
                  onClick={() => handleAdd(opp)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-brand text-white text-xs font-semibold shadow-[var(--shadow-soft-brand)] hover:scale-105 active:scale-95 transition-transform"
                >
                  Adicionar <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full soft-card p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-success-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">Nenhuma oportunidade encontrada para este filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
}
