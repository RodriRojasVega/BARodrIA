import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar as UIKitSidebar, type NavItem as UIKitNavItem } from '@/components/ui/Sidebar';
import { NAVIGATION_CONFIG, type NavigationEntry, type BaseNavigationItem } from '@/config/navigation.config';

export function MainSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Normalizar rutas para comparación insensible a mayúsculas/minúsculas y barras finales
  const currentPath = location.pathname.toLowerCase().replace(/\/+$/, '') || '/';

  // Encontrar el título o id activo basado en la ruta actual
  const findActiveId = (entries: NavigationEntry[]): string => {
    for (const entry of entries) {
      if (entry.type === 'single') {
        const itemPath = entry.href.toLowerCase().replace(/\/+$/, '') || '/';
        if (itemPath === currentPath) {
          return entry.title;
        }
      } else if (entry.type === 'group') {
        for (const subItem of entry.items) {
          const subPath = subItem.href.toLowerCase().replace(/\/+$/, '') || '/';
          if (subPath === currentPath) {
            return subItem.title;
          }
        }
      }
    }
    return '';
  };

  const activeId = findActiveId(NAVIGATION_CONFIG);

  // Mapear NAVIGATION_CONFIG a UIKitNavItem
  const mapNavigationConfig = (entries: NavigationEntry[]): UIKitNavItem[] => {
    return entries.map((entry): UIKitNavItem => {
      if (entry.type === 'single') {
        const IconComponent = entry.icon;
        const itemPath = entry.href;
        return {
          id: entry.title,
          label: entry.title,
          icon: <IconComponent size={20} />,
          onClick: () => navigate(itemPath),
          special: 'special' in entry ? (entry as BaseNavigationItem & { special?: boolean }).special : undefined,
        };
      } else {
        const GroupIcon = entry.icon;
        const groupChildren: UIKitNavItem[] = entry.items.map((subItem) => {
          const SubIcon = subItem.icon;
          const subPath = subItem.href;
          return {
            id: subItem.title,
            label: subItem.title,
            icon: <SubIcon size={18} />,
            onClick: () => navigate(subPath),
            special: subItem.disabled ? true : undefined,
          };
        });

        return {
          id: entry.title,
          label: entry.title,
          icon: GroupIcon ? <GroupIcon size={20} /> : <span className="text-lg">📁</span>,
          children: groupChildren,
          defaultOpen: entry.defaultOpen ?? false,
        };
      }
    });
  };

  const uiKitItems = mapNavigationConfig(NAVIGATION_CONFIG);

  return (
    <UIKitSidebar
      items={uiKitItems}
      activeId={activeId}
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      logo={
        <div className="flex items-center gap-3 truncate">
          <span className="text-2xl shrink-0">🍸</span>
          <div className="overflow-hidden truncate">
            <h1 className="font-bold text-lg text-primary tracking-wider truncate">BARodrIA</h1>
            <span className="text-xs text-muted font-medium tracking-widest uppercase block truncate">Ecosistema Mixológico</span>
          </div>
        </div>
      }
    />
  );
}

