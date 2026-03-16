import { useCallback } from "react";
import { Link, useLocation } from "react-router";
import {
  UploadCloud,
  LayoutDashboard,
  TrendingDown,
  PackageX,
  ShoppingCart,
  Layers,
  Bot,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: "pro" | "new";
};

const navItems: NavItem[] = [
  { name: "Carregar Relatórios",  path: "/upload",        icon: <UploadCloud className="w-5 h-5" /> },
  { name: "Visão Geral",          path: "/overview",      icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: "Análise de Omissões",  path: "/gap",           icon: <TrendingDown className="w-5 h-5" /> },
  { name: "Previsão de Ruptura",  path: "/restock",       icon: <PackageX className="w-5 h-5" />, badge: "pro" },
  { name: "Venda Certa",          path: "/opportunities", icon: <ShoppingCart className="w-5 h-5" /> },
  { name: "Kits Estratégicos",    path: "/bundles",       icon: <Layers className="w-5 h-5" /> },
  { name: "AI Copilot",           path: "/copilot",       icon: <Bot className="w-5 h-5" />, badge: "new" },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  const collapsed = !isExpanded && !isHovered && !isMobileOpen;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 h-screen transition-all duration-300 ease-in-out z-50
        bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800
        ${isExpanded || isMobileOpen || isHovered ? "w-[260px]" : "w-[80px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={`py-6 px-4 flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-[var(--shadow-soft-brand)] shrink-0">
            <img
              src="/src/assets/zt-logo.png"
              alt="ZT"
              className="w-6 h-6 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          {!collapsed && (
            <div>
              <span className="block text-sm font-bold tracking-tight text-gray-900 dark:text-white font-space leading-none">
                ZT Dashboard
              </span>
              <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">Sales BI</span>
            </div>
          )}
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gray-100 dark:bg-gray-800 mb-4" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3">
        {!collapsed && (
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-2 mb-3">
            Menu
          </p>
        )}
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${collapsed ? "justify-center" : ""}
                    ${active
                      ? "gradient-brand text-white shadow-[var(--shadow-soft-brand)]"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  <span className={`shrink-0 ${active ? "text-white" : ""}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.name}</span>
                      {item.badge && (
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                          active
                            ? "bg-white/20 text-white"
                            : item.badge === "new"
                              ? "bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300"
                              : "bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-300"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer widget */}
      {!collapsed && (
        <div className="px-3 pb-4">
          <SidebarWidget />
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
