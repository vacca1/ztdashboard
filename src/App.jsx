import React, { useState, useRef, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router';
import { UploadCloud, AlertCircle, ArrowRight, Sparkles, X } from 'lucide-react';

import AppLayout from './layout/AppLayout';
import { AppProvider, useApp } from './context/AppContext';
import { parseStockExcel, parseMonthlyPurchasesExcel, parseShipmentsExcel } from './utils/excelParser';
import UploadZone from './components/UploadZone';
import SuspenseLoader from './components/SuspenseLoader';

// Lazy-loaded tabs
const OverviewDashboard    = lazy(() => import('./components/OverviewDashboard'));
const GapAnalysisTab       = lazy(() => import('./components/GapAnalysisTab'));
const SalesOpportunitiesTab = lazy(() => import('./components/SalesOpportunitiesTab'));
const SmartBundlesTab      = lazy(() => import('./components/SmartBundlesTab'));
const AiCopilotTab         = lazy(() => import('./components/AiCopilotTab'));
const PredictiveRestockTab = lazy(() => import('./components/PredictiveRestockTab'));
const ShipmentsDashboard   = lazy(() => import('./components/ShipmentsDashboard'));
const ClientProfile        = lazy(() => import('./components/ClientProfile'));
const ClientComparison     = lazy(() => import('./components/ClientComparison'));

// ── Upload view ──────────────────────────────────────────────────────────────
function UploadView() {
  const {
    stockData, setStockData,
    monthlyPurchasesData, setMonthlyPurchasesData,
    shipmentsData, setShipmentsData,
    isDataLoaded,
    clientProfile,
  } = useApp();

  const [error, setError]         = useState('');
  const [isProcessing, setProc]   = useState(null);

  const stockRef    = useRef(null);
  const purchasesRef = useRef(null);
  const shipmentsRef = useRef(null);

  const navigate = useNavigate();

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;
    event.target.value = '';
    setError('');
    setProc(type);
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));

    try {
      if (type === 'stock') {
        setStockData(await parseStockExcel(file));
      } else if (type === 'monthly-purchases') {
        setMonthlyPurchasesData(await parseMonthlyPurchasesExcel(file));
      } else if (type === 'shipments') {
        setShipmentsData(await parseShipmentsExcel(file));
      }
    } catch (err) {
      console.error(err);
      setError(`Erro ao processar planilha: ${err.message}`);
    } finally {
      setProc(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
      {error && (
        <div className="mb-6 w-full max-w-2xl bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/30 text-error-600 dark:text-error-400 px-5 py-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium flex-1">{error}</p>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-5 shadow-[var(--shadow-soft-brand)]">
          <UploadCloud className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Conectar Base de Dados</h2>
        {clientProfile.name && (
          <p className="text-sm text-brand-500 font-semibold mb-1">{clientProfile.name}</p>
        )}
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm">
          Carregue suas planilhas para transformá-las em insights visuais de vendas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
        <UploadZone
          label="Estoque Atual"
          description=".xlsx Exportado do ERP"
          isProcessing={isProcessing === 'stock'}
          isSuccess={!!stockData}
          successMessage={`${stockData?.length ?? 0} SKUs identificados`}
          onFileSelect={(e) => handleFileUpload(e, 'stock')}
          inputRef={stockRef}
          accentColor="brand"
        />
        <UploadZone
          label="Compras do Cliente"
          description="Histórico mensal (Jan-Dez)"
          isProcessing={isProcessing === 'monthly-purchases'}
          isSuccess={!!monthlyPurchasesData}
          successMessage={`${monthlyPurchasesData?.length ?? 0} produtos (12 meses)`}
          onFileSelect={(e) => handleFileUpload(e, 'monthly-purchases')}
          inputRef={purchasesRef}
          accentColor="brand"
        />
        <UploadZone
          label="Chegada Futura"
          description="Melhora precisão (opcional)"
          isProcessing={isProcessing === 'shipments'}
          isSuccess={!!shipmentsData}
          successMessage={`${shipmentsData?.detailed?.length ?? 0} itens mapeados`}
          onFileSelect={(e) => handleFileUpload(e, 'shipments')}
          inputRef={shipmentsRef}
          accentColor="brand"
          optional={true}
        />
      </div>

      {isDataLoaded && (
        <div className="mt-12 flex flex-col items-center">
          <div className="flex items-center gap-2 text-success-600 dark:text-success-400 text-xs font-bold mb-5 bg-success-50 dark:bg-success-500/10 px-4 py-2 rounded-full border border-success-200 dark:border-success-500/20">
            <Sparkles className="w-4 h-4" />
            MOTOR INTELIGENTE ATIVO
          </div>
          <button
            onClick={() => navigate('/overview')}
            className="px-8 py-3.5 flex items-center gap-3 text-white rounded-2xl gradient-brand hover:scale-105 transition-transform shadow-[var(--shadow-soft-brand)]"
          >
            Iniciar Modo Apresentação
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Protected route wrapper ──────────────────────────────────────────────────
function Protected({ children }) {
  const { isDataLoaded } = useApp();
  return isDataLoaded ? children : <Navigate to="/upload" replace />;
}

// ── Main content ─────────────────────────────────────────────────────────────
function AppContent() {
  return (
    <Suspense fallback={<SuspenseLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/"            element={<Navigate to="/upload" replace />} />
          <Route path="/upload"      element={<UploadView />} />

          <Route path="/overview"    element={<Protected><OverviewDashboard /></Protected>} />
          <Route path="/gap"         element={<Protected><GapAnalysisTab /></Protected>} />
          <Route path="/restock"     element={<Protected><PredictiveRestockTab /></Protected>} />
          <Route path="/opportunities" element={<Protected><SalesOpportunitiesTab /></Protected>} />
          <Route path="/bundles"     element={<Protected><SmartBundlesTab /></Protected>} />
          <Route path="/embarques"   element={<Protected><ShipmentsDashboard /></Protected>} />
          <Route path="/copilot"     element={<Protected><AiCopilotTab /></Protected>} />
          <Route path="/perfil"      element={<ClientProfile />} />
          <Route path="/comparativo" element={<ClientComparison />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}
