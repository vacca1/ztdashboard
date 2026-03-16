import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import { Menu, X, Settings } from "lucide-react";
import PeriodFilter from "../components/PeriodFilter";
import NotificationBell from "../components/NotificationBell";
import SettingsModal from "../components/SettingsModal";

const PAGE_TITLES: Record<string, string> = {
  "/upload":        "Carregar Relatórios",
  "/overview":      "Visão Geral",
  "/gap":           "Análise de Omissões",
  "/restock":       "Previsão de Ruptura",
  "/opportunities": "Venda Certa",
  "/bundles":       "Kits Estratégicos",
  "/embarques":     "Embarques",
  "/copilot":       "AI Copilot",
  "/perfil":        "Perfil do Cliente",
  "/comparativo":   "Comparativo",
};

// Pages that show the period filter
const FILTER_PAGES = ["/overview", "/gap", "/restock", "/opportunities", "/bundles", "/comparativo"];

const AppHeader: React.FC = () => {
  const [isAppMenuOpen, setAppMenuOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const location = useLocation();

  const pageTitle  = PAGE_TITLES[location.pathname] ?? "Dashboard";
  const showFilter = FILTER_PAGES.includes(location.pathname);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  return (
    <>
      <header className="sticky top-0 z-[99999] flex w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between w-full px-4 lg:px-6 py-3 gap-3">

          {/* Left: toggle + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleToggle}
              aria-label="Toggle Sidebar"
              className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb — desktop */}
            <div className="hidden lg:flex items-center gap-2 min-w-0">
              <Link to="/" className="text-xs text-gray-400 dark:text-gray-500 hover:text-brand-500 transition-colors shrink-0">
                ZT Dashboard
              </Link>
              <span className="text-gray-300 dark:text-gray-600 shrink-0">/</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-white truncate">{pageTitle}</span>
            </div>

            {/* Mobile logo */}
            <Link to="/" className="lg:hidden flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center overflow-hidden">
                <img src="/zt-logo.png" alt="ZT" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-white font-space">{pageTitle}</span>
            </Link>
          </div>

          {/* Right: period filter + actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Period filter — visible on analysis pages */}
            {showFilter && (
              <div className="hidden sm:block">
                <PeriodFilter />
              </div>
            )}

            {/* Mobile: dots menu */}
            <button
              onClick={() => setAppMenuOpen(!isAppMenuOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="5" cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <circle cx="19" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </button>

            <div className={`${isAppMenuOpen ? "flex" : "hidden"} lg:flex items-center gap-1.5`}>
              {/* Period filter — mobile */}
              {showFilter && (
                <div className="sm:hidden">
                  <PeriodFilter />
                </div>
              )}
              <NotificationBell />
              <ThemeToggleButton />
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Configurações"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings modal */}
      {isSettingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
};

export default AppHeader;
