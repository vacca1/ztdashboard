/**
 * SmartBundlesTab — Kits Estratégicos
 * Kits baseados nos dados reais de compra e estoque
 */
import React, { useMemo } from 'react';
import { Package, Zap, Crown, ArrowRight, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportOverview } from '../utils/exportUtils';

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

export default function SmartBundlesTab() {
  const { stockData, filteredMonthlyData, addToCart, presentationSettings, clientProfile, periodFilter } = useApp();

  const bundles = useMemo(() => {
    if (!stockData || !filteredMonthlyData) return [];

    // Sort monthly data by revenue
    const sortedByRevenue = [...filteredMonthlyData].sort((a, b) => (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0));

    // Fast movers: top 3 by revenue that exist in stock
    const fastMovers = sortedByRevenue
      .filter((p) => stockData.find((s) => s.code === p.code || s.name === p.name))
      .slice(0, 3)
      .map((p) => {
        const inStock = stockData.find((s) => s.code === p.code || s.name === p.name);
        const costPerUnit = p.totalRevenue / (p.totalUnits || 1);
        return { ...p, quantity: inStock?.quantity ?? 0, costPerUnit };
      });

    const fastMoversCost   = fastMovers.reduce((s, p) => s + p.costPerUnit, 0);
    const fastMoversRetail = fastMoversCost * 2;

    // Mid tier: products 4-8 by revenue
    const midTier = sortedByRevenue
      .filter((p) => stockData.find((s) => s.code === p.code || s.name === p.name))
      .slice(3, 8)
      .map((p) => {
        const costPerUnit = p.totalRevenue / (p.totalUnits || 1);
        return { ...p, costPerUnit };
      });

    const midTierCost   = midTier.reduce((s, p) => s + p.costPerUnit, 0);
    const midTierRetail = midTierCost * 2.5;

    // Premium: top 15 by revenue
    const premium = sortedByRevenue
      .filter((p) => stockData.find((s) => s.code === p.code || s.name === p.name))
      .slice(0, 15)
      .map((p) => {
        const costPerUnit = p.totalRevenue / (p.totalUnits || 1);
        return { ...p, costPerUnit };
      });

    const premiumCost       = premium.reduce((s, p) => s + p.costPerUnit, 0);
    const premiumRetail     = premiumCost * 2.2;
    const discountedPremium = premiumCost * 0.85; // 15% off

    return [
      {
        id:          'bundle-1',
        name:        'Kit Giro Rápido',
        icon:        Zap,
        iconColor:   'gradient-warning',
        badge:       'Pé na Porta',
        highlight:   false,
        items:       fastMovers,
        reason:      'Campeões de venda com histórico comprovado. Zero risco, giro garantido.',
        investment:  fastMoversCost,
        revenue:     fastMoversRetail,
        profit:      fastMoversRetail - fastMoversCost,
        features:    ['Giro em até 15 dias', 'Margem de 100%', 'Baixo investimento'],
      },
      {
        id:          'bundle-2',
        name:        'Kit Expansão de Lucro',
        icon:        Package,
        iconColor:   'gradient-brand',
        badge:       'Escolha Inteligente',
        highlight:   true,
        items:       midTier,
        reason:      'Mix balanceado para maximizar margem e diferenciar da concorrência.',
        investment:  midTierCost,
        revenue:     midTierRetail,
        profit:      midTierRetail - midTierCost,
        features:    ['Margem agressiva (150%)', 'Diferenciação regional', 'Mix balanceado'],
      },
      {
        id:          'bundle-3',
        name:        'Kit Dominação Total',
        icon:        Crown,
        iconColor:   'gradient-dark',
        badge:       'Exclusividade',
        highlight:   false,
        originalInvestment: premiumCost,
        items:       premium,
        reason:      'Portfólio completo para ser a referência absoluta da marca na sua região.',
        investment:  discountedPremium,
        revenue:     premiumRetail,
        profit:      premiumRetail - discountedPremium,
        features:    ['Desconto parceiro -15%', 'Status Revendedor Ouro', 'Ticket médio duplicado'],
      },
    ];
  }, [stockData, filteredMonthlyData]);

  const addBundleToCart = (bundle) => {
    bundle.items.forEach((item) => {
      addToCart({
        id:             `kit-${item.code || item.name}`,
        product:        item.name,
        costPrice:      item.costPerUnit,
        suggestedRetail: item.costPerUnit * 2,
        qty:            1,
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            Kits Estratégicos
            <span className="soft-badge bg-brand-50 text-brand-600 border border-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20 text-[10px]">
              Automático
            </span>
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Estratégias de mix prontas para otimizar vitrine e multiplicar margens.
          </p>
        </div>
        <button
          onClick={() => exportOverview({ monthlyPurchasesData: filteredMonthlyData, stockData, clientProfile, periodFilter })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {/* Bundle cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {bundles.map((bundle) => {
          const Icon = bundle.icon;
          return (
            <div
              key={bundle.id}
              className={`soft-card relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                bundle.highlight ? 'ring-2 ring-brand-400 dark:ring-brand-500 scale-[1.02]' : ''
              }`}
            >
              {bundle.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 gradient-brand text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-[var(--shadow-soft-brand)] flex items-center gap-1 z-10 whitespace-nowrap">
                  <ShieldCheck className="w-3 h-3" />
                  RECOMENDADO PELA IA
                </div>
              )}

              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className={`soft-icon-box ${bundle.iconColor} w-12 h-12`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`soft-badge border text-[10px] ${
                    bundle.highlight
                      ? 'bg-brand-50 text-brand-600 border-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20'
                      : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                  }`}>
                    {bundle.badge}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{bundle.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{bundle.reason}</p>
              </div>

              {/* Features */}
              <div className="p-6 flex-1">
                <ul className="space-y-2">
                  {bundle.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${bundle.highlight ? 'text-brand-500' : 'text-success-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400 py-2 border-t border-gray-100 dark:border-gray-700">
                  <span>Total de itens</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{bundle.items.length} SKUs</span>
                </div>
              </div>

              {/* Footer: pricing */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 rounded-b-2xl">
                {bundle.originalInvestment && bundle.originalInvestment > bundle.investment && (
                  <p className="text-center text-xs text-gray-400 line-through mb-1">
                    {presentationSettings?.hideCosts ? 'R$ •••' : fmt(bundle.originalInvestment)}
                  </p>
                )}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Investimento</span>
                  <span className="text-xl font-extrabold text-gray-800 dark:text-white font-space">
                    {presentationSettings?.hideCosts ? 'R$ •••' : fmt(bundle.investment)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-success-50 dark:bg-success-500/10 border border-success-100 dark:border-success-500/20 mb-4">
                  <span className="text-xs font-bold text-success-600 dark:text-success-400 uppercase tracking-wider">Fat. Estimado</span>
                  <span className="text-lg font-extrabold text-success-600 dark:text-success-400">
                    {presentationSettings?.hideCosts ? 'R$ •••' : fmt(bundle.revenue)}
                  </span>
                </div>
                <button
                  onClick={() => addBundleToCart(bundle)}
                  className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                    bundle.highlight
                      ? 'gradient-brand text-white shadow-[var(--shadow-soft-brand)] hover:scale-105'
                      : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Adicionar ao Pedido
                  {bundle.highlight && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
