import React from 'react';
import { motion } from 'framer-motion';
import { cardVariants, metricVariants, iconBounce } from '../utils/motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Premium KPI Card Component
 * State-of-the-art metric display with cinematic animations
 */
const KPICard = ({
 label,
 value,
 icon: Icon,
 trend,
 trendValue,
 accentColor = 'brand',
 format = 'number',
 delay = 0,
 className = '',
}) => {
 // Color schemes
 const colorSchemes = {
 brand: {
 bg: 'from-brand-500/10 to-brand-600/5',
 border: 'border-brand-500/30',
 icon: 'bg-brand-500/20 text-brand-300',
 glow: 'shadow-brand-500/20',
 text: 'text-brand-300',
 },
 emerald: {
 bg: 'from-emerald-500/10 to-emerald-600/5',
 border: 'border-emerald-500/30',
 icon: 'bg-emerald-500/20 text-emerald-300',
 glow: 'shadow-emerald-500/20',
 text: 'text-emerald-300',
 },
 purple: {
 bg: 'from-purple-500/10 to-purple-600/5',
 border: 'border-purple-500/30',
 icon: 'bg-purple-500/20 text-purple-300',
 glow: 'shadow-purple-500/20',
 text: 'text-purple-300',
 },
 amber: {
 bg: 'from-amber-500/10 to-amber-600/5',
 border: 'border-amber-500/30',
 icon: 'bg-amber-500/20 text-amber-300',
 glow: 'shadow-amber-500/20',
 text: 'text-amber-300',
 },
 rose: {
 bg: 'from-rose-500/10 to-rose-600/5',
 border: 'border-rose-500/30',
 icon: 'bg-rose-500/20 text-rose-300',
 glow: 'shadow-rose-500/20',
 text: 'text-rose-300',
 },
 };

 const scheme = colorSchemes[accentColor] || colorSchemes.brand;

 // Format value
 const formatValue = (val) => {
 if (format === 'currency') {
 return new Intl.NumberFormat('pt-BR', {
 style: 'currency',
 currency: 'BRL',
 minimumFractionDigits: 0,
 maximumFractionDigits: 0,
 }).format(val);
 }
 if (format === 'number') {
 return new Intl.NumberFormat('pt-BR').format(val);
 }
 if (format === 'percentage') {
 return `${val}%`;
 }
 return val;
 };

 return (
 <motion.div
 variants={cardVariants}
 initial="initial"
 animate="animate"
 whileHover="hover"
 transition={{ delay }}
 className={`group relative overflow-hidden ${className}`}
 >
 {/* Glass card base */}
 <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark h-full">
 {/* Gradient overlay */}
 <div
 className={`absolute inset-0 bg-gradient-to-br ${scheme.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
 />

 {/* Accent border top */}
 <div
 className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${scheme.bg} opacity-50`}
 />

 {/* Content */}
 <div className="relative z-10 flex flex-col h-full">
 {/* Header with icon */}
 <div className="flex items-start justify-between mb-4">
 <div className="flex-1">
 <p className="metric-label">{label}</p>
 </div>

 {Icon && (
 <motion.div
 variants={iconBounce}
 whileHover="animate"
 className={`w-12 h-12 rounded-sm ${scheme.icon} flex items-center justify-center backdrop-blur-sm shadow-lg ${scheme.glow} group-hover:scale-110 transition-transform duration-300`}
 >
 <Icon className="w-6 h-6" />
 </motion.div>
 )}
 </div>

 {/* Metric value with animation */}
 <motion.div
 variants={metricVariants}
 initial="initial"
 animate="animate"
 transition={{ delay: delay + 0.2 }}
 className="flex-1 flex items-center"
 >
 <h3 className="metric-value text-4xl">{formatValue(value)}</h3>
 </motion.div>

 {/* Trend indicator */}
 {trend && (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: delay + 0.4 }}
 className="flex items-center gap-2 mt-4"
 >
 <div
 className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
 trend === 'up'
 ? 'bg-emerald-500/10 text-emerald-300'
 : trend === 'down'
 ? 'bg-rose-500/10 text-rose-300'
 : 'bg-slate-500/10 text-gray-700 dark:text-gray-300'
 } border ${
 trend === 'up'
 ? 'border-emerald-500/30'
 : trend === 'down'
 ? 'border-rose-500/30'
 : 'border-slate-500/30'
 }`}
 >
 {trend === 'up' ? (
 <TrendingUp className="w-3.5 h-3.5" />
 ) : trend === 'down' ? (
 <TrendingDown className="w-3.5 h-3.5" />
 ) : null}
 <span className="text-xs font-semibold">{trendValue}</span>
 </div>
 </motion.div>
 )}
 </div>

 {/* Glow effect on hover */}
 <div
 className={`absolute -bottom-24 -right-24 w-48 h-48 bg-gradient-to-br ${scheme.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none`}
 />
 </div>
 </motion.div>
 );
};

export default KPICard;
