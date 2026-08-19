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
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            {label}
          </label>
        )}
        
        <div className="relative w-full flex items-center">
          {icon && <span className="absolute left-0 text-slate-500">{icon}</span>}
          {prefix && <span className="absolute left-0 text-emerald-500 font-mono text-sm">{prefix}</span>}
          
          <input
            ref={ref}
            className={cn(
              // Eliminamos bg, eliminamos todos los bordes excepto el inferior, quitamos redondeo
              "w-full bg-transparent border-0 border-b border-slate-700 py-1.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors",
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