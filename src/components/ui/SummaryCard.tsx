// src/components/ui/SummaryCard.tsx
import type { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface SummaryCardProps {
  label: string;
  value: ReactNode;
  badge?: ReactNode;          // Nuevo: Para la etiqueta lateral o badge que se ve en la captura
  valueClassName?: string;    // Para inyectar colores específicos (ej. text-primary)
  labelClassName?: string;    // Para inyectar colores específicos en el label (ej. text-muted)
  className?: string;
}

export function SummaryCard({ label, value, badge, valueClassName, className }: SummaryCardProps) {
  return (
    <div className={cn("flex flex-col justify-between p-4 sm:p-5 rounded-2xl border bg-background/40 border-border transition-all hover:bg-surface/30", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
          {label}
        </span>
        {badge && (
          <div className="shrink-0">
            {badge}
          </div>
        )}
      </div>
      <div className={cn("text-xl sm:text-2xl font-bold font-mono mt-2", valueClassName || "text-foreground")}>
        {value}
      </div>
    </div>
  );
}