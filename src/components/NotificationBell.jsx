/**
 * NotificationBell — Ícone de sino com badge de alertas de ruptura
 */
import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { useApp } from '../context/AppContext';

export default function NotificationBell() {
  const { notifications } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const criticalCount = notifications.filter((n) => n.type === 'critical').length;
  const totalCount    = notifications.length;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5" />
        {totalCount > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1 ${
            criticalCount > 0 ? 'bg-error-500' : 'bg-warning-500'
          }`}>
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 soft-card overflow-hidden z-[9999] shadow-soft-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">
              Alertas ({totalCount})
            </h3>
            {criticalCount > 0 && (
              <span className="soft-badge bg-error-50 text-error-600 border border-error-100 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20 text-[10px]">
                {criticalCount} crítico{criticalCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="w-10 h-10 rounded-full gradient-success mx-auto flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tudo certo!</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Nenhum alerta no momento.</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <Link
                  key={n.id}
                  to={n.path}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                >
                  <div className={`mt-0.5 shrink-0 ${n.type === 'critical' ? 'text-error-500' : 'text-warning-500'}`}>
                    {n.type === 'critical' ? <AlertCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{n.product}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 mt-0.5 shrink-0" />
                </Link>
              ))}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
              <Link
                to="/restock"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 flex items-center gap-1"
              >
                Ver Previsão de Ruptura <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
