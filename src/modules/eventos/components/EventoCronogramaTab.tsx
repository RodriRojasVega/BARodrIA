// src/modules/eventos/components/EventoCronogramaTab.tsx
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { Store, MapPin } from 'lucide-react';
import { mockCronogramaEtapas } from '../data/eventoMock';
import { usePuntosServicio } from '../hooks/usePuntosServicio';

interface EventoCronogramaTabProps {
  eventoId: number;
}

export function EventoCronogramaTab({ eventoId }: EventoCronogramaTabProps) {
  const [etapas] = useState(mockCronogramaEtapas);
  
  // Consumimos nuestro hook inteligente
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
    <div className="w-full animate-fade-in">
      {/* Contenedor sin bordes, ocupando todo el ancho disponible */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Orden</TableHeaderCell>
              <TableHeaderCell>Nombre de la Etapa / Horario</TableHeaderCell>
              <TableHeaderCell>Despliegue Operativo (Barras y Puntos)</TableHeaderCell>
              <TableHeaderCell align="center">Modalidad</TableHeaderCell>
              <TableHeaderCell align="center">PAX Etapa</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {etapas.map((etapa) => {
              const puntosActivos = getPuntosPorEtapa(etapa.id);
              
              return (
                <TableRow key={etapa.id}>
                  <TableCell className="font-mono text-muted">{etapa.orden}</TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{etapa.nombre}</span>
                      <span className="font-mono text-xs text-muted mt-0.5">
                        {etapa.hora_inicio?.slice(0, 5)} - {etapa.hora_fin?.slice(0, 5)} hrs
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {cargando ? (
                      <span className="text-xs text-muted animate-pulse">Cargando puntos...</span>
                    ) : puntosActivos.length > 0 ? (
                      <div className="flex flex-col gap-1.5 py-1">
                        {puntosActivos.map(punto => (
                          <div 
                            key={punto.id} 
                            className="flex items-center justify-between gap-2 text-xs bg-surface-muted px-2.5 py-1.5 rounded-md"
                          >
                            <div className="flex items-center gap-1.5">
                              <Store size={13} className="text-primary shrink-0" />
                              <span className="font-medium text-foreground">{punto.nombre}</span>
                            </div>
                            {/* PAX hardcodeado desde el mock, sin calcular */}
                            <span className="text-[10px] bg-background px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                              {punto.pax_estimado_asignado} PAX
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                        <MapPin size={12} /> Sin asignar
                      </span>
                    )}
                  </TableCell>

                  <TableCell align="center">{renderBadgeModalidad(etapa.modalidad_calculo)}</TableCell>
                  <TableCell align="center" className="font-mono font-bold text-primary">
                    {/* PAX hardcodeado desde el mock, sin calcular */}
                    {etapa.pax_etapa?.toLocaleString()} PAX
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}