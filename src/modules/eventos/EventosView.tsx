// src/modules/eventos/EventosView.tsx
import { useState } from 'react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Button } from '@/components/ui/Button';
import { CalendarRange, ArrowLeft } from 'lucide-react';
import { useEventos } from './hooks/useEventos';
import { EventosList } from './components/EventosList';
import { EventoDetail } from './components/EventoDetail';
import { EventoForm } from './components/EventoForm';

type SubVista = 'listado' | 'detalle' | 'formulario';

export function EventosView() {
  const { eventos, cargando, recargarEventos } = useEventos();
  const [subVista, setSubVista] = useState<SubVista>('listado');
  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState<number | null>(null);

  const handleSelectEvent = (id: number) => {
    setEventoSeleccionadoId(id);
    setSubVista('detalle');
  };

  const handleNuevoEvento = () => {
    setEventoSeleccionadoId(null);
    setSubVista('formulario');
  };

  const handleVolver = () => {
    setEventoSeleccionadoId(null);
    setSubVista('listado');
    recargarEventos();
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 p-4 md:p-8 overflow-hidden font-sans">
      {/* Cabecera del Módulo */}
      <div className="shrink-0 mb-6">
        {subVista !== 'listado' ? (
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" icon={<ArrowLeft size={16} />} onClick={handleVolver}>
              Volver al Listado
            </Button>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              {subVista === 'detalle' ? 'Centro de Mando de Evento' : 'Configuración Comercial'}
            </span>
          </div>
        ) : (
          <ModuleHeader 
            icon={<CalendarRange size={24} className="text-emerald-400" />}
            title="Logística y Gestión de Eventos"
            subtitle="Orquestación corporativa B2B, forecast de consumo masivo y control de activos operativos."
          />
        )}
      </div>

      {/* Contenido Dinámico de Vistas */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {subVista === 'listado' && (
          <EventosList 
            eventos={eventos}
            cargando={cargando}
            onSelectEvent={handleSelectEvent}
            onNuevoEvento={handleNuevoEvento}
          />
        )}

        {subVista === 'detalle' && eventoSeleccionadoId !== null && (() => {
          const eventoObj = eventos.find(e => e.id === eventoSeleccionadoId);
          if (!eventoObj) return <div className="text-slate-400 p-8">Evento no encontrado.</div>;
          return <EventoDetail evento={eventoObj} onVolver={handleVolver} />;
        })()}

        {subVista === 'formulario' && (
                <EventoForm 
                    onGuardado={handleVolver} 
                    onCancelar={handleVolver} 
                />
                )}
      </div>
    </div>
  );
}

export default EventosView;