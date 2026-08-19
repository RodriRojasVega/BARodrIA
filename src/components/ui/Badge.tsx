// src/components/ui/Badge.tsx
import type { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const baseStyles = "font-bold border uppercase tracking-wider inline-flex items-center justify-center font-mono";

  const variants = {
    success: "bg-emerald-950/60 text-primary border-emerald-900/40",
    warning: "bg-amber-950/60 text-amber-400 border-amber-900/40",
    danger: "bg-rose-950/60 text-rose-400 border-rose-900/40",
    info: "bg-sky-950/60 text-sky-400 border-sky-900/40",
    purple: "bg-purple-950/60 text-purple-400 border-purple-900/40",
    default: "bg-surface text-muted border-border"
  };

const sizes = {
    // Usamos text-xs (12px) o una clase arbitraria estandarizada, 
    // en lugar de forzar 9px que puede ser ilegible en algunas pantallas.
    sm: "text-[10px] px-2 py-0.5 rounded",
    md: "text-xs px-2.5 py-1 rounded-md"
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}