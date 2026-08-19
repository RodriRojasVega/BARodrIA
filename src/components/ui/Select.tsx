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
        {label && <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono block">{label}</label>}
        <div className="relative w-full">
          <select
            ref={ref}
            className={cn(
              "w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition shadow-inner cursor-pointer",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';