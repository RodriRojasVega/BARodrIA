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
    <div className={cn("flex items-center justify-between gap-3 bg-surface/30 p-2 rounded-lg border border-border/80 hover:border-border-hover transition group", className)}>
      <div className="flex-1 flex items-center gap-3 min-w-0">
        {children}
      </div>
      
      {onRemove && (
        <button 
          type="button" 
          onClick={onRemove}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded text-muted hover:bg-danger/20 hover:text-danger transition-colors opacity-50 group-hover:opacity-100"
          title="Eliminar elemento"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}