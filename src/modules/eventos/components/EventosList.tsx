// src/modules/eventos/components/EventosList.tsx
import { useState } from 'react';
import { Calendar, type CalendarEvent } from '@/components/ui/Calendar';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { DataCard } from '@/components/ui/DataCard';
import { IconText } from '@/components/ui/IconText';
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

  // Búsqueda segura sobre el nombre y el nombre del catálogo relacional
  const eventosFiltrados = eventos.filter(ev => {
    const nombreMatch = ev.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const tipoMatch = ev.tipo_evento_info?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ?? false;
    return nombreMatch || tipoMatch;
  });

  const calendarEvents: CalendarEvent[] = eventosFiltrados.map(ev => ({
    id: ev.id,
    title: `${ev.nombre} (${ev.total_pax} PAX)`,
    date: ev.fecha_evento,
    status: (ev.estado_info?.slug ?? 'cotizacion') as CalendarEvent['status']
  }));

  const renderBadgeEstado = (slug: string, nombre: string) => {
    switch (slug) {
      case 'confirmado': return <Badge variant="success">{nombre}</Badge>;
      case 'en_produccion': return <Badge variant="warning">{nombre}</Badge>;
      case 'ejecutado': return <Badge variant="info">{nombre}</Badge>;
      case 'cancelado': return <Badge variant="danger">{nombre}</Badge>;
      default: return <Badge variant="default">{nombre}</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-5 animate-fade-in">
      
      {/* 1. HEADER DEL MÓDULO */}
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
              title="Nuevo Evento"
            />
          }
        />
      </div>

      {/* 2. TOOLBAR FLOTANTE */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="w-full sm:w-80">
          <Input 
            icon={<Search size={14} />}
            placeholder="Buscar evento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <ViewToggle 
            activeId={vistaActual}
            onChange={(id) => setVistaActual(id as VistaTipo)}
            options={[
              { id: 'calendario', label: 'Calendario', icon: <CalendarDays size={14} /> },
              { id: 'tarjetas', label: 'Grilla', icon: <LayoutGrid size={14} /> },
              { id: 'tabla', label: 'Tabla', icon: <TableIcon size={14} /> },
            ]}
          />

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" icon={<ChevronLeft size={16} />} onClick={prevMonth} />
            <Button variant="ghost" size="sm" icon={<ChevronRight size={16} />} onClick={nextMonth} />
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
          <EmptyState 
            icon={<CalendarDays size={48} />}
            title="No se encontraron eventos registrados"
            description="Modifica tu búsqueda o crea un nuevo evento corporativo."
          />
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
                {eventosFiltrados.map((ev) => {
                  const estadoSlug = ev.estado_info?.slug ?? 'cotizacion';
                  const estadoNombre = ev.estado_info?.nombre ?? 'Cotización';
                  const tipoNombre = ev.tipo_evento_info?.nombre ?? 'Corporativo';

                  return (
                    <DataCard 
                      key={ev.id}
                      title={ev.nombre}
                      badge={renderBadgeEstado(estadoSlug, estadoNombre)}
                      onClick={() => onSelectEvent(ev.id)}
                    >
                      <span className="text-[10px] sm:text-xs font-mono text-primary font-bold uppercase tracking-wider block mb-1">
                        {tipoNombre}
                      </span>
                      {ev.mandante && (
                        <p className="text-xs text-muted">
                          Mandante: <strong className="text-foreground">{ev.mandante.nombre}</strong>
                        </p>
                      )}
                      
                      <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between">
                        <IconText 
                          icon={<CalendarDays size={13} />} 
                          text={ev.fecha_evento} 
                          textClassName="font-mono text-muted" 
                        />
                        <IconText 
                          icon={<Users size={13} className="text-primary" />} 
                          text={`${ev.total_pax} PAX`} 
                          textClassName="font-mono font-bold text-foreground" 
                        />
                      </div>
                    </DataCard>
                  );
                })}
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
                      {eventosFiltrados.map((ev) => {
                        const estadoSlug = ev.estado_info?.slug ?? 'cotizacion';
                        const estadoNombre = ev.estado_info?.nombre ?? 'Cotización';
                        const tipoNombre = ev.tipo_evento_info?.nombre ?? 'N/D';

                        return (
                          <TableRow key={ev.id} isClickable onClick={() => onSelectEvent(ev.id)}>
                            <TableCell className="font-semibold text-foreground">{ev.nombre}</TableCell>
                            <TableCell className="font-mono text-xs text-muted uppercase">{tipoNombre}</TableCell>
                            <TableCell className="text-foreground">{ev.mandante?.nombre || 'Directo'}</TableCell>
                            <TableCell className="font-mono text-xs text-muted">{ev.fecha_evento}</TableCell>
                            <TableCell align="center"><span className="font-mono font-bold text-primary">{ev.total_pax} PAX</span></TableCell>
                            <TableCell align="center">{renderBadgeEstado(estadoSlug, estadoNombre)}</TableCell>
                          </TableRow>
                        );
                      })}
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