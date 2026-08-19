// src/components/ui/Tabs.tsx
import type { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { 
  return twMerge(clsx(inputs)); 
}

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  activeColor?: string; // Nuevo: Clases de Tailwind para el color activo (ej. "border-purple-500 text-purple-400")
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChangeTab: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChangeTab, className }: TabsProps) {
  return (
    <div className={cn("flex border-b border-slate-800 px-2 gap-6 overflow-x-auto custom-scrollbar bg-transparent", className)}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        
        // Si la pestaña tiene un color personalizado asignado, lo usamos; de lo contrario, caemos en el esmeralda por defecto
        const customActiveStyle = tab.activeColor || "border-emerald-500 text-emerald-400";

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={cn(
              "py-3 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap outline-none select-none cursor-pointer bg-transparent",
              isActive 
                ? cn(customActiveStyle, "font-extrabold") 
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ id, activeTab, children, className }: TabPanelProps) {
  if (activeTab !== id) return null;

  return (
    <div className={cn("p-6 animate-fade-in bg-transparent", className)}>
      {children}
    </div>
  );
}