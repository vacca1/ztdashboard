import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, Loader2, FileSpreadsheet } from 'lucide-react';
import { uploadZoneVariants, iconBounce, scaleIn } from '../utils/motion';

/**
 * Premium Upload Zone Component
 * Elegant, confident-inspiring file upload interface
 */
const UploadZone = ({
 label,
 description,
 isProcessing = false,
 isSuccess = false,
 successMessage,
 onFileSelect,
 inputRef,
 accentColor = 'brand',
 optional = false,
}) => {
 const colorSchemes = {
 brand: {
 border: 'border-brand-500/30 hover:border-brand-400/50',
 bg: 'bg-brand-500/5 hover:bg-brand-500/10',
 icon: 'text-brand-400',
 glow: 'shadow-brand-500/20',
 processing: 'border-brand-500/50 bg-brand-500/10',
 success: 'border-emerald-500/50 bg-emerald-500/10',
 },
 purple: {
 border: 'border-purple-500/30 hover:border-purple-400/50',
 bg: 'bg-purple-500/5 hover:bg-purple-500/10',
 icon: 'text-purple-400',
 glow: 'shadow-purple-500/20',
 processing: 'border-purple-500/50 bg-purple-500/10',
 success: 'border-emerald-500/50 bg-emerald-500/10',
 },
 };

 const scheme = colorSchemes[accentColor] || colorSchemes.brand;

 const getVariant = () => {
 if (isProcessing) return 'processing';
 if (isSuccess) return 'success';
 return 'animate';
 };

 return (
 <motion.div
 variants={uploadZoneVariants}
 initial="initial"
 animate={getVariant()}
 whileHover={!isProcessing ? 'hover' : ''}
 whileTap={!isProcessing ? 'tap' : ''}
 onClick={() => !isProcessing && inputRef.current?.click()}
 className="relative cursor-pointer group"
 >
 {/* Hidden file input */}
 <input
 type="file"
 ref={inputRef}
 className="hidden"
 accept=".xlsx, .xls"
 onChange={onFileSelect}
 />

 {/* Glass card */}
 <div
 className={`rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm p-8 border-2 transition-all duration-500 ${
 isProcessing
 ? scheme.processing
 : isSuccess
 ? scheme.success
 : `${scheme.border} ${scheme.bg}`
 }`}
 >
 {/* Optional badge */}
 {optional && !isSuccess && (
 <motion.div
 initial={{ scale: 0, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ delay: 0.3, type: 'spring' }}
 className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider"
 >
 Opcional
 </motion.div>
 )}

 {/* Content */}
 <div className="flex flex-col items-center text-center space-y-4">
 {/* Icon */}
 <AnimatePresence mode="wait">
 {isProcessing ? (
 <motion.div
 key="processing"
 variants={scaleIn}
 initial="initial"
 animate="animate"
 exit={{ scale: 0, opacity: 0 }}
 className={`w-16 h-16 rounded-sm bg-${accentColor}-500/20 border border-${accentColor}-500/30 flex items-center justify-center backdrop-blur-sm`}
 >
 <Loader2 className={`w-8 h-8 ${scheme.icon} animate-spin`} />
 </motion.div>
 ) : isSuccess ? (
 <motion.div
 key="success"
 variants={scaleIn}
 initial="initial"
 animate="animate"
 exit={{ scale: 0, opacity: 0 }}
 className="w-16 h-16 rounded-sm bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-emerald-500/20"
 >
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: [0, 1.2, 1] }}
 transition={{ delay: 0.2, duration: 0.6 }}
 >
 <CheckCircle2 className="w-8 h-8 text-emerald-400" />
 </motion.div>
 </motion.div>
 ) : (
 <motion.div
 key="idle"
 variants={iconBounce}
 whileHover="animate"
 className={`w-16 h-16 rounded-sm bg-white/5 border border-gray-200 dark:border-gray-800 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:bg-${accentColor}-500/10 group-hover:border-${accentColor}-500/30 transition-all duration-300 ${scheme.glow}`}
 >
 <UploadCloud className={`w-8 h-8 text-gray-500 dark:text-gray-400 group-hover:${scheme.icon} transition-colors`} />
 </motion.div>
 )}
 </AnimatePresence>

 {/* Text */}
 <div className="space-y-2">
 <AnimatePresence mode="wait">
 {isProcessing ? (
 <motion.p
 key="processing-text"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="text-lg font-bold text-gray-800 dark:text-white/90"
 >
 Processando dados...
 </motion.p>
 ) : isSuccess ? (
 <motion.p
 key="success-text"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="text-lg font-bold text-gray-800 dark:text-white/90"
 >
 {label}
 </motion.p>
 ) : (
 <motion.p
 key="idle-text"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className={`text-lg font-bold text-gray-800 dark:text-white/90 group-hover:${scheme.icon} transition-colors`}
 >
 {label}
 </motion.p>
 )}
 </AnimatePresence>

 <AnimatePresence mode="wait">
 {isProcessing ? (
 <motion.p
 key="processing-desc"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="text-sm text-gray-500 dark:text-gray-400"
 >
 Aguarde...
 </motion.p>
 ) : isSuccess ? (
 <motion.p
 key="success-desc"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="text-sm font-medium text-gray-500 dark:text-gray-400"
 >
 {successMessage}
 </motion.p>
 ) : (
 <motion.p
 key="idle-desc"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="text-sm text-gray-500 dark:text-gray-400"
 >
 {description}
 </motion.p>
 )}
 </AnimatePresence>
 </div>

 {/* File icon indicator when success */}
 {isSuccess && (
 <motion.div
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.4 }}
 className="flex flex-col items-center gap-3 mt-2"
 >
 <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
 <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
 <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
 Arquivo carregado
 </span>
 </div>
 
 <button className="px-4 py-2 mt-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 pointer-events-none">
 <UploadCloud className="w-4 h-4" />
 Alterar Arquivo
 </button>
 </motion.div>
 )}
 </div>

 {/* Animated border glow on hover */}
 <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
 <div className={`absolute inset-0 rounded-sm bg-gradient-to-r ${scheme.bg} blur-xl`} />
 </div>
 </div>
 </motion.div>
 );
};

export default UploadZone;
