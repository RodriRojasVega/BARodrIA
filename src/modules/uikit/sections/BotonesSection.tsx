// src/modules/uikit/sections/BotonesSection.tsx
import { Button } from '@/components/ui/Button';
import { MOCK_BOTONES_PRINCIPALES, MOCK_BOTONES_INLINE } from '../uiKitMockData';

export function BotonesSection() {
  return (
    <div className="space-y-8 max-w-4xl animate-fade-in py-2">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-white tracking-wide">Catálogo Completo de Botones y Acciones</h1>
        <p className="text-xs text-slate-400 mt-0.5">Átomos estandarizados para formularios principales, microacciones y estados del sistema.</p>
      </div>

      <div className="space-y-6">
        {/* Botones Principales */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono block">
            Botones Principales (Formularios y Modales)
          </span>
          <div className="flex flex-wrap gap-4 items-center">
            {MOCK_BOTONES_PRINCIPALES.map((btn, idx) => {
              const IconComponent = btn.icon;
              return (
                <Button 
                  key={idx} 
                  // @ts-ignore
                  variant={btn.variant} 
                  className={btn.className} 
                  icon={IconComponent ? <IconComponent size={14} /> : undefined}
                >
                  {btn.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Botones en Línea (Miniaturas) */}
        <div className="space-y-3 pt-4 border-t border-slate-900">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono block">
            Botones en Línea / Miniaturas (Tablas y Filas Dinámicas)
          </span>
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
            <span className="text-xs text-slate-500 italic mr-2 font-mono">Variantes compactas</span>
            {MOCK_BOTONES_INLINE.map((btn, idx) => {
              const IconComponent = btn.icon;
              return (
                <Button 
                  key={idx} 
                  // @ts-ignore
                  variant={btn.variant} 
                  className={btn.className} 
                  icon={IconComponent ? <IconComponent size={12} /> : undefined}
                >
                  {btn.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Estados Especiales (Disabled) */}
        <div className="space-y-3 pt-4 border-t border-slate-900">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono block">
            Estados de Carga y Deshabilitado (Disabled)
          </span>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary" disabled>Guardando...</Button>
            <Button variant="secondary" disabled>No disponible</Button>
          </div>
        </div>

      </div>
    </div>
  );
}