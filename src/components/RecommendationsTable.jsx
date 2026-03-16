import React, { useMemo, useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const RecommendationsTable = ({ stockData, topProductsData, shipmentsData }) => {
 const [filter, setFilter] = useState('all');

 // AI Logic: Match what the client bought with what we have in stock
 // and suggest cross-sells or restocks
 const recommendations = useMemo(() => {
 if (!stockData || !shipmentsData) return [];

 const suggestions = [];

 // 1. Restock Suggestions: Products they bought before that we have in stock
 const purchasedProductsNames = shipmentsData.detailed.map(s => s.name);
 
 stockData.forEach(stockItem => {
 // Find if this exact item was bought
 const wasBought = purchasedProductsNames.find(name => name.includes(stockItem.name) || stockItem.name.includes(name));
 
 if (wasBought) {
 suggestions.push({
 type: 'restock',
 title: 'Oportunidade de Reposição',
 product: stockItem.name,
 stock: stockItem.quantity,
 reason: 'Cliente tem histórico de compra deste item.',
 confidence: 95
 });
 }
 });

 // 2. Cross-sell Suggestions: Top products they HAVEN'T bought yet
 if (topProductsData) {
 topProductsData.slice(0, 10).forEach(topProduct => {
 const wasBought = purchasedProductsNames.find(name => name.includes(topProduct.name) || topProduct.name.includes(name));
 const inStock = stockData.find(s => topProduct.name.includes(s.name) || s.name.includes(topProduct.name));
 
 if (!wasBought && inStock && inStock.quantity > 5) {
 suggestions.push({
 type: 'cross-sell',
 title: 'Sugestão de Diversificação',
 product: topProduct.name,
 stock: inStock.quantity,
 reason: 'Top seller na região, ótimo para testar aceitação.',
 confidence: 85
 });
 }
 });
 }

 // Sort by confidence
 return suggestions.sort((a, b) => b.confidence - a.confidence);
 }, [stockData, topProductsData, shipmentsData]);

 const filteredRecs = recommendations.filter(r => filter === 'all' || r.type === filter);

 return (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 
 {/* Header & AI Banner */}
 <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark mb-8 border border-brand-500/30  relative overflow-hidden">
 <div className="absolute top-0 right-0 p-4 opacity-10">
 <Sparkles className="w-48 h-48 text-brand-400" />
 </div>
 <div className="flex items-center gap-4 relative z-10">
 <div className="w-12 h-12 rounded-full bg-brand-500/20 border border-brand-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(70,108,192,0.5)]">
 <Sparkles className="w-6 h-6 text-brand-300" />
 </div>
 <div>
 <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Inteligência Comercial Ativa</h3>
 <p className="text-gray-500 dark:text-gray-400 max-w-2xl mt-1">
 O motor de IA cruzou o histórico de embarques com o estoque atual e encontrou <span className="text-emerald-400 font-bold">{recommendations.length} oportunidades</span> de negócio para este cliente.
 </p>
 </div>
 </div>
 </div>

 {/* Filters */}
 <div className="flex gap-2 mb-6">
 <button 
 onClick={() => setFilter('all')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-brand-500 text-gray-800 dark:text-white/90' : 'rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800'}`}
 >
 Todas
 </button>
 <button 
 onClick={() => setFilter('restock')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'restock' ? 'bg-brand-500 text-gray-800 dark:text-white/90' : 'rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800'}`}
 >
 Reposição
 </button>
 <button 
 onClick={() => setFilter('cross-sell')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'cross-sell' ? 'bg-brand-500 text-gray-800 dark:text-white/90' : 'rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800'}`}
 >
 Diversificação (Cross-sell)
 </button>
 </div>

 {/* Recommendations List */}
 <div className="grid grid-cols-1 gap-4">
 {filteredRecs.length > 0 ? filteredRecs.map((rec, idx) => (
 <div key={idx} className="rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm p-5 border border-gray-200 dark:border-gray-800 hover:border-brand-500/30 transition-all group flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
 
 <div className="flex items-start gap-4 flex-1">
 <div className={`mt-1 flex-shrink-0 ${rec.type === 'restock' ? 'text-emerald-400' : 'text-purple-400'}`}>
 {rec.type === 'restock' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
 </div>
 <div>
 <div className="flex items-center gap-3 mb-1">
 <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rec.type === 'restock' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'bg-purple-500/20 text-purple-300 border border-purple-500/20'}`}>
 {rec.title}
 </span>
 <span className="text-xs text-brand-300 font-medium flex items-center gap-1">
 <Sparkles className="w-3 h-3" />
 Match {rec.confidence}%
 </span>
 </div>
 <h4 className="text-gray-800 dark:text-white/90 font-bold text-lg leading-tight">{rec.product}</h4>
 <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{rec.reason}</p>
 </div>
 </div>

 <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-700/50">
 <div className="text-center md:text-right px-4 border-r border-slate-700/50 flex-1 md:flex-none">
 <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Disponível</p>
 <p className="text-gray-800 dark:text-white/90 font-bold text-lg">{rec.stock} und</p>
 </div>
 <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 transition-colors group-hover:bg-brand-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(70,108,192,0.4)]">
 <span>Oferecer</span>
 <ArrowRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 )) : (
 <div className="text-center p-12 rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm rounded-sm">
 <p className="text-gray-500 dark:text-gray-400">Nenhuma recomendação encontrada para este filtro.</p>
 </div>
 )}
 </div>

 </div>
 );
};

export default RecommendationsTable;
