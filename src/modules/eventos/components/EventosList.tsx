// src/modules/eventos/components/EventosList.tsx
import { useState } from 'react';
import { Calendar, type CalendarEvent } from '@/components/ui/Calendar';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { CalendarDays, LayoutGrid, Table as TableIcon, Plus, Search, MapPin, Users } from 'lucide-react';
import type { EventoConRelaciones } from '../hooks/useEventos';

interface EventosListProps {
  eventos: EventoConRelaciones[];
  cargando: boolean;
  onSelectEvent: (id: number) => void;
  onNuevoEvento: () => void;
}

type VistaTipo = 'calendario' | 'tarjetas' | 'tabla';

export function EventosList({ eventos, cargando, onSelectEvent, onNuevoEvento }: EventosListProps) {
  const [vistaActual, setVistaActual] = useState<VistaTipo>('calendario');
  const [busqueda, setBusqueda] = useState('');

  // Filtrado básico por nombre o tipo de evento
  const eventosFiltrados = eventos.filter(ev => 
    ev.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (ev.tipo_evento && ev.tipo_evento.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Mapeo para el componente <Calendar />
  const calendarEvents: CalendarEvent[] = eventosFiltrados.map(ev => ({
    id: ev.id,
    title: `${ev.nombre} (${ev.total_pax} PAX)`,
    date: ev.fecha_evento,
    status: ev.estado as CalendarEvent['status']
  }));

  const renderBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'confirmado': return <Badge variant="success">Confirmado</Badge>;
      case 'en_produccion': return <Badge variant="warning">En Producción</Badge>;
      case 'ejecutado': return <Badge variant="info">Ejecutado</Badge>;
      case 'cancelado': return <Badge variant="danger">Cancelado</Badge>;
      default: return <Badge variant="default">Cotización</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in">
      {/* Barra de Controles Superior */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 shrink-0">
        <div className="w-full sm:w-80">
          <Input 
            icon={<Search size={14} />}
            placeholder="Buscar evento o tipología..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <ViewToggle 
            activeId={vistaActual}
            onChange={(id) => setVistaActual(id as VistaTipo)}
            options={[
              { id: 'calendario', label: 'Calendario', icon: <CalendarDays size={14} /> },
              { id: 'tarjetas', label: 'Grilla', icon: <LayoutGrid size={14} /> },
              { id: 'tabla', label: 'Tabla', icon: <TableIcon size={14} /> },
            ]}
          />

          <Button variant="primary" icon={<Plus size={16} />} onClick={onNuevoEvento}>
            Nuevo Evento
          </Button>
        </div>
      </div>

      {/* Contenido Dinámico según la Vista Activa */}
      <div className="flex-1 min-h-[500px] flex flex-col">
        {cargando ? (
          <div className="flex-1 flex items-center justify-center text-emerald-400 font-mono animate-pulse">
            Sincronizando agenda logística de eventos...
          </div>
        ) : eventosFiltrados.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-2xl">
            <CalendarDays size={48} className="text-slate-600 mb-3" />
            <p className="text-slate-300 font-bold text-sm">No se encontraron eventos registrados</p>
            <p className="text-slate-500 text-xs mt-1">Modifica tu búsqueda o crea un nuevo evento corporativo.</p>
          </div>
        ) : (
          <>
            {/* VISTA 1: CALENDARIO */}
            {vistaActual === 'calendario' && (
              <div className="flex-1 h-[650px]">
                <Calendar 
                  events={calendarEvents} 
                  onSelectEvent={(id) => onSelectEvent(Number(id))} 
                />
              </div>
            )}

            {/* VISTA 2: TARJETAS (GRILLA) */}
            {vistaActual === 'tarjetas' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-1">
                {eventosFiltrados.map((ev) => (
                  <div 
                    key={ev.id}
                    onClick={() => onSelectEvent(ev.id)}
                    className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                          {ev.tipo_evento || 'Corporativo'}
                        </span>
                        {renderBadgeEstado(ev.estado)}
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {ev.nombre}
                      </h3>
                      {ev.mandante && (
                        <p className="text-xs text-slate-400 mt-1">
                          Mandante: <strong className="text-slate-200">{ev.mandante.nombre}</strong>
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-slate-500" />
                        <span>{ev.fecha_evento}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                        <Users size={13} className="text-emerald-500" />
                        <span>{ev.total_pax} PAX</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VISTA 3: TABLA */}
            {vistaActual === 'tabla' && (
              <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden flex flex-col flex-1 shadow-xl">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Nombre del Evento</TableHeaderCell>
                        <TableHeaderCell>Tipología</TableHeaderCell>
                        <TableHeaderCell>Mandante</TableHeaderCell>
                        <TableHeaderCell>Fecha</TableHeaderCell>
                        <TableHeaderCell align="center">Volumen PAX</TableHeaderCell>
                        <TableHeaderCell align="center">Estado</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eventosFiltrados.map((ev) => (
                        <TableRow 
                          key={ev.id} 
                          isClickable 
                          onClick={() => onSelectEvent(ev.id)}
                        >
                          <TableCell className="font-semibold text-white">{ev.nombre}</TableCell>
                          <TableCell className="font-mono text-xs text-slate-400 uppercase">{ev.tipo_evento || 'N/D'}</TableCell>
                          <TableCell className="text-slate-300">{ev.mandante?.nombre || 'Directo'}</TableCell>
                          <TableCell className="font-mono text-xs text-slate-300">{ev.fecha_evento}</TableCell>
                          <TableCell align="center">
                            <span className="font-mono font-bold text-emerald-400">{ev.total_pax} PAX</span>
                          </TableCell>
                          <TableCell align="center">{renderBadgeEstado(ev.estado)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}