// src/modules/eventos/components/EventoCronogramaTab.tsx
import { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { VerticalTimeline, type VerticalTimelineItem } from '@/components/ui/VerticalTimeline';
import { IconText } from '@/components/ui/IconText';
import { Store, MapPin, Clock } from 'lucide-react';
import { mockCronogramaEtapas } from '../data/eventoMock';
import { usePuntosServicio } from '../hooks/usePuntosServicio';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EventoCronogramaTabProps {
  eventoId: number;
}

export function EventoCronogramaTab({ eventoId }: EventoCronogramaTabProps) {
  const [faseActiva, setFaseActiva] = useState<number | null>(null);

  const [actividadesGenerales] = useState<VerticalTimelineItem[]>([
    { id: 1, orden: 1, nombre: 'Apertura de Puertas y Llegada de Invitados', hora_inicio: '18:30', hora_fin: '19:00', es_hito: true },
    { id: 2, orden: 2, nombre: 'Inicio de Cóctel de Bienvenida', hora_inicio: '19:00', hora_fin: '20:30', es_hito: false },
    { id: 3, orden: 3, nombre: 'Ceremonia de Premiación', hora_inicio: '20:30', hora_fin: '21:30', es_hito: true },
    { id: 4, orden: 4, nombre: 'Apertura de Barra Principal y Fiesta', hora_inicio: '21:30', hora_fin: '02:00', es_hito: false },
  ]);

  const [etapas] = useState(mockCronogramaEtapas);
  const { puntos, cargando } = usePuntosServicio(eventoId);

  const renderBadgeModalidad = (modalidad: string | null) => {
    switch (modalidad) {
      case 'barra_libre': return <Badge variant="info">Barra Libre</Badge>;
      case 'paquete_fijo': return <Badge variant="success">Paquete Fijo</Badge>;
      case 'tickets': return <Badge variant="warning">Tickets</Badge>;
      default: return <Badge variant="default">Estándar</Badge>;
    }
  };

  const getPuntosPorEtapa = (etapaId: number) => {
    return puntos.filter(p => p.evento_etapa_salon_id === etapaId || (etapaId === 1 && p.evento_etapa_salon_id === 2));
  };

  return (
    <div className="w-full animate-fade-in pb-8 pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* TIMELINE */}
        <section className="lg:col-span-4 lg:sticky lg:top-4">
          <VerticalTimeline 
            items={actividadesGenerales} 
            activeItem={faseActiva}
            onSelectItem={(orden) => setFaseActiva(orden === faseActiva ? null : orden)}
          />
        </section>

        {/* TABLA FLOTANTE */}
        <section className="lg:col-span-8">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <Table className="border-none bg-transparent shadow-none">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Etapa / Horario</TableHeaderCell>
                  <TableHeaderCell>Despliegue Físico</TableHeaderCell>
                  <TableHeaderCell align="center">Modalidad</TableHeaderCell>
                  <TableHeaderCell align="center">PAX</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {etapas.map((etapa) => {
                  const puntosActivos = getPuntosPorEtapa(etapa.id);
                  const isActive = faseActiva === etapa.orden;
                  
                  return (
                    <TableRow 
                      key={etapa.id} 
                      onClick={() => setFaseActiva(etapa.orden === faseActiva ? null : etapa.orden)}
                      className={cn(
                        "cursor-pointer transition-all duration-300 relative",
                        // Resaltado de fondo limpio con tokens semánticos
                        isActive ? "bg-primary/5" : "border-border/40 hover:bg-surface-muted/30"
                      )}
                    >
                      <TableCell className="relative">
                        {/* FIX DE SELECCIÓN: Div absoluto en la primera celda en lugar de borde en el tr */}
                        {isActive && (
                          <div className="absolute inset-y-0 left-0 w-[3px] bg-primary rounded-r-md shadow-sm shadow-primary/50"></div>
                        )}
                        <div className="flex flex-col min-w-[140px] pl-2">
                          <span className={cn("font-semibold text-sm transition-colors", isActive ? "text-primary" : "text-foreground")}>
                            {etapa.nombre}
                          </span>
                          <IconText 
                            icon={<Clock size={12} className={isActive ? "text-primary" : "text-primary/70"} />}
                            text={`${etapa.hora_inicio?.slice(0, 5)} - ${etapa.hora_fin?.slice(0, 5)} hrs`}
                            textClassName={cn("font-mono text-xs", isActive ? "text-primary/80" : "text-muted")}
                            className="mt-1"
                          />
                          <span className={cn(
                            "text-[10px] font-mono font-bold uppercase tracking-wider mt-1",
                            isActive ? "text-primary" : "text-muted"
                          )}>
                            Fase {etapa.orden}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <div className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-md border w-fit transition-colors",
                            isActive ? "bg-primary/10 border-primary/30" : "bg-surface-muted/50 border-border/50"
                          )}>
                            <MapPin size={13} className={isActive ? "text-primary" : "text-primary/70"} />
                            <span className="font-medium text-foreground text-xs">Salón Principal A</span>
                          </div>
                          
                          {cargando ? (
                            <span className="text-xs text-muted animate-pulse pl-1">Cargando puntos...</span>
                          ) : puntosActivos.length > 0 ? (
                            <div className={cn("flex flex-col gap-1 pl-2 border-l-2 transition-colors", isActive ? "border-primary/50" : "border-primary/20")}>
                              {puntosActivos.map(punto => (
                                <div key={punto.id} className="flex items-center justify-between gap-2 text-[11px]">
                                  <div className="flex items-center gap-1 text-muted">
                                    <Store size={11} className="shrink-0" />
                                    <span className={cn("font-medium", isActive && "text-foreground")}>{punto.nombre}</span>
                                  </div>
                                  <span className={cn("font-mono text-muted border px-1 py-0.5 rounded", isActive ? "border-primary/30" : "border-border/40")}>
                                    {punto.pax_estimado_asignado} PAX
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted italic pl-1">Sin asignar</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell align="center">
                        <div className="min-w-[80px]">
                          {renderBadgeModalidad(etapa.modalidad_calculo)}
                        </div>
                      </TableCell>
                      
                      <TableCell align="center">
                        <span className={cn("font-mono font-bold text-sm min-w-[50px] inline-block transition-colors", isActive ? "text-primary" : "text-primary/80")}>
                          {etapa.pax_etapa?.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>

      </div>
    </div>
  );
}