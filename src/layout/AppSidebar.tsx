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
  Ship,
  Users,
  UserCircle,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: "pro" | "new";
  group?: string;
};

const navItems: NavItem[] = [
  // Dados
  { name: "Carregar Relatórios",  path: "/upload",        icon: <UploadCloud className="w-5 h-5" />, group: "Dados" },
  // Análises
  { name: "Visão Geral",          path: "/overview",      icon: <LayoutDashboard className="w-5 h-5" />, group: "Análises" },
  { name: "Análise de Omissões",  path: "/gap",           icon: <TrendingDown className="w-5 h-5" />, group: "Análises" },
  { name: "Previsão de Ruptura",  path: "/restock",       icon: <PackageX className="w-5 h-5" />, badge: "pro", group: "Análises" },
  { name: "Venda Certa",          path: "/opportunities", icon: <ShoppingCart className="w-5 h-5" />, group: "Análises" },
  { name: "Kits Estratégicos",    path: "/bundles",       icon: <Layers className="w-5 h-5" />, group: "Análises" },
  { name: "Embarques",            path: "/embarques",     icon: <Ship className="w-5 h-5" />, group: "Análises" },
  // IA & Clientes
  { name: "AI Copilot",           path: "/copilot",       icon: <Bot className="w-5 h-5" />, badge: "new", group: "IA" },
  { name: "Perfil do Cliente",    path: "/perfil",        icon: <UserCircle className="w-5 h-5" />, group: "IA" },
  { name: "Comparativo",          path: "/comparativo",   icon: <Users className="w-5 h-5" />, group: "IA" },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  const collapsed = !isExpanded && !isHovered && !isMobileOpen;

  // Group items for separator labels
  const groups = [
    { label: "Dados",    items: navItems.filter((n) => n.group === "Dados") },
    { label: "Análises", items: navItems.filter((n) => n.group === "Análises") },
    { label: "IA",       items: navItems.filter((n) => n.group === "IA") },
  ];

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
      {/* ── Logo ── */}
      <div className={`py-5 px-4 flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
        <Link to="/" className="flex items-center gap-3 shrink-0">
          {/* Logo box — fundo preto como a logo ZT */}
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] shrink-0 overflow-hidden">
            <img
              src="/zt-logo.png"
              alt="ZT"
              className="w-8 h-8 object-contain"
            />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <span className="block text-sm font-bold tracking-tight text-gray-900 dark:text-white font-space">
                ZT Dashboard
              </span>
              <span className="block text-[10px] font-semibold text-brand-500 uppercase tracking-widest">
                Sales BI
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gray-100 dark:bg-gray-800 mb-3" />

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-2 mb-2">
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
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
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
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
          </div>
        ))}
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
