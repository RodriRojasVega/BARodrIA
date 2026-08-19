// src/components/ui/Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'inline' | 'inline-danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  className, 
  disabled,
  ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wider transition-all duration-200 outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed select-none";
  
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-500 text-white uppercase shadow-lg border border-emerald-500/20",
    secondary: "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 uppercase",
    danger: "bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 uppercase",
    ghost: "bg-transparent hover:bg-slate-900/60 text-slate-400 hover:text-slate-100 uppercase",
    
    // Variantes miniatura para las tablas y filas dinámicas
    inline: "bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 uppercase font-mono text-[10px]",
    'inline-danger': "bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-900/40 hover:border-rose-800 uppercase font-mono text-[10px]"
  };

  const sizes = {
    sm: "px-3.5 py-2 text-xs rounded-xl",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl",
    inline: "px-2 py-1 rounded-lg gap-1.5", 
  };

  const isInline = variant.includes('inline');
  const activeSize = isInline ? sizes.inline : sizes[size];

  return (
    <button 
      className={cn(baseStyles, variants[variant], activeSize, className)} 
      disabled={disabled}
      {...props}
    >
      {icon && <span className={cn(children ? "mr-1.5" : "")}>{icon}</span>}
      {children}
    </button>
  );
}