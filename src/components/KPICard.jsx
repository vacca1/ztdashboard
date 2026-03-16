import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Soft UI KPI Card
 * White card with gradient icon box, soft shadow, hover lift
 */
const KPICard = ({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  accentColor = 'brand',
  format = 'number',
  subtitle,
  className = '',
}) => {
  const gradients = {
    brand:   'gradient-brand',
    emerald: 'gradient-success',
    purple:  'gradient-brand',
    amber:   'gradient-warning',
    rose:    'gradient-error',
    info:    'gradient-info',
    dark:    'gradient-dark',
  };

  const shadowVars = {
    brand:   'var(--shadow-soft-brand)',
    emerald: 'var(--shadow-soft-success)',
    purple:  'var(--shadow-soft-brand)',
    amber:   'var(--shadow-soft-warning)',
    rose:    'var(--shadow-soft-error)',
    info:    'var(--shadow-soft-brand)',
    dark:    'var(--shadow-soft-xs)',
  };

  const gradient = gradients[accentColor] ?? gradients.brand;
  const shadowVar = shadowVars[accentColor] ?? shadowVars.brand;

  const formatValue = (val) => {
    if (format === 'currency')
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency', currency: 'BRL',
        minimumFractionDigits: 0, maximumFractionDigits: 0,
      }).format(val);
    if (format === 'number')  return new Intl.NumberFormat('pt-BR').format(val);
    if (format === 'percentage') return `${val}%`;
    return val;
  };

  return (
    <div className={`soft-card soft-card-hover p-5 flex flex-col gap-4 ${className}`}>

      {/* Header */}
      <div className="flex items-start justify-between">
        <p className="metric-label">{label}</p>
        {Icon && (
          <div
            className={`soft-icon-box ${gradient}`}
            style={{ boxShadow: shadowVar }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="metric-value">{formatValue(value)}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Trend */}
      {trend && trendValue && (
        <div className="flex items-center gap-2">
          <span
            className={`soft-badge border ${
              trend === 'up'
                ? 'bg-success-50 text-success-600 border-success-100 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20'
                : trend === 'down'
                ? 'bg-error-50 text-error-600 border-error-100 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20'
                : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
            }`}
          >
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
