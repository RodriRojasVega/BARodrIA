// src/modules/eventos/components/EventoCronogramaTab.tsx
import { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { VerticalTimeline, type VerticalTimelineItem } from '@/components/ui/VerticalTimeline';
import { IconText } from '@/components/ui/IconText';
import { Store, MapPin, Clock, Link2 } from 'lucide-react';
import { useCronogramaDetalle } from '../hooks/useCronogramaDetalle';
import { usePuntosServicio } from '../hooks/usePuntosServicio';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EventoCronogramaTabProps {
  eventoId: number;
}

interface EventoEtapaRelacion {
  salon_id: number;
  salones_espacios?: { nombre: string };
}

export function EventoCronogramaTab({ eventoId }: EventoCronogramaTabProps) {
  const [faseActiva, setFaseActiva] = useState<number | null>(null);

  const { actividades, etapas, cargando: cargandoCronograma } = useCronogramaDetalle(eventoId);
  const { puntos, cargando: cargandoPuntos } = usePuntosServicio(eventoId);

  const renderBadgeModalidad = (modalidad: string | null) => {
    switch (modalidad) {
      case 'barra_libre': return <Badge variant="info">Barra Libre</Badge>;
      case 'paquete_fijo': return <Badge variant="success">Paquete Fijo</Badge>;
      case 'tickets': return <Badge variant="warning">Tickets</Badge>;
      default: return <Badge variant="default">Estándar</Badge>;
    }
  };

  const getPuntosPorEtapa = (etapaId: number) => {
    return puntos.filter(p => p.etapa_id === etapaId);
  };

  const timelineItems: VerticalTimelineItem[] = actividades.map(a => {
    const etapaVinculada = etapas.find(e => e.id === a.etapa_id);
    return {
      id: a.id,
      orden: a.orden,
      nombre: a.nombre,
      hora_inicio: a.hora_inicio?.slice(0, 5) || '',
      hora_fin: a.hora_fin?.slice(0, 5) || '',
      es_hito: a.es_hito === true ? true : undefined,
      faseOrden: etapaVinculada ? etapaVinculada.orden : undefined
    };
  });

  const cargando = cargandoCronograma || cargandoPuntos;

  if (cargando) {
    return (
      <div className="w-full py-12 text-center text-muted font-mono text-sm animate-pulse">
        Cargando cronograma...
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in pb-8 pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <section className="lg:col-span-4 lg:sticky lg:top-4">
          {actividades.length === 0 ? (
            <div className="text-xs text-muted italic p-4 text-center border border-border/50 rounded-xl">
              Sin actividades registradas.
            </div>
          ) : (
            <VerticalTimeline 
              items={timelineItems} 
              activeItem={faseActiva}
              onSelectItem={(orden) => setFaseActiva(orden === faseActiva ? null : orden)}
            />
          )}
        </section>

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
                {etapas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" className="py-8 text-muted italic text-sm">
                      No hay etapas configuradas para este evento.
                    </TableCell>
                  </TableRow>
                ) : (
                  etapas.map((etapa) => {
                    const puntosActivos = getPuntosPorEtapa(etapa.id);
                    const isActive = faseActiva === etapa.orden;
                    const linkedAct = actividades.find(a => a.etapa_id === etapa.id);
                    
                    return (
                      <TableRow 
                        key={etapa.id} 
                        onClick={() => setFaseActiva(etapa.orden === faseActiva ? null : etapa.orden)}
                        className={cn(
                          "cursor-pointer transition-all duration-300 relative",
                          isActive ? "bg-primary/5" : "border-border/40 hover:bg-surface-muted/30"
                        )}
                      >
                        <TableCell className="relative">
                          {isActive && (
                            <div className="absolute inset-y-0 left-0 w-[3px] bg-primary rounded-r-md shadow-sm shadow-primary/50" />
                          )}
                          <div className="flex flex-col min-w-[140px] pl-2">
                            <span className={cn("font-semibold text-sm transition-colors", isActive ? "text-primary" : "text-foreground")}>
                              {etapa.nombre}
                            </span>
                            <IconText 
                              icon={<Clock size={12} className={isActive ? "text-primary" : "text-primary/70"} />}
                              text={`${etapa.hora_inicio?.slice(0, 5) || '--:--'} - ${etapa.hora_fin?.slice(0, 5) || '--:--'} hrs`}
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
                            {etapa.evento_etapa_salones && (etapa.evento_etapa_salones as EventoEtapaRelacion[]).length > 0 ? (
                              (etapa.evento_etapa_salones as EventoEtapaRelacion[]).map((rel) => (
                                <div key={rel.salon_id} className={cn(
                                  "flex items-center gap-1.5 px-2 py-1 rounded-md border w-fit transition-colors",
                                  isActive ? "bg-primary/10 border-primary/30" : "bg-surface-muted/50 border-border/50"
                                )}>
                                  <MapPin size={13} className={isActive ? "text-primary" : "text-primary/70"} />
                                  <span className="font-medium text-foreground text-xs">{rel.salones_espacios?.nombre || 'Salón'}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-muted italic">Sin salón asignado</span>
                            )}
                            
                            {puntosActivos.length > 0 && (
                              <div className={cn("flex flex-col gap-1 pl-2 border-l-2 transition-colors", isActive ? "border-primary/50" : "border-primary/20")}>
                                {puntosActivos.map(punto => (
                                  <div key={punto.id} className="flex items-center justify-between gap-2 text-[11px]">
                                    <div className="flex items-center gap-1 text-muted">
                                      <Store size={11} className="shrink-0" />
                                      <span className={cn("font-medium", isActive && "text-foreground")}>{punto.nombre}</span>
                                    </div>
                                    <span className={cn("font-mono text-muted border px-1 py-0.5 rounded", isActive ? "border-primary/30" : "border-border/40")}>
                                      {punto.pax_asignado || 0} PAX {/* 👈 Bug corregido: pax_asignado */}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell align="center">
                          <div className="flex flex-col items-center gap-2 min-w-[90px]">
                            {renderBadgeModalidad(etapa.modalidad_calculo)}
                            {linkedAct && (
                              <div className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20" title="Actividad Asociada">
                                <Link2 size={10} className="shrink-0" />
                                <span className="font-medium truncate max-w-[90px]">{linkedAct.nombre}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell align="center">
                          <span className={cn("font-mono font-bold text-sm min-w-[50px] inline-block transition-colors", isActive ? "text-primary" : "text-primary/80")}>
                            {etapa.pax_etapa?.toLocaleString() || 0}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </section>

      </div>
    </div>
  );
}