import React, { useMemo, useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, TrendingUp, Star, LayoutGrid, List } from 'lucide-react';

const SalesOpportunitiesTab = ({ stockData, topProductsData, shipmentsData, onAddToCart, presentationSettings }) => {
 const [filter, setFilter] = useState('all');
 const [viewMode, setViewMode] = useState('grid');

 const formatCurrency = (val) => {
 return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
 };

 // AI Logic: Match what the client bought with what we have in stock
 // Added Persuasive parameters (Markup, Social Proof labels)
 const opportunities = useMemo(() => {
 if (!stockData || !shipmentsData || !topProductsData) return [];

 const suggestions = [];
 const purchasedProductsNames = shipmentsData.detailed.map(s => s.name);
 
 // 1. Cross-sell Suggestions (The big money makers)
 topProductsData.slice(0, 15).forEach((topProduct, index) => {
 const wasBought = purchasedProductsNames.find(name => name.includes(topProduct.name) || topProduct.name.includes(name));
 const inStock = stockData.find(s => topProduct.name.includes(s.name) || s.name.includes(topProduct.name));
 
 if (!wasBought && inStock && inStock.quantity > 2) {
 
 // Generate persuasive social proof labels based on rank
 let socialProof ="Item em Ascensão";
 let socialIcon = <TrendingUp className="w-4 h-4" />;
 
 if (index < 3) {
 socialProof ="Top 3 Absoluto SC";
 socialIcon = <Star className="w-4 h-4 text-amber-400" fill="currentColor" />;
 } else if (index < 7) {
 socialProof ="Alta Demanda na Região";
 socialIcon = <Sparkles className="w-4 h-4 text-purple-400" />;
 }

 // Mockup pricing for simulator
 const costPrice = 150 + (index * 10);
 const suggestedRetail = costPrice * 2.2; // 120% markup
 const potentialProfit = suggestedRetail - costPrice;

 suggestions.push({
 id: `cross-${index}`,
 type: 'cross-sell',
 badge: 'Mix Novo',
 product: topProduct.name,
 stock: inStock.quantity,
 socialProof,
 socialIcon,
 reason: 'Lojistas do mesmo porte que o seu estão faturando alto com este SKU.',
 costPrice,
 suggestedRetail,
 potentialProfit,
 confidence: 90 - index // Descending confidence
 });
 }
 });

 // 2. Restock Suggestions (Safe bets)
 stockData.forEach((stockItem, index) => {
 const wasBought = purchasedProductsNames.find(name => name.includes(stockItem.name) || stockItem.name.includes(name));
 
 if (wasBought) {
 const costPrice = 120;
 const suggestedRetail = costPrice * 2;
 const potentialProfit = suggestedRetail - costPrice;

 suggestions.push({
 id: `restock-${index}`,
 type: 'restock',
 badge: 'Giro Rápido',
 product: stockItem.name,
 stock: stockItem.quantity,
 socialProof:"Sua clientela já conhece",
 socialIcon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
 reason: 'Reposicionamento estratégico para evitar ruptura de estoque.',
 costPrice,
 suggestedRetail,
 potentialProfit,
 confidence: 95
 });
 }
 });

 return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 12); // Keep it focused
 }, [stockData, topProductsData, shipmentsData]);

 const filteredOpps = opportunities.filter(o => filter === 'all' || o.type === filter);

 return (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col relative zoom-in-[0.98]">
 
 {/* Animated Background Blobs for Premium Feel */}
 
 {/* Header Controls */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
 <div>
 <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90 tracking-tight">Oportunidades de Venda</h3>
 <p className="text-gray-500 dark:text-gray-400">Sugestões baseadas no algorítmo de similaridade de mercado.</p>
 </div>
 <div className="flex gap-2 p-1.5 rounded-sm border border-gray-200 dark:border-gray-800">
 <button 
 onClick={() => setFilter('all')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-brand-500 text-gray-800 dark:text-white/90 shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-white'}`}
 >
 Todos
 </button>
 <button 
 onClick={() => setFilter('cross-sell')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'cross-sell' ? 'bg-purple-500 text-gray-800 dark:text-white/90 shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-white'}`}
 >
 Alto Lucro (Novos)
 </button>
 <button 
 onClick={() => setFilter('restock')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'restock' ? 'bg-emerald-500 text-gray-800 dark:text-white/90 shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-white'}`}
 >
 Segurança (Reposição)
 </button>

 <div className="w-px h-6 bg-slate-700 my-auto mx-2 hidden md:block"></div>
 
 <button 
 onClick={() => setViewMode('grid')}
 className={`p-2 rounded-lg text-sm font-medium transition-colors hidden md:block ${viewMode === 'grid' ? 'bg-slate-700 text-gray-800 dark:text-white/90' : 'text-gray-500 dark:text-gray-400 hover:text-white'}`}
 >
 <LayoutGrid className="w-5 h-5" />
 </button>
 <button 
 onClick={() => setViewMode('list')}
 className={`p-2 rounded-lg text-sm font-medium transition-colors hidden md:block ${viewMode === 'list' ? 'bg-slate-700 text-gray-800 dark:text-white/90' : 'text-gray-500 dark:text-gray-400 hover:text-white'}`}
 >
 <List className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Grid of Opportunities */}
 <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} pb-24`}>
 {filteredOpps.length > 0 ? filteredOpps.map((opp) => (
 <div key={opp.id} className="rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm rounded-sm overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-brand-500/50 hover:shadow-[0_0_30px_rgba(70,108,192,0.15)] transition-all group flex flex-col">
 
 {/* Image Placeholder / Top Banner */}
 <div className="h-28 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-gray-200 dark:border-gray-800 relative p-5 flex items-start justify-between">
 <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${opp.type === 'restock' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
 {opp.badge}
 </div>
 
 {/* Social Proof Badge */}
 <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 shadow-xl">
 {opp.socialIcon}
 <span className="text-xs font-medium text-gray-800 dark:text-white/90">{opp.socialProof}</span>
 </div>
 </div>

 {/* Content */}
 <div className="p-5 flex-1 flex flex-col">
 <h4 className="text-gray-800 dark:text-white/90 font-bold text-lg leading-tight mb-2 group-hover:text-brand-300 transition-colors line-clamp-2" title={opp.product}>
 {opp.product}
 </h4>
 <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{opp.reason}</p>
 
 {/* Economics Area - Anchoring */}
 <div className="mt-auto grid grid-cols-2 gap-3 mb-5">
 <div className="rounded-sm p-3 border border-gray-200 dark:border-gray-800">
 <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-1">Seu Custo</p>
 <p className="text-gray-800 dark:text-white/90 font-bold text-lg">{formatCurrency(opp.costPrice)}</p>
 </div>
 <div className="bg-emerald-500/10 rounded-sm p-3 border border-emerald-500/20">
 <p className="text-[10px] text-emerald-400/80 uppercase tracking-widest font-bold mb-1">Lucro Estimado</p>
 <p className="text-emerald-400 font-bold text-lg">+{formatCurrency(opp.potentialProfit)}</p>
 </div>
 </div>

 {/* Stock & Action */}
 <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{opp.stock} prontas entrega</span>
 </div>
 <button 
 onClick={() => onAddToCart(opp)}
 className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-brand-600 hover:bg-brand-500 text-white font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-500/25"
 >
 <span>Adicionar</span>
 <ArrowRight className="w-4 h-4" />
 </button>
 </div>
 </div>

 </div>
 )) : (
 <div className="col-span-full text-center p-12 rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm rounded-sm">
 <p className="text-gray-500 dark:text-gray-400">Nenhuma oportunidade encontrada para este filtro.</p>
 </div>
 )}
 </div>

 </div>
 );
};

export default SalesOpportunitiesTab;
