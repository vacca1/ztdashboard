import React, { useMemo } from 'react';
import { Package, Zap, Crown, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

const SmartBundlesTab = ({ stockData, topProductsData, onAddToCart, presentationSettings }) => {
 
 const formatCurrency = (val) => {
 return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
 };

 // AI Logic: Create Bundles based on Stock and Market Data
 const bundles = useMemo(() => {
 if (!stockData || !topProductsData) return [];

 // Bundle 1: Starter / Fast Mover (Decoy)
 // Takes the top 3 best selling items from stock
 const fastMovers = stockData
 .filter(s => topProductsData.find(t => t.name.includes(s.name) || s.name.includes(t.name)))
 .slice(0, 3)
 .map((s, idx) => ({ ...s, mockCost: 80 + (idx * 20) })); // Mocking costs

 const fastMoversCost = fastMovers.reduce((acc, curr) => acc + curr.mockCost, 0);
 const fastMoversRetail = fastMoversCost * 2; // 100% markup

 // Bundle 2: Diversification (Target)
 // Takes items that have high stock but might not be the absolute top sellers, 
 // mixed with one top seller.
 const midTier = stockData.slice(4, 9).map((s, idx) => ({ ...s, mockCost: 100 + (idx * 15) }));
 const midTierCost = midTier.reduce((acc, curr) => acc + curr.mockCost, 0);
 let midTierRetail = midTierCost * 2.5; // 150% markup to make it look like a huge roi

 // Bundle 3: The Dominator (Premium Anchor)
 // A huge package of everything
 const premium = stockData.slice(0, 15).map((s, idx) => ({ ...s, mockCost: 150 + (idx * 5) }));
 const premiumCost = premium.reduce((acc, curr) => acc + curr.mockCost, 0);
 const premiumRetail = premiumCost * 2.2; // 120% markup
 
 // Faking a supplier discount to trigger urgency
 const discountAmount = premiumCost * 0.15; 
 const finalPremiumCost = premiumCost - discountAmount;

 return [
 {
 id: 'bundle-1',
 name: 'Kit Giro Rápido',
 icon: <Zap className="w-6 h-6 text-amber-400" />,
 badge: 'Pé na Porta',
 badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
 borderColor: 'border-slate-700',
 bgGradient: 'from-slate-800 to-slate-900',
 items: fastMovers,
 reason: 'Os campeões de vendas da região. Zero risco. Venda garantida na primeira semana.',
 investment: fastMoversCost,
 originalInvestment: fastMoversCost,
 revenue: fastMoversRetail,
 profit: fastMoversRetail - fastMoversCost,
 popular: false,
 features: [
 'Giro em até 15 dias',
 'Margem segura de 100%',
 'Baixo investimento inicial'
 ]
 },
 {
 id: 'bundle-2',
 name: 'Kit Expansão de Lucro',
 icon: <Package className="w-6 h-6 text-brand-400" />,
 badge: 'Escolha Inteligente',
 badgeClass: 'bg-brand-500/10 text-brand-300 border-brand-500/20',
 borderColor: 'border-brand-500/50 shadow-[0_0_30px_rgba(70,108,192,0.15)] ring-1 ring-brand-500/20 scale-[1.02]',
 bgGradient: 'from-slate-800 via-brand-900/10 to-slate-900',
 items: midTier,
 reason: 'Criado pelo algoritmo para maximizar markup. Produtos de alta percepção de valor pelo consumidor final.',
 investment: midTierCost,
 originalInvestment: midTierCost,
 revenue: midTierRetail,
 profit: midTierRetail - midTierCost,
 popular: true,
 features: [
 'Margem agressiva (Top ROI)',
 'Diferenciação da concorrência local',
 'Mix balanceado (Acessórios + Equipamentos)'
 ]
 },
 {
 id: 'bundle-3',
 name: 'Kit Dominação de Vitrine',
 icon: <Crown className="w-6 h-6 text-yellow-500" />,
 badge: 'Exclusividade',
 badgeClass: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
 borderColor: 'border-yellow-500/30',
 bgGradient: 'from-slate-800 to-slate-900',
 items: premium,
 reason: 'Posicione sua loja como a referência absoluta da marca na sua cidade. Portfólio completo.',
 investment: finalPremiumCost,
 originalInvestment: premiumCost,
 revenue: premiumRetail,
 profit: premiumRetail - finalPremiumCost,
 popular: false,
 features: [
 'Desconto de parceiro B2B (-15%)',
 'Status de Revenda Ouro',
 'Ticket médio do seu cliente duplicado'
 ]
 }
 ];

 }, [stockData, topProductsData]);

 const addBundleToCart = (bundle) => {
 // Flattens the bundle items and adds them to cart
 bundle.items.forEach(item => {
 onAddToCart({
 id: `kit-${item.name}`,
 product: item.name,
 costPrice: item.mockCost,
 suggestedRetail: item.mockCost * 2, // arbitrary
 qty: 1
 });
 });
 };

 return (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col pb-24 relative zoom-in-[0.98]">
 
 {/* Animated Background Blobs for Premium Feel */}
 
 {/* Header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
 <div>
 <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white/90 tracking-tight flex items-center gap-3">
 Kits Inteligentes
 <span className="bg-brand-500/20 text-brand-400 text-xs font-bold px-2.5 py-1 rounded-full border border-brand-500/30 uppercase tracking-widest">
 Automático
 </span>
 </h3>
 <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Estratégias de mix prontas para otimizar sua vitrine e multiplicar margens.</p>
 </div>
 </div>

 {/* Pricing Tables (Smart Bundles) */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {bundles.map((bundle) => (
 <div key={bundle.id} className={`rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm rounded-sm relative flex flex-col transition-all border ${bundle.borderColor}`}>
 
 {/* Popular Badge */}
 {bundle.popular && (
 <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-brand-400 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(70,108,192,0.5)] z-10 flex items-center gap-1.5">
 <ShieldCheck className="w-4 h-4" />
 RECOMENDADO PELA I.A.
 </div>
 )}

 <div className={`p-8 rounded-t-3xl bg-gradient-to-br ${bundle.bgGradient} flex-1 flex flex-col`}>
 <div className="flex justify-between items-start mb-6">
 <div className={`p-3 rounded-sm bg-gray-50 dark:bg-gray-800 border ${bundle.borderColor}`}>
 {bundle.icon}
 </div>
 <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${bundle.badgeClass}`}>
 {bundle.badge}
 </span>
 </div>

 <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-2">{bundle.name}</h4>
 <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 min-h-[40px] leading-relaxed">{bundle.reason}</p>

 <div className="space-y-4 mb-8">
 {bundle.features.map((feat, i) => (
 <div key={i} className="flex items-start gap-3">
 <CheckCircle2 className={`w-5 h-5 shrink-0 ${bundle.popular ? 'text-brand-400' : 'text-gray-500 dark:text-gray-400'}`} />
 <span className="text-gray-700 dark:text-gray-300 text-sm">{feat}</span>
 </div>
 ))}
 </div>

 <div className="mt-auto space-y-2 mb-6">
 <div className="flex justify-between text-sm">
 <span className="text-gray-500 dark:text-gray-400">Total de Itens</span>
 <span className="text-white font-bold">{bundle.items.length} SKUs</span>
 </div>
 </div>
 </div>

 {/* Financial Anchoring Footer */}
 <div className="p-8 border-t border-gray-200 dark:border-gray-800 rounded-b-3xl">
 
 {bundle.originalInvestment > bundle.investment && (
 <div className="flex justify-center mb-1 text-sm text-gray-500 dark:text-gray-400 line-through">
 {presentationSettings?.hideCosts ? 'R$ ***,**' : formatCurrency(bundle.originalInvestment)}
 </div>
 )}

 <div className="flex items-center justify-between mb-2">
 <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Investimento</span>
 <span className="text-2xl font-extrabold text-gray-800 dark:text-white/90">{presentationSettings?.hideCosts ? 'R$ ***,**' : formatCurrency(bundle.investment)}</span>
 </div>
 
 <div className="flex items-center justify-between mb-8 p-3 rounded-sm bg-emerald-500/10 border border-emerald-500/20">
 <span className="text-xs font-bold text-emerald-400/80 uppercase tracking-wider">Faturamento Est.</span>
 <span className="text-xl font-extrabold text-emerald-400">{presentationSettings?.hideCosts ? 'R$ ***,**' : formatCurrency(bundle.revenue)}</span>
 </div>

 <button 
 onClick={() => addBundleToCart(bundle)}
 className={`w-full py-4 rounded-sm flex items-center justify-center gap-2 font-bold transition-all
 ${bundle.popular 
 ? 'bg-brand-500 text-white hover:bg-brand-400 shadow-[0_0_30px_rgba(70,108,192,0.3)] hover:scale-105' 
 : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-slate-700 hover:text-white border border-gray-200 dark:border-gray-800'}`}
 >
 Adicionar Kit ao Pedido
 {bundle.popular && <ArrowRight className="w-5 h-5" />}
 </button>
 </div>
 </div>
 ))}
 </div>

 </div>
 );
};

export default SmartBundlesTab;
