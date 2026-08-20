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
        "bg-surface border-r border-border flex flex-col shrink-0 transition-all duration-300 ease-in-out relative text-foreground",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Botón flotante para colapsar / expandir (Escritorio) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-surface border border-border text-muted hover:text-foreground rounded-full p-1 shadow-md z-10 hidden md:flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
        title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        type="button"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header del Sidebar */}
      <div className={cn("p-6 border-b border-border flex items-center", isCollapsed ? "justify-center px-2" : "gap-3")}>
        <span className="text-2xl shrink-0">🍸</span>
        {!isCollapsed && (
          <div className="overflow-hidden truncate">
            <h1 className="font-bold text-lg text-primary tracking-wider truncate">BARodrIA</h1>
            <span className="text-xs text-muted font-medium tracking-widest uppercase block truncate">Ecosistema Mixológico</span>
          </div>
        )}
      </div>

      {/* Lista de Navegación */}
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
                  ? 'bg-primary/10 text-primary shadow-sm' 
                  : item.special
                    ? 'border border-primary/20 bg-primary/5 text-muted hover:text-foreground hover:bg-primary/10'
                    : 'text-muted hover:bg-surface/80 hover:text-foreground'
              )}
            >
              <span className="shrink-0">
                <Icon size={20} className={cn("transition-colors", isActive ? "text-primary" : "group-hover:text-foreground")} />
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
        <div className="p-4 border-t border-border text-xs text-muted space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span>Sistema Modular Activo</span>
          </div>
          <div className="text-[10px] text-muted/70 font-mono">React v18 / Vite</div>
        </div>
      )}
    </aside>
  );
}