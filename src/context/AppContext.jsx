/**
 * AppContext — Estado global do ZT Dashboard
 *
 * Gerencia:
 * - Dados carregados (stockData, monthlyPurchasesData, shipmentsData)
 * - Filtro de período (meses selecionados)
 * - Metas configuráveis (ticketMedio, frequencia)
 * - Perfil do cliente (nome, CNPJ, região, segmento)
 * - Clientes para comparação (multi-upload)
 * - Carrinho de pedidos
 * - Persistência em localStorage
 */
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const AppContext = createContext(null);

const MONTH_KEYS   = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const MONTH_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

// ──────────────────────────────────────────────────────────────────────────────
// Helper: filter parsed data by period range
// ──────────────────────────────────────────────────────────────────────────────
export function filterByPeriod(monthlyPurchasesData, periodFilter) {
  if (!monthlyPurchasesData) return null;
  const { start, end } = periodFilter;
  const activeMonths = MONTH_KEYS.slice(start, end + 1);

  return monthlyPurchasesData.map((item) => {
    const monthlyUnits   = {};
    const monthlyRevenue = {};
    let totalUnits   = 0;
    let totalRevenue = 0;

    activeMonths.forEach((m) => {
      const u = item.monthlyUnits?.[m]   ?? 0;
      const r = item.monthlyRevenue?.[m] ?? 0;
      monthlyUnits[m]   = u;
      monthlyRevenue[m] = r;
      totalUnits   += u;
      totalRevenue += r;
    });

    return {
      ...item,
      monthlyUnits,
      monthlyRevenue,
      totalUnits,
      totalRevenue,
      avgMonthlyRevenue: activeMonths.length > 0 ? totalRevenue / activeMonths.length : 0,
    };
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Helper: compute notifications from stock + purchases data
// ──────────────────────────────────────────────────────────────────────────────
function computeNotifications(stockData, monthlyPurchasesData) {
  if (!stockData || !monthlyPurchasesData) return [];
  const alerts = [];

  monthlyPurchasesData.forEach((item) => {
    const inStock = stockData.find(
      (s) => s.code === item.code || s.name === item.name,
    );
    if (!inStock) return;

    const monthsWithPurchases = MONTH_KEYS.filter((m) => (item.monthlyUnits?.[m] ?? 0) > 0);
    if (monthsWithPurchases.length === 0) return;

    const avgMonthlyVolume = item.totalUnits / monthsWithPurchases.length;
    if (avgMonthlyVolume === 0) return;

    const daysToStockout = (inStock.quantity / (avgMonthlyVolume / 30));

    if (inStock.quantity < 10) {
      alerts.push({
        id:      `critical-${item.code}`,
        type:    'critical',
        product: item.name,
        message: `Estoque crítico: ${inStock.quantity} und restantes`,
        path:    '/restock',
      });
    } else if (daysToStockout < 30) {
      alerts.push({
        id:      `warning-${item.code}`,
        type:    'warning',
        product: item.name,
        message: `Ruptura em ~${Math.round(daysToStockout)} dias`,
        path:    '/restock',
      });
    }
  });

  return alerts.sort((a, b) => (a.type === 'critical' ? -1 : 1)).slice(0, 20);
}

// ──────────────────────────────────────────────────────────────────────────────
// Persistence helpers
// ──────────────────────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  stockData:           'zt_stockData',
  monthlyPurchasesData:'zt_monthlyPurchasesData',
  shipmentsData:       'zt_shipmentsData',
  periodFilter:        'zt_periodFilter',
  goals:               'zt_goals',
  clientProfile:       'zt_clientProfile',
  clients:             'zt_clients',
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full — silently ignore
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  // Uploaded data
  const [stockData, setStockDataRaw]           = useState(() => loadFromStorage(STORAGE_KEYS.stockData, null));
  const [monthlyPurchasesData, setMonthlyRaw]  = useState(() => loadFromStorage(STORAGE_KEYS.monthlyPurchasesData, null));
  const [shipmentsData, setShipmentsRaw]       = useState(() => loadFromStorage(STORAGE_KEYS.shipmentsData, null));

  // Period filter
  const [periodFilter, setPeriodFilterRaw] = useState(() =>
    loadFromStorage(STORAGE_KEYS.periodFilter, { start: 0, end: 11 }),
  );

  // Goals
  const [goals, setGoalsRaw] = useState(() =>
    loadFromStorage(STORAGE_KEYS.goals, { ticketMedio: 250, frequencia: 3500 }),
  );

  // Client profile
  const [clientProfile, setClientProfileRaw] = useState(() =>
    loadFromStorage(STORAGE_KEYS.clientProfile, {
      name: '', cnpj: '', region: 'Santa Catarina', segment: 'Varejo',
    }),
  );

  // Saved clients for comparison
  const [clients, setClientsRaw] = useState(() =>
    loadFromStorage(STORAGE_KEYS.clients, []),
  );

  // Cart
  const [cartItems, setCartItems] = useState([]);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Presentation settings
  const [presentationSettings, setPresentationSettings] = useState({
    hideCosts: false, compactMode: false,
  });

  // ── Persist whenever state changes ──────────────────────────────────────────
  useEffect(() => { saveToStorage(STORAGE_KEYS.stockData,            stockData);           }, [stockData]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.monthlyPurchasesData, monthlyPurchasesData); }, [monthlyPurchasesData]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.shipmentsData,        shipmentsData);        }, [shipmentsData]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.periodFilter,         periodFilter);         }, [periodFilter]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.goals,                goals);                }, [goals]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.clientProfile,        clientProfile);        }, [clientProfile]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.clients,              clients);              }, [clients]);

  // ── Setters that also persist ────────────────────────────────────────────────
  const setStockData           = (v) => setStockDataRaw(v);
  const setMonthlyPurchasesData = (v) => setMonthlyRaw(v);
  const setShipmentsData       = (v) => setShipmentsRaw(v);
  const setPeriodFilter        = (v) => setPeriodFilterRaw(v);
  const setGoals               = (v) => setGoalsRaw(v);
  const setClientProfile       = (v) => setClientProfileRaw(v);
  const setClients             = (v) => setClientsRaw(v);

  // ── Derived: filtered data by period ────────────────────────────────────────
  const filteredMonthlyData = useMemo(
    () => filterByPeriod(monthlyPurchasesData, periodFilter),
    [monthlyPurchasesData, periodFilter],
  );

  // ── Derived: notifications ───────────────────────────────────────────────────
  const notifications = useMemo(
    () => computeNotifications(stockData, monthlyPurchasesData),
    [stockData, monthlyPurchasesData],
  );

  // ── Cart helpers ─────────────────────────────────────────────────────────────
  const addToCart = (productData) => {
    setCartItems((prev) => {
      const exists = prev.find((p) => p.id === productData.id);
      if (exists) return prev.map((p) => p.id === productData.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { ...productData, qty: 1 }];
    });
    setIsSimulatorOpen(true);
  };

  // ── Saved clients helpers ─────────────────────────────────────────────────────
  const saveCurrentClient = (name) => {
    if (!stockData || !monthlyPurchasesData) return;
    const entry = {
      id:                  Date.now(),
      name:                name || clientProfile.name || `Cliente ${clients.length + 1}`,
      savedAt:             new Date().toISOString(),
      stockData,
      monthlyPurchasesData,
      shipmentsData,
    };
    setClients((prev) => [...prev.slice(-4), entry]); // keep last 5
  };

  const removeClient = (id) => setClients((prev) => prev.filter((c) => c.id !== id));

  const clearSavedData = () => {
    setStockDataRaw(null);
    setMonthlyRaw(null);
    setShipmentsRaw(null);
    setCartItems([]);
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  };

  // ── Exposed context value ────────────────────────────────────────────────────
  return (
    <AppContext.Provider value={{
      // Raw data
      stockData, setStockData,
      monthlyPurchasesData, setMonthlyPurchasesData,
      shipmentsData, setShipmentsData,

      // Filtered data (use this in tabs instead of raw)
      filteredMonthlyData,

      // Period
      periodFilter, setPeriodFilter,
      MONTH_KEYS, MONTH_LABELS,

      // Goals
      goals, setGoals,

      // Profile
      clientProfile, setClientProfile,

      // Multi-client comparison
      clients, setClients, saveCurrentClient, removeClient,

      // Cart
      cartItems, setCartItems, addToCart,
      isSimulatorOpen, setIsSimulatorOpen,

      // Settings
      presentationSettings, setPresentationSettings,

      // Notifications
      notifications,

      // Helpers
      clearSavedData,
      isDataLoaded: !!(stockData && monthlyPurchasesData),
      hasShipments: !!shipmentsData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
