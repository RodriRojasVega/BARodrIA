// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Truck, FlaskConical, Wine, ScrollText, MonitorPlay, Settings, Palette } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/insumos', label: 'Insumos', icon: ShoppingCart },
  { path: '/proveedores', label: 'Proveedores', icon: Truck }, // <-- ¡Nuevo ítem agregado!
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

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍸</span>
          <div>
            <h1 className="font-bold text-lg text-emerald-400 tracking-wider">BARodrIA</h1>
            <span className="text-xs text-slate-500 font-medium tracking-widest uppercase">Ecosistema Mixológico</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200',
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : item.special
                    ? 'border border-emerald-500/20 bg-emerald-950/20 text-slate-400 hover:text-white hover:bg-emerald-900/40'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 space-y-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Sistema Modular Activo</span>
        </div>
        <div className="text-[10px] text-slate-600 font-mono">React v18 / Vite</div>
      </div>
    </aside>
  );
}