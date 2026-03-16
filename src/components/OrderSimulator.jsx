import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, CheckCircle } from 'lucide-react';

const OrderSimulator = ({ cartItems, updateCartItem, removeFromCart, checkout }) => {
 
 const formatCurrency = (val) => {
 return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
 };

 const totalInvestment = cartItems.reduce((acc, curr) => acc + (curr.costPrice * curr.qty), 0);
 const totalRetail = cartItems.reduce((acc, curr) => acc + (curr.suggestedRetail * curr.qty), 0);
 const totalProfit = totalRetail - totalInvestment;

 return (
 <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 animate-in slide-in-from-right duration-500 w-full md:w-80 lg:w-96">
 
 {/* Header */}
 <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-sm bg-brand-500/20 flex items-center justify-center border border-brand-500/30 text-brand-400">
 <ShoppingCart className="w-5 h-5" />
 </div>
 <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 tracking-tight">Simulador</h3>
 </div>
 <span className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-800">
 {cartItems.length} Itens
 </span>
 </div>

 {/* Cart Items List */}
 <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
 {cartItems.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
 <ShoppingCart className="w-12 h-12 text-slate-600 mb-4" />
 <p className="text-white font-medium">Nenhum item selecionado</p>
 <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Navegue pelas Oportunidades e adicione produtos para simular o pedido.</p>
 </div>
 ) : (
 cartItems.map(item => (
 <div key={item.id} className="rounded-sm p-4 border border-gray-200 dark:border-gray-800 relative group">
 <button 
 onClick={() => removeFromCart(item.id)}
 className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 
 <h4 className="text-white font-medium text-sm pr-6 line-clamp-2 mb-3">{item.product}</h4>
 
 <div className="flex items-center justify-between">
 
 {/* Economics */}
 <div>
 <p className="text-gray-500 dark:text-gray-400 text-xs line-through mb-0.5">{formatCurrency(item.suggestedRetail)}</p>
 <p className="text-brand-300 font-bold">{formatCurrency(item.costPrice)}</p>
 </div>

 {/* Qty Controls */}
 <div className="flex items-center gap-3 rounded-lg p-1 border border-gray-200 dark:border-gray-800">
 <button 
 onClick={() => updateCartItem(item.id, item.qty - 1)}
 className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
 >
 <Minus className="w-3 h-3" />
 </button>
 <span className="text-white font-medium text-sm w-4 text-center">{item.qty}</span>
 <button 
 onClick={() => updateCartItem(item.id, item.qty + 1)}
 className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
 >
 <Plus className="w-3 h-3" />
 </button>
 </div>
 </div>
 </div>
 ))
 )}
 </div>

 {/* Checkout Footer (Anchoring Psychology) */}
 <div className="p-6 border-t border-brand-500/20 shadow-[0_-20px_40px_rgba(0,0,0,0.3)]">
 <div className="space-y-3 mb-6">
 <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
 <span>Investimento Previsto</span>
 <span className="font-medium">{formatCurrency(totalInvestment)}</span>
 </div>
 <div className="flex justify-between items-center text-sm text-emerald-400/80 pb-3 border-b border-gray-200 dark:border-gray-800">
 <span>Margem Bruta Livre</span>
 <span className="font-medium">+{formatCurrency(totalProfit)}</span>
 </div>
 <div className="flex justify-between items-end pt-2">
 <span className="text-sm font-medium text-gray-800 dark:text-white/90 tracking-wide">Faturamento Estimado</span>
 {/* The Anchor: They see the big number they will make, not the cost */}
 <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
 {formatCurrency(totalRetail)}
 </span>
 </div>
 </div>

 <button 
 onClick={checkout}
 disabled={cartItems.length === 0}
 className={`w-full flex items-center justify-center gap-2 py-4 rounded-sm font-bold transition-all shadow-xl
 ${cartItems.length > 0 
 ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-brand-500/30 cursor-pointer' 
 : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-800'}`}
 >
 <CheckCircle className="w-5 h-5" />
 <span>Finalizar Sugestão</span>
 </button>
 </div>

 </div>
 );
};

export default OrderSimulator;
