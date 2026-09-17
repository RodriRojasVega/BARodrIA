import {
  LayoutDashboard,
  Calendar,
  ScrollText,
  Star,
  Map,
  Wine,
  FlaskConical,
  ShoppingCart,
  Truck,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface BaseNavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
}

export interface NavigationGroup {
  title: string;
  icon?: LucideIcon;
  collapsible: boolean;
  defaultOpen?: boolean;
  items: BaseNavigationItem[];
}

export type NavigationEntry = 
  | ({ type: 'single' } & BaseNavigationItem)
  | ({ type: 'group' } & NavigationGroup);

export const NAVIGATION_CONFIG: NavigationEntry[] = [
  // Principal / Operación (Ítems directos)
  {
    type: 'single',
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    type: 'single',
    title: 'Eventos',
    href: '/eventos',
    icon: Calendar,
  },
  {
    type: 'single',
    title: 'Cartas',
    href: '/cartas',
    icon: ScrollText,
  },

  // Gestión Comercial & Clientes
  {
    type: 'group',
    title: 'Spots & Clientes',
    icon: Star,
    collapsible: false,
    items: [
      {
        title: 'Clientes',
        href: '/Clientes',
        icon: Star,
      },
      {
        title: 'Spots',
        href: '/spots',
        icon: Map,
      },
    ],
  },

  // Mixología & Producción (Grupo colapsable con subcategorías)
  {
    type: 'group',
    title: 'Mixología & Producción',
    icon: Wine,
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        title: 'Cócteles',
        href: '/cocteles',
        icon: Wine,
      },
      {
        title: 'Sub-recetas',
        href: '/subrecetas',
        icon: FlaskConical,
      },
      {
        title: 'Insumos',
        href: '/insumos',
        icon: ShoppingCart,
      },
    ],
  },

  // Activos & Configuración (Grupo colapsable con subcategorías)
  {
    type: 'group',
    title: 'Activos & Configuración',
    icon: Settings,
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        title: 'Proveedores',
        href: '/proveedores',
        icon: Truck,
      },
      {
        title: 'Catálogos Estáticos',
        href: '/catalogos',
        icon: Settings,
      },
    ],
  },
];
