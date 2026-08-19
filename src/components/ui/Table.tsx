// src/components/ui/Table.tsx
import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { Select } from './Select';
import { Input } from './Input';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("bg-slate-950 border-0 rounded-t-2xl rounded-b-none overflow-hidden shadow-2xl flex-1 flex flex-col min-h-0", className)}>
      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-slate-900/80 backdrop-blur text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-slate-800 sticky top-0 z-10">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-900/40 font-sans text-slate-300">{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  isClickable?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, isClickable, onClick, className }: TableRowProps) {
  return (
    <tr 
      onClick={onClick}
      className={cn(
        "transition border-b border-slate-900/30 text-sm", 
        isClickable ? "hover:bg-slate-900/40 cursor-pointer group" : "",
        className
      )}
    >
      {children}
    </tr>
  );
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
}

export function TableCell({ children, align = 'left', className, ...props }: TableCellProps) {
  return (
    <td className={cn("py-3.5 px-4", `text-${align}`, className)} {...props}>
      {children}
    </td>
  );
}

interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  isSortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export function TableHeaderCell({ 
  children, 
  align = 'left', 
  isSortable, 
  sortDirection,
  onSort,
  className,
  ...props 
}: TableHeaderCellProps) {
  return (
    <th 
      onClick={isSortable ? onSort : undefined}
      className={cn(
        "py-3.5 px-4 font-semibold font-mono", 
        `text-${align}`, 
        isSortable ? "cursor-pointer hover:text-emerald-400 transition select-none group" : "",
        className
      )}
      {...props}
    >
      <div className={cn("inline-flex items-center gap-1.5", align === 'right' && "justify-end", align === 'center' && "justify-center")}>
        <span>{children}</span>
        {isSortable && (
          <span className="text-slate-500 group-hover:text-emerald-400 text-[10px]">
            {sortDirection === 'asc' ? '▲' : sortDirection === 'desc' ? '▼' : '↕'}
          </span>
        )}
      </div>
    </th>
  );
}

// --- BARRA DE HERRAMIENTAS (Sin bordes ni tarjetas, completamente flotante) ---

interface TableToolbarProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  placeholder?: string;
  limite: number;
  onLimiteChange: (val: number) => void;
  children?: ReactNode;
}

export function TableToolbar({ 
  busqueda, 
  onBusquedaChange, 
  placeholder = "Buscar...", 
  limite, 
  onLimiteChange,
  children 
}: TableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0 py-2">
      <div className="w-full md:w-1/3">
        <Input 
          icon={<Search size={14} />} 
          placeholder={placeholder} 
          value={busqueda} 
          onChange={(e) => onBusquedaChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {children}
        <Select 
          value={limite} 
          onChange={(e) => onLimiteChange(Number(e.target.value))}
          className="w-20 py-1.5 font-mono text-xs text-center"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </Select>
      </div>
    </div>
  );
}

interface TablePaginationProps {
  paginaActual: number;
  totalPaginas: number;
  onCambiarPagina: (pag: number) => void;
  elementosMostrados: number;
  totalElementos: number;
}

export function TablePagination({ 
  paginaActual, 
  totalPaginas, 
  onCambiarPagina, 
  elementosMostrados, 
  totalElementos 
}: TablePaginationProps) {
  return (
    <div className="px-2 py-3 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-400 shrink-0 bg-transparent border-t-0">
      <div>
        Mostrando <span className="text-white font-bold">{elementosMostrados}</span> de <span className="text-white font-bold">{totalElementos}</span> registros
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          disabled={paginaActual <= 1}
          onClick={() => onCambiarPagina(paginaActual - 1)}
          className="px-2.5 py-1 text-xs"
        >
          <ChevronLeft size={14} />
        </Button>
        
        <span className="px-3 py-1 bg-slate-900/80 border border-slate-800/80 rounded-none text-white font-bold">
          {paginaActual} / {Math.max(totalPaginas, 1)}
        </span>

        <Button 
          variant="secondary" 
          size="sm" 
          disabled={paginaActual >= totalPaginas || totalPaginas === 0}
          onClick={() => onCambiarPagina(paginaActual + 1)}
          className="px-2.5 py-1 text-xs"
        >
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}