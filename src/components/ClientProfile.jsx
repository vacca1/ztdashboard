/**
 * ClientProfile — Tela de perfil do cliente para modo apresentação B2B
 */
import React, { useState } from 'react';
import {
  User, MapPin, Building2, FileText, Save, BarChart3,
  TrendingUp, Package, DollarSign, RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

const SEGMENTS = ['Varejo', 'Atacado', 'E-commerce', 'Distribuidor', 'Representante', 'Outro'];
const REGIONS  = ['Santa Catarina', 'Rio Grande do Sul', 'Paraná', 'São Paulo', 'Rio de Janeiro', 'Outro'];

export default function ClientProfile() {
  const {
    clientProfile, setClientProfile,
    monthlyPurchasesData, stockData, shipmentsData,
    goals, presentationSettings,
  } = useApp();

  const [editing, setEditing] = useState(false);
  const [local, setLocal]     = useState({ ...clientProfile });
  const [saved, setSaved]     = useState(false);

  const handleSave = () => {
    setClientProfile(local);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  // Compute summary KPIs
  const totalSales = (monthlyPurchasesData ?? []).reduce((a, c) => a + (c.totalRevenue ?? 0), 0);
  const totalUnits = (monthlyPurchasesData ?? []).reduce((a, c) => a + (c.totalUnits ?? 0), 0);
  const avgTicket  = totalSales / (totalUnits || 1);
  const skuCount   = monthlyPurchasesData?.length ?? 0;
  const stockCount = stockData?.length ?? 0;

  const ticketPct  = Math.min((avgTicket / (goals.ticketMedio || 250)) * 100, 100);
  const volumePct  = Math.min((totalUnits / (goals.frequencia  || 3500)) * 100, 100);

  const Field = ({ icon: Icon, label, fieldKey, type = 'text', options }) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">{label}</label>
      {editing ? (
        options ? (
          <select
            value={local[fieldKey] || ''}
            onChange={(e) => setLocal((p) => ({ ...p, [fieldKey]: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-400 transition-colors"
          >
            <option value="">Selecionar...</option>
            {options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={local[fieldKey] || ''}
            onChange={(e) => setLocal((p) => ({ ...p, [fieldKey]: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-400 transition-colors"
          />
        )
      ) : (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
          {Icon && <Icon className="w-4 h-4 text-brand-400 shrink-0" />}
          <span className="text-sm text-gray-800 dark:text-white font-medium">
            {clientProfile[fieldKey] || <span className="text-gray-400 italic">Não informado</span>}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="soft-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shadow-[var(--shadow-soft-brand)]">
            <span className="text-2xl font-bold text-white font-space">
              {(clientProfile.name || 'C').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {clientProfile.name || 'Cliente sem nome'}
            </h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {clientProfile.segment && (
                <span className="soft-badge bg-brand-50 text-brand-600 border border-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20 text-xs">
                  {clientProfile.segment}
                </span>
              )}
              {clientProfile.region && (
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="w-3 h-3" />
                  {clientProfile.region}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={() => { setLocal({ ...clientProfile }); setEditing(false); }}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-bold flex items-center gap-2 shadow-[var(--shadow-soft-brand)]"
              >
                <Save className="w-4 h-4" /> Salvar
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-xl border border-brand-200 dark:border-brand-500/30 text-brand-600 dark:text-brand-300 text-sm font-medium hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
            >
              Editar Perfil
            </button>
          )}
        </div>
        {saved && (
          <div className="w-full text-center text-xs text-success-600 dark:text-success-400 font-semibold">
            ✓ Perfil salvo com sucesso!
          </div>
        )}
      </div>

      {/* ── Dados do cliente ── */}
      <div className="soft-card p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Dados cadastrais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field icon={User}      label="Nome / Razão Social" fieldKey="name" />
          <Field icon={FileText}  label="CNPJ"                fieldKey="cnpj" />
          <Field icon={MapPin}    label="Região / Cidade"     fieldKey="region"  options={REGIONS}  />
          <Field icon={Building2} label="Segmento"            fieldKey="segment" options={SEGMENTS} />
        </div>
      </div>

      {/* ── KPIs resumo ── */}
      {monthlyPurchasesData && (
        <div className="soft-card p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Resumo do Período</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Faturamento',   value: presentationSettings?.hideCosts ? 'R$ •••' : fmt(totalSales), icon: DollarSign, g: 'gradient-brand', s: '--shadow-soft-brand' },
              { label: 'Giro (und)',    value: totalUnits.toLocaleString('pt-BR'), icon: Package, g: 'gradient-success', s: '--shadow-soft-success' },
              { label: 'Ticket Médio', value: presentationSettings?.hideCosts ? 'R$ •••' : fmt(avgTicket), icon: TrendingUp, g: 'gradient-warning', s: '--shadow-soft-warning' },
              { label: 'SKUs Ativos',  value: skuCount, icon: BarChart3, g: 'gradient-dark', s: '--shadow-soft-xs' },
            ].map(({ label, value, icon: Icon, g, s }) => (
              <div key={label} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className={`soft-icon-box ${g} w-10 h-10 shrink-0`} style={{ boxShadow: `var(${s})` }}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="text-base font-bold text-gray-800 dark:text-white font-space">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress vs goals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Ticket Médio vs Meta', pct: ticketPct, current: fmt(avgTicket), goal: fmt(goals.ticketMedio), color: 'gradient-brand' },
              { label: 'Volume vs Meta',       pct: volumePct, current: `${totalUnits.toLocaleString('pt-BR')} und`, goal: `${(goals.frequencia ?? 0).toLocaleString('pt-BR')} und`, color: 'gradient-success' },
            ].map(({ label, pct, current, goal, color }) => (
              <div key={label} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                  <span className="font-bold text-brand-500">{pct.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden mb-2">
                  <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Atual: <strong className="text-gray-700 dark:text-gray-300">{current}</strong></span>
                  <span>Meta: <strong className="text-gray-700 dark:text-gray-300">{goal}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Embarques ── */}
      {shipmentsData && (
        <div className="soft-card p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Embarques Ativos</h3>
          <div className="flex items-center gap-4">
            <div className="soft-icon-box gradient-info w-12 h-12">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white font-space">
                {shipmentsData.detailed?.length ?? 0} <span className="text-base font-normal text-gray-400">SKUs</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">itens com chegada futura prevista</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
