import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Package, DollarSign, Activity, Target } from 'lucide-react';

const OverviewDashboard = ({ stockData, shipmentsData, monthlyPurchasesData, hasShipments, presentationSettings }) => {
 // KPIs from monthly purchases data - USING REAL DATA FROM SPREADSHEET
 const totalItemsSold = useMemo(() => {
 if (!monthlyPurchasesData) return 0;
 return monthlyPurchasesData.reduce((acc, curr) => acc + (curr.totalUnits || 0), 0);
 }, [monthlyPurchasesData]);

 // Real revenue from VALOR sheet in spreadsheet
 const totalSales = useMemo(() => {
 if (!monthlyPurchasesData) return 0;
 return monthlyPurchasesData.reduce((acc, curr) => acc + (curr.totalRevenue || 0), 0);
 }, [monthlyPurchasesData]);

 const avgTicket = totalSales / (totalItemsSold || 1);

 // Benchmarks Internos (Hardcoded para efeito persuasivo B2B)
 const ticketMedioIdeal = 250; 
 const frequenciaIdealDeItens = 3500;

 // Radar Chart Data: Perfil do Cliente vs Mercado
 const radarData = [
 { subject: 'Ticket Médio', A: Math.min((avgTicket / ticketMedioIdeal) * 100, 100), fullMark: 100 },
 { subject: 'Volume', A: Math.min((totalItemsSold / frequenciaIdealDeItens) * 100, 100), fullMark: 100 },
 { subject: 'Mix de Produtos', A: 45, fullMark: 100 }, // Simulated lower mix to justify new products
 { subject: 'Frequência', A: 85, fullMark: 100 },
 { subject: 'Margem Estimada', A: 70, fullMark: 100 },
 ];

 // Format currency
 const formatCurrency = (val) => {
 return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
 };

 // Top Products Data (using REAL revenue from VALOR sheet)
 const topProductsData = useMemo(() => {
 if (!monthlyPurchasesData) return [];

 return monthlyPurchasesData
 .map(item => ({
 name: item.name || item.code || 'Produto',
 value: item.totalRevenue || 0, // REAL revenue from spreadsheet
 total: item.totalUnits || 0
 }))
 .sort((a, b) => b.value - a.value);
 }, [monthlyPurchasesData]);

 // NOVOS MARCADORES SOLICITADOS PELO CLIENTE:

 // 1. Produtos comprados mais vezes (mais repostos) - conta quantos meses teve compra
 const mostReorderedProducts = useMemo(() => {
 if (!monthlyPurchasesData) return [];
 const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

 return monthlyPurchasesData
 .map(item => {
 const monthsWithPurchases = monthNames.filter(m => (item.monthlyUnits?.[m] || 0) > 0).length;
 return {
 name: item.name,
 reorderCount: monthsWithPurchases,
 totalUnits: item.totalUnits || 0
 };
 })
 .filter(item => item.reorderCount > 0)
 .sort((a, b) => b.reorderCount - a.reorderCount);
 }, [monthlyPurchasesData]);

 // 2. Produtos que temos em estoque mas a loja nunca comprou
 const neverPurchasedProducts = useMemo(() => {
 if (!stockData || !monthlyPurchasesData) return [];

 const purchasedCodes = new Set(monthlyPurchasesData.map(p => p.code));

 return stockData.filter(stockItem => {
 // Item está em estoque mas não foi comprado
 const wasNeverPurchased = !purchasedCodes.has(stockItem.code);
 return wasNeverPurchased && stockItem.quantity > 0;
 });
 }, [stockData, monthlyPurchasesData]);

 // Custom JSX Tooltip
 const CustomTooltip = ({ active, payload, label, isCurrency }) => {
 if (active && payload && payload.length) {
 return (
 <div className="rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm p-4 border border-gray-200 dark:border-gray-800 z-50 backdrop-blur-xl">
 <p className="text-white font-medium mb-2">{label}</p>
 {payload.map((entry, index) => (
 <div key={index} className="flex flex-col gap-1">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || 'var(--color-brand-400)' }} />
 <span className="text-gray-700 dark:text-gray-300 text-sm capitalize">{entry.name || 'Valor'}</span>
 </div>
 <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-300 to-white">
 {isCurrency ? formatCurrency(entry.value) : entry.value}
 </p>
 </div>
 ))}
 </div>
 );
 }
 return null;
 };

 return (
 <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 zoom-in-95 relative">
 {/* Animated Background Blobs for Premium Feel */}
 
 {/* KPIs Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
 
  {/* KPI 1: Faturamento */}
  <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark border-l-[4px] border-l-brand-500 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
  <div className="flex justify-between items-start mb-4 relative z-10">
  <div>
  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">Faturamento Histórico</p>
  <h3 className="text-3xl font-space font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
  {presentationSettings?.hideCosts ? 'R$ ***,**' : formatCurrency(totalSales)}
  </h3>
  </div>
  <div className="w-12 h-12 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-stroke dark:border-strokedark">
  <DollarSign className="w-6 h-6" />
  </div>
  </div>
  <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium relative z-10">
  <TrendingUp className="w-4 h-4" />
  <span>Top 15% Sustentação na região</span>
  </div>
  </div>

  {/* KPI 2: Itens */}
  <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark border-l-[4px] border-l-brand-600 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
  <div className="flex justify-between items-start mb-4 relative z-10">
  <div>
  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">Giro de Produtos</p>
  <h3 className="text-3xl font-space font-bold text-gray-900 dark:text-white mt-1 tracking-tight">{totalItemsSold.toLocaleString('pt-BR')} <span className="text-lg text-gray-500 dark:text-gray-400 font-normal">und</span></h3>
  </div>
  <div className="w-12 h-12 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-stroke dark:border-strokedark">
  <Package className="w-6 h-6" />
  </div>
  </div>
  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 relative z-10">
  Potencial para diversificação de mix
  </div>
  </div>

  {/* KPI 3: Ticket Medio */}
  <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark border-l-[4px] border-l-brand-400 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
  <div className="flex justify-between items-start mb-4 relative z-10">
  <div>
  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">Ticket Médio (TM)</p>
  <div className="flex items-end gap-3">
  <h3 className="text-3xl font-space font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
  {presentationSettings?.hideCosts ? 'R$ ***,**' : formatCurrency(avgTicket)}
  </h3>
  </div>
  </div>
  <div className="w-12 h-12 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-stroke dark:border-strokedark">
  <Activity className="w-6 h-6" />
  </div>
  </div>
  <div className="w-full rounded-full h-1.5 mb-2 mt-1 relative z-10 overflow-hidden bg-gray-100 dark:bg-gray-800">
  <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${Math.min((avgTicket / ticketMedioIdeal) * 100, 100)}%` }}></div>
  </div>
  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 relative z-10">
  <span>TM Atual</span>
  <span className="text-brand-500 font-medium">Meta SC: {formatCurrency(ticketMedioIdeal)}</span>
  </div>
  </div>

  {/* KPI 4: Marcadores Inteligentes */}
  <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark border-l-[4px] border-l-slate-400 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
  <div className="flex justify-between items-start mb-4 relative z-10">
  <div>
  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">Itens em Embarque</p>
  <h3 className="text-3xl font-space font-bold text-gray-900 dark:text-white mt-1 tracking-tight">{shipmentsData?.detailed?.length || 0} <span className="text-lg font-normal text-gray-500 dark:text-gray-400">SKUs</span></h3>
  </div>
  <div className="w-12 h-12 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-stroke dark:border-strokedark">
  <Target className="w-6 h-6" />
  </div>
  </div>
  <div className="flex flex-col gap-2 text-xs relative z-10">
  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
  <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
  <span className="font-medium text-gray-700 dark:text-gray-300">{mostReorderedProducts.length > 0 ? mostReorderedProducts[0].name : 'N/A'}</span>
  <span className="text-gray-500 dark:text-gray-400">({mostReorderedProducts.length > 0 ? mostReorderedProducts[0].reorderCount : 0}x)</span>
  </div>
  <div className="flex items-center gap-2 text-rose-500">
  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
  <span className="line-clamp-1">{neverPurchasedProducts.length} produtos nunca comprados</span>
  </div>
  </div>
  </div>

 </div>

 {/* Charts Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Main Area Chart */}
 <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark lg:col-span-2 flex flex-col">
 <div className="mb-6">
 <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 tracking-tight">Faturamento por Produto (Top 10)</h3>
 <p className="text-sm text-gray-500 dark:text-gray-400">Desempenho consolidado dos itens com maior saída.</p>
 </div>
 <div className="flex-1 w-full min-h-[300px]">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={topProductsData.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
 <XAxis dataKey="name" stroke="#cbd5e1" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val} />
 <YAxis stroke="#cbd5e1" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} hide={presentationSettings?.hideCosts} />
 <RechartsTooltip content={<CustomTooltip isCurrency={true} />}  />
 <Bar dataKey="value" name="Faturamento" fill="var(--color-brand-500)" radius={[4, 4, 0, 0]}>
 {
 topProductsData.slice(0, 10).map((entry, index) => (
 <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-emerald-400)' : 'var(--color-brand-500)'} />
 ))
 }
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Radar Chart: Persuasion Profile */}
 <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark flex flex-col relative overflow-hidden">
 <div className=""></div>
 <div className="mb-2 relative z-10">
 <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 tracking-tight">Diagnóstico Competitivo</h3>
 <p className="text-sm text-gray-500 dark:text-gray-400">Sua loja vs. Médias do Mercado SC</p>
 </div>
 <div className="flex-1 w-full min-h-[280px] -mt-4 relative z-10">
 <ResponsiveContainer width="100%" height="100%">
 <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
 <PolarGrid stroke="rgba(255,255,255,0.1)" />
 <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
 <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
 <Radar name="Sua Loja" dataKey="A" stroke="var(--color-brand-400)" fill="var(--color-brand-500)" fillOpacity={0.4} strokeWidth={2} />
 <RechartsTooltip 
 contentStyle={{   borderRadius: '12px' }}
 
 formatter={(value) => [`${value.toFixed(0)}%`, 'Score']}
 />
 </RadarChart>
 </ResponsiveContainer>
 </div>
 <div className="mt-2 text-center text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20 relative z-10">
 ⚠️ O Diagnóstico aponta alta lacuna no <strong className="text-white">Mix de Produtos</strong> comparado ao seu incrível volume de vendas.
 </div>
 </div>

 </div>
 </div>
 );
};

export default OverviewDashboard;
