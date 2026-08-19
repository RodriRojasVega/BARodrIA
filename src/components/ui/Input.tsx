// src/components/ui/Input.tsx
import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  prefix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, prefix, ...props }, ref) => {
    return (
      <div className="space-y-1 w-full flex flex-col">
        {/* Label sutil y sin caja */}
        {label && (
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider font-mono">
            {label}
          </label>
        )}
        
        <div className="relative w-full flex items-center">
          {/* CORRECCIÓN: text-muted en lugar de text-slate-500 */}
          {icon && <span className="absolute left-0 text-muted">{icon}</span>}
          {prefix && <span className="absolute left-0 text-primary font-mono text-sm">{prefix}</span>}
          
          <input
            ref={ref}
            className={cn(
              // Eliminamos bg, eliminamos todos los bordes excepto el inferior, quitamos redondeo
              // CORRECCIÓN: placeholder-muted/70 en lugar de placeholder-slate-600
              "w-full bg-transparent border-0 border-b border-border-hover py-1.5 text-sm text-foreground placeholder-muted/70 focus:outline-none focus:ring-0 focus:border-primary transition-colors",
              icon ? "pl-7" : prefix ? "pl-5" : "px-0",
              className
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);
Input.displayName = 'Input';