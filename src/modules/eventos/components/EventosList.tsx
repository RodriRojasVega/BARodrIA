// src/modules/eventos/components/EventosList.tsx
import { useState } from 'react';
import { Calendar, type CalendarEvent } from '@/components/ui/Calendar';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { CalendarDays, LayoutGrid, Table as TableIcon, Plus, Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
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
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const nombreMes = monthNames[month];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const eventosFiltrados = eventos.filter(ev => 
    ev.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (ev.tipo_evento && ev.tipo_evento.toLowerCase().includes(busqueda.toLowerCase()))
  );

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
    <div className="flex flex-col h-full space-y-5 animate-fade-in">
      
      {/* 1. HEADER DEL MÓDULO (Utilizando strict UI Kit API) */}
      <div className="shrink-0">
        <ModuleHeader 
          icon={<CalendarDays size={20} className="text-primary" />}
          title={`Eventos ${nombreMes} ${year}`}
          primaryAction={
            <Button 
              variant="primary" 
              size="sm" 
              icon={<Plus size={16} />} 
              onClick={onNuevoEvento}
            >
              Nuevo Evento
            </Button>
          }
        />
      </div>

      {/* 2. TOOLBAR FLOTANTE (Sin línea divisoria ni bordes) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        
        {/* Buscador nativo del UI Kit */}
        <div className="w-full sm:w-80">
          <Input 
            icon={<Search size={14} />}
            placeholder="Buscar evento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* Toggle primero */}
          <ViewToggle 
            activeId={vistaActual}
            onChange={(id) => setVistaActual(id as VistaTipo)}
            options={[
              { id: 'calendario', label: 'Calendario', icon: <CalendarDays size={14} /> },
              { id: 'tarjetas', label: 'Grilla', icon: <LayoutGrid size={14} /> },
              { id: 'tabla', label: 'Tabla', icon: <TableIcon size={14} /> },
            ]}
          />

          {/* Paginador a la derecha, usando el Button transparente del UI Kit */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              icon={<ChevronLeft size={16} />} 
              onClick={prevMonth} 
            />
            <Button 
              variant="ghost" 
              size="sm" 
              icon={<ChevronRight size={16} />} 
              onClick={nextMonth} 
            />
          </div>

        </div>
      </div>

      {/* 3. CONTENIDO PRINCIPAL */}
      <div className="flex-1 min-h-[500px] flex flex-col">
        {cargando ? (
          <div className="flex-1 flex items-center justify-center text-primary font-mono animate-pulse">
            Sincronizando agenda logística de eventos...
          </div>
        ) : eventosFiltrados.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl">
            <CalendarDays size={48} className="text-muted mb-3 opacity-50" />
            <p className="text-foreground font-bold text-sm">No se encontraron eventos registrados</p>
            <p className="text-muted text-xs mt-1">Modifica tu búsqueda o crea un nuevo evento corporativo.</p>
          </div>
        ) : (
          <>
            {/* VISTA 1: CALENDARIO */}
            {vistaActual === 'calendario' && (
              <div className="flex-1">
                <Calendar events={calendarEvents} year={year} month={month} onSelectEvent={(id) => onSelectEvent(Number(id))} />
              </div>
            )}
            
            {/* VISTA 2: TARJETAS (GRILLA) */}
            {vistaActual === 'tarjetas' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-1 pb-4">
                {eventosFiltrados.map((ev) => (
                  <div key={ev.id} onClick={() => onSelectEvent(ev.id)} className="bg-surface border border-border rounded-2xl p-5 hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="text-xs font-mono text-primary font-bold uppercase tracking-wider">{ev.tipo_evento || 'Corporativo'}</span>
                        {renderBadgeEstado(ev.estado)}
                      </div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{ev.nombre}</h3>
                      {ev.mandante && <p className="text-xs text-muted mt-1">Mandante: <strong className="text-foreground">{ev.mandante.nombre}</strong></p>}
                    </div>
                    <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-mono text-muted">
                      <div className="flex items-center gap-1.5"><CalendarDays size={13} /><span>{ev.fecha_evento}</span></div>
                      <div className="flex items-center gap-1.5 text-foreground font-bold"><Users size={13} className="text-primary" /><span>{ev.total_pax} PAX</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VISTA 3: TABLA */}
            {vistaActual === 'tabla' && (
              <div className="flex flex-col flex-1 overflow-hidden">
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
                        <TableRow key={ev.id} isClickable onClick={() => onSelectEvent(ev.id)}>
                          <TableCell className="font-semibold text-foreground">{ev.nombre}</TableCell>
                          <TableCell className="font-mono text-xs text-muted uppercase">{ev.tipo_evento || 'N/D'}</TableCell>
                          <TableCell className="text-foreground">{ev.mandante?.nombre || 'Directo'}</TableCell>
                          <TableCell className="font-mono text-xs text-muted">{ev.fecha_evento}</TableCell>
                          <TableCell align="center"><span className="font-mono font-bold text-primary">{ev.total_pax} PAX</span></TableCell>
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