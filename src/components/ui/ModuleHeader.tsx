// src/components/ui/ModuleHeader.tsx
import type { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ModuleHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  showKpis?: boolean;
  onToggleKpis?: () => void;
  kpiButtonText?: string;
  primaryAction: ReactNode;
  className?: string;
}

export function ModuleHeader({
  icon,
  title,
  subtitle,
  showKpis = false,
  onToggleKpis,
  kpiButtonText = "KPIs",
  primaryAction,
  className
}: ModuleHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent py-2 shrink-0", className)}>
      {/* Izquierda: Icono y Títulos */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-surface border border-border rounded-xl text-primary flex items-center justify-center shadow-inner">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-wide flex items-center gap-2">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Derecha: Botón de KPIs condicional y Acción Principal */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        {/* Renderiza el botón solo si la función onToggleKpis fue provista */}
        {typeof onToggleKpis === 'function' && (
          <Button
            variant={showKpis ? 'primary' : 'secondary'}
            size="sm"
            onClick={onToggleKpis}
            className="text-xs"
          >
            <span>📊</span>
            <span className="ml-1.5">{kpiButtonText}</span>
            <span className="text-[10px] ml-1 opacity-70">{showKpis ? "▲" : "▼"}</span>
          </Button>
        )}

        {primaryAction}
      </div>
    </div>
  );
}