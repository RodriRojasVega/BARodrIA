// src/components/ui/DualAsignador.tsx
import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface DualAsignadorProps {
  tituloIzq: string;
  contadorIzq: number;
  iconoIzq?: ReactNode;
  placeholderBusquedaIzq?: string;
  valorBusquedaIzq?: string;
  onChangeBusquedaIzq?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  childrenIzq: ReactNode;

  tituloDer: string;
  iconoDer?: ReactNode;
  placeholderBusquedaDer?: string;
  valorBusquedaDer?: string;
  onChangeBusquedaDer?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  childrenDer: ReactNode;
}

export function DualAsignador({
  tituloIzq,
  contadorIzq,
  iconoIzq = '✅',
  placeholderBusquedaIzq = 'Buscar asignados...',
  valorBusquedaIzq,
  onChangeBusquedaIzq,
  childrenIzq,

  tituloDer,
  iconoDer = '📋',
  placeholderBusquedaDer = 'Buscar disponibles...',
  valorBusquedaDer,
  onChangeBusquedaDer,
  childrenDer,
}: DualAsignadorProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[450px]">
      
      {/* COLUMNA IZQUIERDA: Elementos Asignados / Distribuidos */}
      <div className="flex flex-col h-full bg-background/40 border border-border/80 rounded-2xl overflow-hidden shadow-inner">
        <header className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-border bg-primary/10">
          <div className="flex items-center gap-2">
            <span>{iconoIzq}</span>
            <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider font-mono">
              {tituloIzq} (<span className="text-foreground">{contadorIzq}</span>)
            </h4>
          </div>
        </header>

        {onChangeBusquedaIzq && (
          <div className="p-3 shrink-0 border-b border-border">
            <Input 
              icon={<Search size={14} />} 
              placeholder={placeholderBusquedaIzq} 
              value={valorBusquedaIzq} 
              onChange={onChangeBusquedaIzq} 
              className="h-8 py-0 text-xs" 
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {childrenIzq}
        </div>
      </div>

      {/* COLUMNA DERECHA: Catálogo General / Disponibles */}
      <div className="flex flex-col h-full bg-background/40 border border-border/80 rounded-2xl overflow-hidden shadow-inner">
        <header className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-border bg-surface/20">
          <div className="flex items-center gap-2">
            <span>{iconoDer}</span>
            <h4 className="text-[11px] font-bold text-muted uppercase tracking-wider font-mono">
              {tituloDer}
            </h4>
          </div>
        </header>

        {onChangeBusquedaDer && (
          <div className="p-3 shrink-0 border-b border-border">
            <Input 
              icon={<Search size={14} />} 
              placeholder={placeholderBusquedaDer} 
              value={valorBusquedaDer} 
              onChange={valorBusquedaDer !== undefined ? onChangeBusquedaDer : undefined} 
              className="h-8 py-0 text-xs" 
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {childrenDer}
        </div>
      </div>

    </div>
  );
}