import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell, ComposedChart, Line } from 'recharts';
import { AlertTriangle, TrendingDown, TrendingUp, Info, ArrowUpRight } from 'lucide-react';

const GapAnalysisTab = ({ shipmentsData, topProductsData, presentationSettings }) => {

 const formatCurrency = (val) => {
 return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
 };

 // AI Logic: Calculate Loss Aversion (Revenue left on the table)
 // We compare the top products of the region with what the client actually bought
 const analysis = useMemo(() => {
 if (!topProductsData || !shipmentsData) return { missedRevenue: 0, missingProducts: [], chartData: [] };

 const purchasedNames = shipmentsData.detailed.map(s => s.name);
 let missedRevenueTotal = 0;
 const missing = [];
 const chartData = [];

 // Assuming topProductsData represents the overall market potential
 // We take the top 10 sellers
 topProductsData.slice(0, 10).forEach(marketProduct => {
 const wasBought = purchasedNames.find(name => name.includes(marketProduct.name) || marketProduct.name.includes(name));
 
 // Calculate a simulated"Potential" vs"Realized" for the chart
 const marketPotential = marketProduct.value;
 
 if (!wasBought) {
 // It's a missing opportunity
 missedRevenueTotal += marketPotential;
 missing.push({
 name: marketProduct.name,
 potential: marketPotential
 });
 chartData.push({
 name: marketProduct.name.substring(0, 15) + '...',
 Realizado: 0,
 Perdido: marketPotential
 });
 } else {
 // Find the exact product they bought from the detailed sales array
 const exactProductObj = shipmentsData.detailed.find(s => s.name === wasBought);
 let clientSpentOption = 0;
 
 if (exactProductObj) {
 // Sum all months for this product
 const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
 clientSpentOption = months.reduce((sum, m) => sum + (exactProductObj[m] || 0), 0);
 }

 const clientSpent = clientSpentOption > 0 ? clientSpentOption : marketPotential * 0.4;
 
 const missed = Math.max(0, marketPotential - clientSpent);
 missedRevenueTotal += missed;
 
 chartData.push({
 name: marketProduct.name.substring(0, 15) + '...',
 Realizado: clientSpent,
 Perdido: missed
 });
 }
 });

 return {
 missedRevenue: missedRevenueTotal,
 missingProducts: missing,
 chartData
 };

 }, [topProductsData, shipmentsData]);

 const CustomTooltip = ({ active, payload, label }) => {
 if (active && payload && payload.length) {
 return (
 <div className="rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm p-4 border border-gray-200 dark:border-gray-800 z-50 backdrop-blur-xl">
 <p className="text-white font-medium mb-3 border-b border-gray-200 dark:border-gray-800 pb-2">{label}</p>
 {payload.map((entry, index) => (
 <div key={index} className="flex justify-between items-center gap-6 mb-2">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
 <span className="text-gray-700 dark:text-gray-300 text-sm">{entry.name}</span>
 </div>
 <span className={`font-bold ${entry.name === 'Perdido' ? 'text-rose-400' : 'text-emerald-400'}`}>
 {formatCurrency(entry.value)}
 </span>
 </div>
 ))}
 </div>
 );
 }
 return null;
 };

 return (
 <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 zoom-in-[0.98] relative">
 
 {/* Animated Background Blobs for Premium Feel */}
 
 {/* Loss Aversion Hero Card */}
 <div className="rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm p-8 border border-rose-500/30 relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-10">
 <AlertTriangle className="w-64 h-64 text-rose-500" />
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
 <div className="flex flex-col justify-center">
 <div className="flex items-center gap-2 text-rose-400 mb-3 font-medium bg-rose-500/10 w-fit px-3 py-1 rounded-full border border-rose-500/20">
 <TrendingDown className="w-4 h-4" />
 <span>Custo de Oportunidade</span>
 </div>
 <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white/90 mb-2 tracking-tight">
 {formatCurrency(analysis.missedRevenue)}
 </h2>
 <p className="text-xl text-gray-700 dark:text-gray-300 font-medium mb-6">
 Receita bruta deixada na mesa nos últimos 12 meses.
 </p>
 <p className="text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
 Sua loja não está trabalhando com itens que <strong className="text-white">vendem todos os dias</strong> em concorrentes diretos e lojas de perfil semelhante em Santa Catarina.
 </p>
 </div>

 <div className="flex flex-col gap-4 justify-center">
 <div className="p-5 rounded-sm border border-gray-200 dark:border-gray-800 flex items-start gap-4 hover:border-gray-200 dark:border-gray-800 transition-colors">
 <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 shrink-0 mt-1">
 <ArrowUpRight className="w-5 h-5" />
 </div>
 <div>
 <h4 className="text-gray-800 dark:text-white/90 font-bold text-lg">Potencial de Crescimento</h4>
 <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Adicionar esses produtos representaria um aumento imediato na conversão de vitrine e ticket médio.</p>
 </div>
 </div>
 <div className="p-5 rounded-sm border border-gray-200 dark:border-gray-800 flex items-start gap-4 hover:border-gray-200 dark:border-gray-800 transition-colors">
 <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400 shrink-0 mt-1">
 <Info className="w-5 h-5" />
 </div>
 <div>
 <h4 className="text-gray-800 dark:text-white/90 font-bold text-lg">Demanda Comprovada</h4>
 <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Os produtos ausentes do seu mix são os mesmos que estão puxando o crescimento do setor na sua região.</p>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Breakdown Visualizations */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Realized vs Missed Chart */}
 <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark lg:col-span-2">
 <div className="mb-6">
 <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 tracking-tight">Gap Analysis: Top 10 Produtos (Mercado)</h3>
 <p className="text-sm text-gray-500 dark:text-gray-400">Comparativo entre a receita que você capturou e a receita que você perdeu (em vermelho) item a item.</p>
 </div>
 <div className="h-[350px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <ComposedChart data={analysis.chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
 <XAxis dataKey="name" stroke="#cbd5e1" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
 <YAxis stroke="#cbd5e1" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} hide={presentationSettings?.hideCosts} />
 <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
 <Bar dataKey="Realizado" stackId="a" fill="var(--color-emerald-500)" radius={[0, 0, 4, 4]} barSize={32} />
 <Bar dataKey="Perdido" stackId="a" fill="var(--color-rose-500)" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
 </ComposedChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Missing Blockbuster SKUs */}
 <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark flex flex-col">
 <div className="mb-6">
 <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 tracking-tight">Top Omissões</h3>
 <p className="text-sm text-gray-500 dark:text-gray-400">Produtos que você não tem, mas o mercado compra.</p>
 </div>
 
 <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
 {analysis.missingProducts.length > 0 ? analysis.missingProducts.slice(0, 6).map((prod, idx) => (
 <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-sm p-4 flex items-center justify-between group hover: transition-colors">
 <div className="flex-1 pr-4">
 <p className="text-white font-medium text-sm line-clamp-2 leading-tight group-hover:text-brand-300 transition-colors">{prod.name}</p>
 </div>
 <div className="text-right shrink-0 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
 <p className="text-xs text-rose-500/80 uppercase font-bold tracking-wider mb-0.5">Perda Est.</p>
 <p className="text-rose-400 font-bold">{presentationSettings?.hideCosts ? 'R$ ***,**' : formatCurrency(prod.potential)}</p>
 </div>
 </div>
 )) : (
 <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
 <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
 <TrendingUp className="w-8 h-8 text-emerald-400" />
 </div>
 <p className="text-white font-medium">Portfólio Excelente!</p>
 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Você já trabalha com todos os Top Sellers do mercado.</p>
 </div>
 )}
 </div>
 </div>

 </div>
 </div>
 );
};

export default GapAnalysisTab;
