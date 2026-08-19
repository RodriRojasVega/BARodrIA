// src/components/ui/Select.tsx
import { forwardRef } from 'react';
import type { SelectHTMLAttributes, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {/* CORRECCIÓN: text-muted en lugar de text-slate-300 */}
        {label && <label className="text-[11px] font-bold text-muted uppercase tracking-wider font-mono block">{label}</label>}
        <div className="relative w-full">
          <select
            ref={ref}
            className={cn(
              // CORRECCIÓN: bg-background y text-foreground
              "w-full appearance-none bg-background border border-border rounded-xl pl-4 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition shadow-inner cursor-pointer",
              className
            )}
            {...props}
          >
            {children}
          </select>
          {/* CORRECCIÓN: text-muted en lugar de text-slate-500 */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';