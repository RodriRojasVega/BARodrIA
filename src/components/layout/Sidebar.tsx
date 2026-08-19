import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Truck, 
  FlaskConical, 
  Wine, 
  ScrollText, 
  MonitorPlay, 
  Settings, 
  Palette,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/Button'; // Usando el UI Kit

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/insumos', label: 'Insumos', icon: ShoppingCart },
  { path: '/proveedores', label: 'Proveedores', icon: Truck },
  { path: '/subrecetas', label: 'Sub-recetas', icon: FlaskConical },
  { path: '/cocteles', label: 'Cócteles', icon: Wine },
  { path: '/cartas', label: 'Cartas', icon: ScrollText },
  { path: '/bartender', label: 'Modo Bartender', icon: MonitorPlay, special: true },
  { path: '/catalogos', label: 'Catálogos Estáticos', icon: Settings },
  { path: '/uikit', label: 'Laboratorio UI', icon: Palette },
];

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Botón flotante para colapsar / expandir (Escritorio) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-full p-1 shadow-md z-10 hidden md:flex items-center justify-center transition-transform hover:scale-110"
        title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header del Sidebar */}
      <div className={cn("p-6 border-b border-slate-800 flex items-center", isCollapsed ? "justify-center px-2" : "gap-3")}>
        <span className="text-2xl shrink-0">🍸</span>
        {!isCollapsed && (
          <div className="overflow-hidden truncate">
            <h1 className="font-bold text-lg text-emerald-400 tracking-wider truncate">BARodrIA</h1>
            <span className="text-xs text-slate-500 font-medium tracking-widest uppercase block truncate">Ecosistema Mixológico</span>
          </div>
        )}
      </div>

      {/* Lista de Navegación con Links de React Router */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 outline-none group',
                isCollapsed ? 'justify-center' : 'justify-start',
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 shadow-sm' 
                  : item.special
                    ? 'border border-emerald-500/20 bg-emerald-950/20 text-slate-400 hover:text-white hover:bg-emerald-900/40'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              )}
            >
              <span className="shrink-0">
                <Icon size={20} className={cn("transition-colors", isActive ? "text-emerald-400" : "group-hover:text-white")} />
              </span>
              
              {!isCollapsed && (
                <span className="truncate tracking-wide">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer del Sidebar */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sistema Modular Activo</span>
          </div>
          <div className="text-[10px] text-slate-600 font-mono">React v18 / Vite</div>
        </div>
      )}
    </aside>
  );
}