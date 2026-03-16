import React, { useMemo } from 'react';
import { TrendingUp, Package, DollarSign, Activity } from 'lucide-react';

const OverviewDashboard = ({ shipmentsData, monthlyPurchasesData, hasShipments, presentationSettings }) => {
 // KPIs from monthly purchases data
 const totalItemsSold = useMemo(() => {
 if (!monthlyPurchasesData) return 0;
 return monthlyPurchasesData.reduce((acc, curr) => acc + (curr.total || 0), 0);
 }, [monthlyPurchasesData]);

 const totalSales = useMemo(() => {
 return totalItemsSold * 85;
 }, [totalItemsSold]);

 const avgTicket = totalSales / (totalItemsSold || 1);

 const formatCurrency = (val) => {
 return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
 };

 return (
 <div className="space-y-6 p-6">
 <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90 mb-8">Dashboard - Visão Geral</h1>

 {/* KPIs Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

 {/* KPI 1: Faturamento */}
 <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
 <div className="flex justify-between items-start mb-4">
 <div>
 <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Faturamento Histórico</p>
 <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90 mt-1">
 {presentationSettings?.hideCosts ? 'R$ ***,**' : formatCurrency(totalSales)}
 </h3>
 </div>
 <div className="w-12 h-12 rounded-sm bg-brand-500/20 flex items-center justify-center text-brand-300">
 <DollarSign className="w-6 h-6" />
 </div>
 </div>
 <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
 <TrendingUp className="w-4 h-4" />
 <span>Excelente performance</span>
 </div>
 </div>

 {/* KPI 2: Itens */}
 <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
 <div className="flex justify-between items-start mb-4">
 <div>
 <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Giro de Produtos</p>
 <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90 mt-1">
 {totalItemsSold.toLocaleString('pt-BR')} <span className="text-lg text-gray-500 dark:text-gray-400">und</span>
 </h3>
 </div>
 <div className="w-12 h-12 rounded-sm bg-purple-500/20 flex items-center justify-center text-purple-300">
 <Package className="w-6 h-6" />
 </div>
 </div>
 <div className="text-sm text-gray-500 dark:text-gray-400">
 Potencial para diversificação
 </div>
 </div>

 {/* KPI 3: Ticket Médio */}
 <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
 <div className="flex justify-between items-start mb-4">
 <div>
 <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Ticket Médio</p>
 <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90 mt-1">
 {presentationSettings?.hideCosts ? 'R$ ***,**' : formatCurrency(avgTicket)}
 </h3>
 </div>
 <div className="w-12 h-12 rounded-sm bg-emerald-500/20 flex items-center justify-center text-emerald-300">
 <Activity className="w-6 h-6" />
 </div>
 </div>
 </div>

 {/* KPI 4: SKUs */}
 <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
 <div className="flex justify-between items-start mb-4">
 <div>
 <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Produtos Únicos</p>
 <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90 mt-1">
 {monthlyPurchasesData?.length || 0} <span className="text-lg text-gray-500 dark:text-gray-400">SKUs</span>
 </h3>
 </div>
 </div>
 </div>
 </div>

 <div className="rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm p-8 mt-8">
 <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-4">✅ Dashboard Carregado com Sucesso!</h2>
 <p className="text-gray-700 dark:text-gray-300 mb-4">Dados carregados:</p>
 <ul className="text-gray-500 dark:text-gray-400 space-y-2">
 <li>✓ {monthlyPurchasesData?.length || 0} produtos no histórico</li>
 <li>✓ {totalItemsSold.toLocaleString('pt-BR')} unidades vendidas</li>
 <li>✓ Faturamento total: {formatCurrency(totalSales)}</li>
 </ul>
 </div>
 </div>
 );
};

export default OverviewDashboard;
