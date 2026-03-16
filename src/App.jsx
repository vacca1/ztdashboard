import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router';
import { UploadCloud, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

import AppLayout from './layout/AppLayout';
import { parseStockExcel, parseMonthlyPurchasesExcel, parseShipmentsExcel } from './utils/excelParser';
import UploadZone from './components/UploadZone';
import SuspenseLoader from './components/SuspenseLoader';

// Lazy load feature components
const OverviewDashboard = lazy(() => import('./components/OverviewDashboard'));
const GapAnalysisTab = lazy(() => import('./components/GapAnalysisTab'));
const SalesOpportunitiesTab = lazy(() => import('./components/SalesOpportunitiesTab'));
const SmartBundlesTab = lazy(() => import('./components/SmartBundlesTab'));
const AiCopilotTab = lazy(() => import('./components/AiCopilotTab'));
const PredictiveRestockTab = lazy(() => import('./components/PredictiveRestockTab'));

// Sub-components
const UploadView = ({ stockData, monthlyPurchasesData, shipmentsData, isProcessing, handleFileUpload, stockInputRef, monthlyPurchasesInputRef, shipmentsInputRef, isDataLoaded, navigate }) => (
  <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
    <div className="text-center mb-12">
      <div className="w-20 h-20 rounded-sm bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-6 text-brand-500">
        <UploadCloud className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white/90 mb-3">Conectar Base de Dados</h2>
      <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
        Carregue suas planilhas para transformá-las em insights visuais
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
      <UploadZone
        label="Estoque Atual"
        description=".xlsx Exportado do ERP"
        isProcessing={isProcessing === 'stock'}
        isSuccess={!!stockData}
        successMessage={`${stockData?.length || 0} SKUs identificados`}
        onFileSelect={(e) => handleFileUpload(e, 'stock')}
        inputRef={stockInputRef}
        accentColor="brand"
      />
      <UploadZone
        label="Compras do Cliente"
        description="Histórico mensal (Jan-Dez)"
        isProcessing={isProcessing === 'monthly-purchases'}
        isSuccess={!!monthlyPurchasesData}
        successMessage={`${monthlyPurchasesData?.length || 0} produtos (12 meses)`}
        onFileSelect={(e) => handleFileUpload(e, 'monthly-purchases')}
        inputRef={monthlyPurchasesInputRef}
        accentColor="brand"
      />
      <UploadZone
        label="Chegada Futura"
        description="Melhora precisão (opcional)"
        isProcessing={isProcessing === 'shipments'}
        isSuccess={!!shipmentsData}
        successMessage={`${shipmentsData?.detailed?.length || 0} itens mapeados`}
        onFileSelect={(e) => handleFileUpload(e, 'shipments')}
        inputRef={shipmentsInputRef}
        accentColor="purple"
        optional={true}
      />
    </div>

    {isDataLoaded && (
      <div className="mt-14 flex flex-col items-center">
          <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold mb-6 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
              MOTOR INTELIGENTE ATIVO
          </div>
          <button
              onClick={() => navigate('/overview')}
              className="px-10 py-4 flex items-center gap-3 cursor-pointer text-white rounded-sm bg-brand-500 hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30"
          >
              Iniciar Modo Apresentação
              <ArrowRight className="w-5 h-5" />
          </button>
      </div>
    )}
  </div>
);

function AppContent() {
  const [activeTab, setActiveTab] = useState('upload');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  
  const [stockData, setStockData] = useState(null);
  const [monthlyPurchasesData, setMonthlyPurchasesData] = useState(null);
  const [shipmentsData, setShipmentsData] = useState(null);
  const [presentationSettings, setPresentationSettings] = useState({ hideCosts: false, compactMode: false });
  
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(null);

  const stockInputRef = useRef(null);
  const monthlyPurchasesInputRef = useRef(null);
  const shipmentsInputRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.substring(1) || 'upload';
    setActiveTab(path);
  }, [location]);

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    event.target.value = '';
    setError('');
    setIsProcessing(type);

    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    try {
      if (type === 'stock') {
        const data = await parseStockExcel(file);
        setStockData(data);
      } else if (type === 'monthly-purchases') {
        const data = await parseMonthlyPurchasesExcel(file);
        setMonthlyPurchasesData(data);
      } else if (type === 'shipments') {
        const data = await parseShipmentsExcel(file);
        setShipmentsData(data);
      }
    } catch (err) {
      console.error(err);
      setError(`Erro ao processar planilha de ${type}: ${err.message}`);
    } finally {
      setIsProcessing(null);
    }
  };

  const isDataLoaded = stockData && monthlyPurchasesData;
  const hasShipments = shipmentsData !== null;

  const addToCart = (productData) => {
      setCartItems(prev => {
          const exists = prev.find(p => p.id === productData.id);
          if (exists) {
              return prev.map(p => p.id === productData.id ? { ...p, qty: p.qty + 1 } : p);
          }
          return [...prev, { ...productData, qty: 1 }];
      });
      setIsSimulatorOpen(true);
  };

  return (
    <>
      {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-6 py-4 rounded-sm flex items-center gap-4 shadow-lg">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="font-medium text-sm">{error}</p>
          </div>
      )}

      <Suspense fallback={<SuspenseLoader />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={
              <UploadView 
                stockData={stockData} 
                monthlyPurchasesData={monthlyPurchasesData} 
                shipmentsData={shipmentsData}
                isProcessing={isProcessing}
                handleFileUpload={handleFileUpload}
                stockInputRef={stockInputRef}
                monthlyPurchasesInputRef={monthlyPurchasesInputRef}
                shipmentsInputRef={shipmentsInputRef}
                isDataLoaded={isDataLoaded}
                navigate={navigate}
              />
            } />
            
            <Route path="/overview" element={isDataLoaded ? (
              <OverviewDashboard
                  stockData={stockData}
                  shipmentsData={shipmentsData}
                  monthlyPurchasesData={monthlyPurchasesData}
                  hasShipments={hasShipments}
                  presentationSettings={presentationSettings}
              />
            ) : <Navigate to="/upload" />} />

            <Route path="/gap" element={isDataLoaded ? (
              <GapAnalysisTab
                  shipmentsData={shipmentsData}
                  monthlyPurchasesData={monthlyPurchasesData}
                  hasShipments={hasShipments}
                  presentationSettings={presentationSettings}
              />
            ) : <Navigate to="/upload" />} />

            <Route path="/restock" element={isDataLoaded ? (
              <PredictiveRestockTab
                  stockData={stockData}
                  monthlyPurchasesData={monthlyPurchasesData}
                  shipmentsData={shipmentsData}
                  hasShipments={hasShipments}
                  onAddToCart={addToCart}
                  presentationSettings={presentationSettings}
              />
            ) : <Navigate to="/upload" />} />

            <Route path="/opportunities" element={isDataLoaded ? (
              <SalesOpportunitiesTab
                  stockData={stockData}
                  monthlyPurchasesData={monthlyPurchasesData}
                  shipmentsData={shipmentsData}
                  hasShipments={hasShipments}
                  onAddToCart={addToCart}
                  presentationSettings={presentationSettings}
              />
            ) : <Navigate to="/upload" />} />

            <Route path="/bundles" element={isDataLoaded ? (
              <SmartBundlesTab
                  stockData={stockData}
                  monthlyPurchasesData={monthlyPurchasesData}
                  hasShipments={hasShipments}
                  onAddToCart={addToCart}
                  presentationSettings={presentationSettings}
              />
            ) : <Navigate to="/upload" />} />

            <Route path="/copilot" element={isDataLoaded ? (
              <AiCopilotTab
                  stockData={stockData}
                  monthlyPurchasesData={monthlyPurchasesData}
                  shipmentsData={shipmentsData}
                  hasShipments={hasShipments}
              />
            ) : <Navigate to="/upload" />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

