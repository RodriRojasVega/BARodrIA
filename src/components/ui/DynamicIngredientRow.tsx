// src/components/ui/DynamicIngredientRow.tsx
import type { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface DynamicIngredientRowProps {
  children: ReactNode; // Aquí meteremos el Select de insumo, el Input de cantidad, etc.
  onRemove: () => void;
  className?: string;
}

export function DynamicIngredientRow({ children, onRemove, className }: DynamicIngredientRowProps) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-background/40 p-3 rounded-xl border border-border hover:border-primary/30 transition", 
      className
    )}>
      {/* Contenedor flexible para alinear los elementos internos (Selector, Input, etc.) */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {children}
      </div>

      {/* Botón de eliminar alineado */}
      <div className="flex justify-end sm:justify-center shrink-0">
        <Button 
          type="button" 
          variant="inline-danger" 
          onClick={onRemove}
          className="h-8 px-3 rounded-lg text-xs"
        >
          ✕ Eliminar
        </Button>
      </div>
    </div>
  );
}