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
  
  // CORRECCIÓN: focus:ring-primary en lugar de emerald
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wider transition-all duration-200 outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed select-none";
  
  const variants = {
    // CORRECCIÓN: bg-primary y hover:bg-primary-hover
    primary: "bg-primary hover:bg-primary-hover text-white uppercase shadow-lg border border-primary/20",
    
    // CORRECCIÓN: text-foreground en lugar de slate-200
    secondary: "bg-surface hover:bg-surface-muted text-foreground border border-border uppercase",
    
    // CORRECCIÓN: bg-danger/10 y text-danger en lugar de rose-950 y rose-400
    danger: "bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 uppercase",
    
    ghost: "bg-transparent hover:bg-surface/60 text-muted hover:text-foreground uppercase",
    
    // CORRECCIÓN: text-muted hover:text-foreground
    inline: "bg-surface hover:bg-surface-muted text-muted hover:text-foreground border border-border uppercase font-mono text-[10px]",
    
    // CORRECCIÓN: danger semántico con opacidades
    'inline-danger': "bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 hover:border-danger/40 uppercase font-mono text-[10px]"
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