/**
 * PeriodFilter — Seletor de período (meses)
 * Exibe um dropdown com opções predefinidas + seletor personalizado de meses
 */
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const PRESETS = [
  { label: 'Ano inteiro',    start: 0,  end: 11 },
  { label: 'Jan – Mar',      start: 0,  end: 2  },
  { label: 'Abr – Jun',      start: 3,  end: 5  },
  { label: 'Jul – Set',      start: 6,  end: 8  },
  { label: 'Out – Dez',      start: 9,  end: 11 },
  { label: '1º Semestre',    start: 0,  end: 5  },
  { label: '2º Semestre',    start: 6,  end: 11 },
];

const SHORT_LABELS = ['J','F','M','A','M','J','J','A','S','O','N','D'];
const MONTH_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function PeriodFilter() {
  const { periodFilter, setPeriodFilter } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { start, end } = periodFilter;

  const currentLabel = () => {
    const preset = PRESETS.find((p) => p.start === start && p.end === end);
    if (preset) return preset.label;
    return `${MONTH_LABELS[start]} – ${MONTH_LABELS[end]}`;
  };

  const monthCount = end - start + 1;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleMonth = (idx) => {
    // Expand/shrink range
    if (idx < start) {
      setPeriodFilter({ start: idx, end });
    } else if (idx > end) {
      setPeriodFilter({ start, end: idx });
    } else if (idx === start && start < end) {
      setPeriodFilter({ start: start + 1, end });
    } else if (idx === end && end > start) {
      setPeriodFilter({ start, end: end - 1 });
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-600 transition-colors shadow-soft-xs"
      >
        <Calendar className="w-4 h-4 text-brand-500" />
        <span className="hidden sm:inline">{currentLabel()}</span>
        <span className="sm:hidden">{monthCount}m</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 soft-card p-4 z-[9999] shadow-soft-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
            Período de análise
          </p>

          {/* Presets */}
          <div className="grid grid-cols-2 gap-1.5 mb-4">
            {PRESETS.map((p) => {
              const active = p.start === start && p.end === end;
              return (
                <button
                  key={p.label}
                  onClick={() => { setPeriodFilter({ start: p.start, end: p.end }); setOpen(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'gradient-brand text-white shadow-[var(--shadow-soft-brand)]'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Custom month picker */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Personalizado — clique para ajustar:</p>
            <div className="grid grid-cols-6 gap-1">
              {SHORT_LABELS.map((label, idx) => {
                const inRange = idx >= start && idx <= end;
                const isEdge  = idx === start || idx === end;
                return (
                  <button
                    key={idx}
                    onClick={() => toggleMonth(idx)}
                    className={`h-8 w-full rounded-lg text-xs font-bold transition-all ${
                      isEdge
                        ? 'gradient-brand text-white'
                        : inRange
                          ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
              {MONTH_LABELS[start]} → {MONTH_LABELS[end]} ({monthCount} {monthCount === 1 ? 'mês' : 'meses'})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
