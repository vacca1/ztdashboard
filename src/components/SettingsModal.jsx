/**
 * SettingsModal — Configurar metas e perfil do cliente
 */
import React, { useState } from 'react';
import { X, Target, User, Save, Trash2, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SettingsModal({ onClose }) {
  const { goals, setGoals, clientProfile, setClientProfile, clearSavedData, saveCurrentClient } = useApp();

  const [localGoals,   setLocalGoals]   = useState({ ...goals });
  const [localProfile, setLocalProfile] = useState({ ...clientProfile });
  const [saveClientName, setSaveClientName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setGoals(localGoals);
    setClientProfile(localProfile);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const handleSaveClient = () => {
    if (!saveClientName.trim()) return;
    saveCurrentClient(saveClientName.trim());
    setSaveClientName('');
    alert(`Cliente "${saveClientName}" salvo para comparação!`);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative soft-card w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Configurações</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Perfil do Cliente ── */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="soft-icon-box gradient-brand w-8 h-8">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Perfil do Cliente</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'name',    label: 'Nome / Razão Social', span: 2 },
              { key: 'cnpj',    label: 'CNPJ' },
              { key: 'region',  label: 'Região / Cidade' },
              { key: 'segment', label: 'Segmento' },
            ].map(({ key, label, span }) => (
              <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                <input
                  type="text"
                  value={localProfile[key] || ''}
                  onChange={(e) => setLocalProfile((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 transition-colors"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Metas Configuráveis ── */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="soft-icon-box gradient-warning w-8 h-8">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Metas de Benchmark</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Ticket Médio Ideal (R$)
              </label>
              <input
                type="number"
                value={localGoals.ticketMedio}
                onChange={(e) => setLocalGoals((g) => ({ ...g, ticketMedio: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Volume Ideal (und/ano)
              </label>
              <input
                type="number"
                value={localGoals.frequencia}
                onChange={(e) => setLocalGoals((g) => ({ ...g, frequencia: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-400 transition-colors"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Estes valores são usados no Diagnóstico Competitivo do Radar e no card de Ticket Médio.
          </p>
        </section>

        {/* ── Salvar cliente para comparação ── */}
        <section className="mb-6 p-4 rounded-2xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20">
          <p className="text-xs font-bold text-brand-600 dark:text-brand-300 uppercase tracking-wider mb-2">
            Salvar dados deste cliente para comparação
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: Loja do João - Florianópolis"
              value={saveClientName}
              onChange={(e) => setSaveClientName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-brand-200 dark:border-brand-500/30 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-400 transition-colors"
            />
            <button
              onClick={handleSaveClient}
              disabled={!saveClientName.trim()}
              className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium disabled:opacity-40 transition-opacity"
            >
              Salvar
            </button>
          </div>
        </section>

        {/* ── Limpar dados ── */}
        <section className="mb-6 p-4 rounded-2xl bg-error-50 dark:bg-error-500/10 border border-error-100 dark:border-error-500/20">
          <p className="text-xs font-bold text-error-600 dark:text-error-300 uppercase tracking-wider mb-1">Limpar todos os dados</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Remove as planilhas carregadas e redefine o estado do app.</p>
          <button
            onClick={() => { if (window.confirm('Tem certeza? Todos os dados carregados serão apagados.')) { clearSavedData(); onClose(); } }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-error-500 hover:bg-error-600 text-white text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Limpar dados
          </button>
        </section>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[var(--shadow-soft-brand)] transition-all hover:scale-[1.02]"
          >
            {saved ? <><RefreshCw className="w-4 h-4 animate-spin" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar</>}
          </button>
        </div>
      </div>
    </div>
  );
}
