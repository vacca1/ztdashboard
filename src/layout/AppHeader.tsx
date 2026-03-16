import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import { Menu, X } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/upload":        "Carregar Relatórios",
  "/overview":      "Visão Geral",
  "/gap":           "Análise de Omissões",
  "/restock":       "Previsão de Ruptura",
  "/opportunities": "Venda Certa",
  "/bundles":       "Kits Estratégicos",
  "/copilot":       "AI Copilot",
};

const AppHeader: React.FC = () => {
  const [isAppMenuOpen, setAppMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] ?? "Dashboard";

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-[99999] flex w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 lg:border-b">
      <div className="flex items-center justify-between w-full px-4 lg:px-6 py-3 gap-4">

        {/* Left: toggle + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Page title — desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              ZT Dashboard
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-white">{pageTitle}</span>
          </div>

          {/* Logo — mobile only */}
          <Link to="/" className="lg:hidden">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-[var(--shadow-soft-brand)]">
              <img
                src="/src/assets/zt-logo.png"
                alt="ZT"
                className="w-5 h-5 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          </Link>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Mobile: extra menu toggle */}
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

          <div className={`${isAppMenuOpen ? "flex" : "hidden"} lg:flex items-center gap-2`}>
            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
