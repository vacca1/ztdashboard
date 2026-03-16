import React, { useMemo } from 'react';
import { AlertOctagon, TrendingDown, ArrowRight, Activity, ShieldAlert, BarChart3, ShieldCheck, Download } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ReferenceLine } from 'recharts';
import { useApp } from '../context/AppContext';
import { exportRestock } from '../utils/exportUtils';

const PredictiveRestockTab = () => {
 const { stockData, monthlyPurchasesData, shipmentsData, addToCart: onAddToCart, presentationSettings, clientProfile } = useApp();
 const formatCurrency = (val) => {
 return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
 };

 // AI Logic: Identify products with high"Rupture Risk" (Stockout)
 // Using REAL data from spreadsheets - no mocked values
 const ruptureRisks = useMemo(() => {
 if (!monthlyPurchasesData || !stockData) return [];

 const risks = [];
 const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
 const monthNamesDisplay = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

 monthlyPurchasesData.forEach((purchaseItem) => {
 // Find matching stock item
 const inStock = stockData.find(s =>
 s.code === purchaseItem.code ||
 s.name === purchaseItem.name ||
 s.name.includes(purchaseItem.code) ||
 purchaseItem.code.includes(s.code)
 );

 if (!inStock || !purchaseItem.monthlyUnits || !purchaseItem.monthlyRevenue) return;

 // Find matching shipment (future arrival) for this product
 const futureShipment = shipmentsData?.detailed?.find(ship =>
 ship.code === purchaseItem.code ||
 ship.code === inStock.code ||
 ship.name.includes(purchaseItem.code) ||
 purchaseItem.code.includes(ship.code)
 );

 // Find last purchase month (last month with units > 0)
 let lastPurchaseMonthIdx = -1;
 let lastPurchaseUnits = 0;
 let lastPurchaseRevenue = 0;

 for (let i = monthNames.length - 1; i >= 0; i--) {
 const units = purchaseItem.monthlyUnits[monthNames[i]] || 0;
 if (units > 0) {
 lastPurchaseMonthIdx = i;
 lastPurchaseUnits = units;
 lastPurchaseRevenue = purchaseItem.monthlyRevenue[monthNames[i]] || 0;
 break;
 }
 }

 // Skip if never purchased or no data
 if (lastPurchaseMonthIdx === -1 || lastPurchaseUnits === 0) return;

 // Calculate average monthly volume (from all non-zero months)
 const monthsWithPurchases = monthNames.filter(m => (purchaseItem.monthlyUnits[m] || 0) > 0);
 const avgMonthlyVolume = monthsWithPurchases.length > 0
 ? purchaseItem.totalUnits / monthsWithPurchases.length
 : 0;

 if (avgMonthlyVolume === 0) return;

 // Calculate cost per unit from real data
 const costPerUnit = lastPurchaseRevenue / lastPurchaseUnits;

 // Calculate months since last purchase (assuming we're in December, month 11)
 const currentMonthIdx = 11; // December (0-indexed)
 const monthsSinceLastPurchase = currentMonthIdx - lastPurchaseMonthIdx;

 // CLIENTE SOLICITOU: Considerar tudo que está com estoque abaixo de 50 como alerta de ruptura
 const stockBelowThreshold = inStock.quantity < 50;
 const notRecentlyPurchased = monthsSinceLastPurchase >= 2;

 if (stockBelowThreshold || notRecentlyPurchased) {
 // Build chart with last 6 months of actual data
 const chartData = [];
 for (let i = Math.max(0, lastPurchaseMonthIdx - 5); i <= Math.min(11, lastPurchaseMonthIdx + 1); i++) {
 chartData.push({
 month: monthNamesDisplay[i],
 stock: purchaseItem.monthlyUnits[monthNames[i]] || 0
 });
 }

 const recommendedRestockQty = Math.ceil(avgMonthlyVolume * 2); // 2 months buffer

 risks.push({
 id: `risk-${purchaseItem.code}`,
 product: purchaseItem.name,
 stockAvailable: inStock.quantity,
 lastPurchaseMonth: monthNamesDisplay[lastPurchaseMonthIdx],
 lastPurchaseUnits,
 lastPurchaseRevenue,
 avgMonthlyVolume: Math.round(avgMonthlyVolume),
 monthsSinceLastPurchase,
 chartData,
 costPerUnit,
 recommendedRestockQty,
 totalInvestment: costPerUnit * recommendedRestockQty,
 lostRevenueRisk: lastPurchaseRevenue * 2, // Potential lost revenue
 // Future shipment data (if available)
 futureArrivalDate: futureShipment?.arrivalDateFormatted || null,
 futureArrivalQty: futureShipment?.quantity || 0
 });
 }
 });

 return risks.sort((a, b) => b.monthsSinceLastPurchase - a.monthsSinceLastPurchase).slice(0, 6);
 }, [monthlyPurchasesData, stockData]);

 const CustomTooltip = ({ active, payload, label }) => {
 if (active && payload && payload.length) {
 return (
 <div className="rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm p-3 border border-rose-500/20 z-50 backdrop-blur-xl">
 <p className="text-white font-medium mb-1">{label}</p>
 <p className="text-rose-400 text-sm font-bold">Estoque Est.: {payload[0].value} un</p>
 </div>
 );
 }
 return null;
 };

 return (
 <div className="space-y-6">

 {/* Header */}
 <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
 <div className="flex items-center gap-3">
 <div className="soft-icon-box gradient-error w-12 h-12" style={{ boxShadow: 'var(--shadow-soft-error)' }}>
 <AlertOctagon className="w-6 h-6" />
 </div>
 <div>
  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Alerta de Ruptura</h3>
  <p className="text-sm text-gray-500 dark:text-gray-400">
  SKUs de alto giro com risco de ficar sem estoque
  </p>
 </div>
 </div>
 <button
   onClick={() => exportRestock({ ruptureRisks, clientProfile })}
   className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
 >
   <Download className="w-4 h-4" />
   Exportar Excel
 </button>
 </div>

 {/* Main Content Grid */}
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
 {ruptureRisks.length > 0 ? ruptureRisks.map((risk) => (
 <div key={risk.id} className="rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm overflow-hidden hover:border-rose-300 dark:hover:border-rose-500/40 transition-all group flex flex-col relative">
 
 {/* Top Banner Warning */}
 <div className="bg-rose-50 dark:bg-rose-500/5 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between flex-wrap gap-2">
 <div className="flex items-center gap-2 text-rose-400 font-bold tracking-wider text-xs uppercase">
 <ShieldAlert className="w-4 h-4" />
 Alerta de Ruptura
 </div>
 <div className="flex items-center gap-2 flex-wrap">
 {risk.futureArrivalDate && (
 <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold font-mono border border-emerald-500/30">
 DATA DA CHEGADA: {risk.futureArrivalDate}
 </div>
 )}
 {risk.futureArrivalQty > 0 && (
 <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold font-mono border border-blue-500/30">
 {risk.futureArrivalQty} PEÇAS
 </div>
 )}
 <div className="bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-xs font-bold font-mono">
 ÚLTIMA COMPRA: {risk.lastPurchaseMonth.toUpperCase()}
 </div>
 </div>
 </div>

 <div className="p-6 md:p-8 flex-1 grid grid-cols-1 md:grid-cols-5 gap-6">
 
 {/* Details Column */}
 <div className="md:col-span-3 flex flex-col justify-between pr-0 md:pr-4">
 <div>
  <h4 className="text-lg font-space font-bold text-gray-900 dark:text-white mb-1.5 leading-tight group-hover:text-rose-600 dark:group-hover:text-rose-100 transition-colors line-clamp-2" title={risk.product}>
  {risk.product}
  </h4>
 <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
 Em <strong className="text-gray-800 dark:text-white/90">{risk.lastPurchaseMonth}</strong> comprou <strong className="text-gray-800 dark:text-white/90">{risk.lastPurchaseUnits} unidades</strong> por <strong className="text-rose-400">{presentationSettings?.hideCosts ? 'R$ ***,**' : formatCurrency(risk.lastPurchaseRevenue)}</strong>
 </p>
 </div>

 <div className="flex flex-col xl:flex-row gap-3 mt-2">
 <div className="rounded-sm p-3 border border-gray-200 dark:border-gray-800">
 <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-1">Custo Unitário</p>
 <p className="text-gray-800 dark:text-white/90 font-bold text-lg">{presentationSettings?.hideCosts ? 'R$ ***,**' : formatCurrency(risk.costPerUnit)}</p>
 </div>
 <div className="bg-rose-500/10 rounded-sm p-3 border border-rose-500/20">
 <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Meses Sem Compra</p>
 <p className="text-gray-800 dark:text-white/90 font-bold text-lg">{risk.monthsSinceLastPurchase} {risk.monthsSinceLastPurchase === 1 ? 'mês' : 'meses'}</p>
 </div>
 </div>
 </div>

 {/* Chart Column */}
 <div className="md:col-span-2 flex flex-col">
 <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">Curva de Zeros</p>
 <div className="h-32 w-full mt-auto relative">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={risk.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
 <RechartsTooltip content={<CustomTooltip />} />
 <Area type="monotone" dataKey="stock" stroke="#f43f5e" strokeWidth={3} fill="#f43f5e" fillOpacity={0.2} />
 <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 </div>

 {/* Action Footer */}
 <div className="p-6 border-t border-rose-500/10 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="text-sm">
 <span className="text-gray-500 dark:text-gray-400">Sugerido: </span>
 <span className="text-gray-800 dark:text-white/90 font-bold">{risk.recommendedRestockQty} unidades</span>
 <span className="text-gray-500 dark:text-gray-400 ml-2">({presentationSettings?.hideCosts ? 'R$ ***,**' : formatCurrency(risk.totalInvestment)})</span>
 </div>
 <button
 onClick={() => onAddToCart({
 id: `prev-${risk.product}`,
 product: risk.product,
 costPrice: risk.costPerUnit,
 suggestedRetail: risk.costPerUnit * 2,
 qty: risk.recommendedRestockQty
 })}
 className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-sm bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors"
 >
 <span>Salvar Venda</span>
 <ArrowRight className="w-5 h-5" />
 </button>
 </div>

 </div>
 )) : (
 <div className="col-span-full flex flex-col items-center justify-center p-16 rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm border-emerald-500/20 bg-emerald-500/5">
 <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
 <ShieldCheck className="w-10 h-10 text-emerald-400" />
 </div>
 <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-2">Sem Riscos de Ruptura!</h4>
 <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">O estoque do cliente nas linhas analisadas está saudável de acordo com nosso modelo preditivo.</p>
 </div>
 )}
 </div>

 </div>
 );
};

export default PredictiveRestockTab;
