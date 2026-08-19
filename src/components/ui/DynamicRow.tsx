// src/components/ui/DynamicRow.tsx
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface DynamicRowProps {
  children: ReactNode;
  onRemove?: () => void;
  className?: string;
}

export function DynamicRow({ children, onRemove, className }: DynamicRowProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3 bg-slate-900/30 p-2 rounded-lg border border-slate-800/80 hover:border-slate-700 transition group", className)}>
      <div className="flex-1 flex items-center gap-3 min-w-0">
        {children}
      </div>
      
      {onRemove && (
        <button 
          type="button" 
          onClick={onRemove}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:bg-rose-950/50 hover:text-rose-400 transition-colors opacity-50 group-hover:opacity-100"
          title="Eliminar elemento"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}