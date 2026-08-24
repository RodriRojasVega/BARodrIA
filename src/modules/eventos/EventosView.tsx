// src/modules/eventos/EventosView.tsx
import { useState } from 'react';
import { useEventos } from './hooks/useEventos';
import { EventosList } from './components/EventosList';
import { EventoDetail } from './components/EventoDetail';
import { EventoForm } from './components/EventoForm';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
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

  const handleEditarEvento = (id: number) => {
    setEventoSeleccionadoId(id);
    setSubVista('formulario');
  };

  // 👈 Función para el botón volver explícito desde el Detail
  const handleVolverAlListado = () => {
    setEventoSeleccionadoId(null);
    setSubVista('listado');
    recargarEventos();
  };

  // 👈 NUEVO: Función inteligente para cuando el formulario Guarda
  const handleGuardadoFormulario = (nuevoId?: number) => {
    if (nuevoId) {
      setEventoSeleccionadoId(nuevoId); // Guarda el ID del evento editado o recién creado
      setSubVista('detalle'); // Te redirige al Detail en lugar del listado
    } else {
      setSubVista('listado');
    }
    recargarEventos();
  };

  // 👈 NUEVO: Función inteligente para cuando el formulario Cancela
  const handleCancelarFormulario = () => {
    if (eventoSeleccionadoId) {
      setSubVista('detalle'); // Si estabas editando, vuelve al detail
    } else {
      setSubVista('listado'); // Si estabas creando uno nuevo, vuelve al listado
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden font-sans">
      <div className={cn(
        "flex-1 overflow-hidden flex flex-col min-h-0",
        subVista === 'listado' ? "p-4 md:p-6" : "px-4 md:px-6 pb-4 md:pb-6"
      )}>
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
          if (!eventoObj) return <div className="p-8 text-muted">Error: Evento no encontrado.</div>;
          
          return (
            <EventoDetail 
              evento={eventoObj} 
              onVolver={handleVolverAlListado} 
              onEditar={handleEditarEvento} 
            />
          );
        })()}

        {subVista === 'formulario' && (
          <EventoForm 
            eventoId={eventoSeleccionadoId} 
            onGuardado={handleGuardadoFormulario} // 👈 Conectado a la nueva función
            onCancelar={handleCancelarFormulario} // 👈 Conectado a la nueva función
          />
        )}
      </div>
    </div>
  );
}
export default EventosView;