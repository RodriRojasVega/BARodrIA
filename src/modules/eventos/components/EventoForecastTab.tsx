// src/modules/eventos/components/EventoForecastTab.tsx
import { useState } from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { BlockHeader } from '@/components/ui/BlockHeader';
import { SelectableCard } from '@/components/ui/SelectableCard';
import { ToggleButton } from '@/components/ui/ToggleButton';
import { CategoryFilter, type CategoryOption } from '@/components/ui/CategoryFilter';
import { Martini, Package, Scale } from 'lucide-react';

interface EventoForecastTabProps {
  eventoId: number;
  totalPax?: number;
}

interface OfertaItem {
  id: number;
  tipo: 'coctel' | 'concepto';
  categoria: string;
  nombre: string;
  consumoUnitario: number;
  peso: number;
  unidadBase: string;
}

interface PuntoServicioForecast {
  id: number;
  nombre: string;
  paxAsignado: number;
  oferta: OfertaItem[];
}

interface EtapaForecast {
  id: number;
  nombre: string;
  fase: string;
  horario: string;
  paxEtapa: number;
  reglaConsumo: number;
  puntos: PuntoServicioForecast[];
}

export function EventoForecastTab({ eventoId }: EventoForecastTabProps) {
  const [selecciones, setSelecciones] = useState<Record<number, 'todos' | number[]>>({});
  const [modoConsolidadoGlobal, setModoConsolidadoGlobal] = useState<boolean>(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | number>('todos');

  const categoriasFiltroOptions: CategoryOption[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'coctel', label: 'Cócteles' },
    { id: 'mocktail', label: 'Mocktails' },
    { id: 'bebida', label: 'Bebidas' },
    { id: 'jugo', label: 'Jugos' },
    { id: 'agua', label: 'Aguas' },
  ];

  const etapasForecast: EtapaForecast[] = [
    {
      id: 1,
      nombre: 'Recepción & Cóctel',
      fase: 'Etapa 1',
      horario: '19:00 - 21:00 hrs',
      paxEtapa: 600,
      reglaConsumo: 1.15,
      puntos: [
        {
          id: 101,
          nombre: 'Barra Terraza Exterior',
          paxAsignado: 450,
          oferta: [
            { id: 1, tipo: 'coctel', categoria: 'coctel', nombre: 'Pisco Sour Catedral', consumoUnitario: 1.5, peso: 1.2, unidadBase: 'unit' },
            { id: 2, tipo: 'concepto', categoria: 'bebida', nombre: 'Bebida de Fantasía Cola', consumoUnitario: 250, peso: 0.8, unidadBase: 'ml' },
          ]
        },
        {
          id: 102,
          nombre: 'Estación de Bienvenida VIP',
          paxAsignado: 150,
          oferta: [
            { id: 4, tipo: 'concepto', categoria: 'agua', nombre: 'Espumante Brut', consumoUnitario: 200, peso: 1.5, unidadBase: 'ml' },
            { id: 2, tipo: 'concepto', categoria: 'bebida', nombre: 'Bebida de Fantasía Cola', consumoUnitario: 250, peso: 0.3, unidadBase: 'ml' },
          ]
        }
      ]
    }
  ];

  const toggleSeleccion = (etapaId: number, puntoId: number | 'todos') => {
    setSelecciones(prev => {
      const seleccionActual = prev[etapaId] || 'todos';
      if (puntoId === 'todos') return { ...prev, [etapaId]: 'todos' };
      if (seleccionActual === 'todos') return { ...prev, [etapaId]: [puntoId] };

      const nuevaSeleccion = seleccionActual.includes(puntoId)
        ? seleccionActual.filter(id => id !== puntoId)
        : [...seleccionActual, puntoId];

      return {
        ...prev,
        [etapaId]: nuevaSeleccion.length === 0 ? 'todos' : nuevaSeleccion
      };
    });
  };

  const obtenerConsolidado = (etapa: EtapaForecast | 'global') => {
    const consolidado = new Map<number, OfertaItem & { volumenTotal: number }>();

    if (etapa === 'global') {
      etapasForecast.forEach(e => {
        e.puntos.forEach(punto => {
          punto.oferta.forEach(item => {
             const volumenCalculado = punto.paxAsignado * item.consumoUnitario * item.peso * e.reglaConsumo;
             if (consolidado.has(item.id)) {
               consolidado.get(item.id)!.volumenTotal += volumenCalculado;
             } else {
               consolidado.set(item.id, { ...item, volumenTotal: volumenCalculado });
             }
          });
        });
      });
    } else {
      const seleccion = selecciones[etapa.id] || 'todos';
      const puntosActivos = seleccion === 'todos' 
        ? etapa.puntos 
        : etapa.puntos.filter(p => seleccion.includes(p.id));

      puntosActivos.forEach(punto => {
        punto.oferta.forEach(item => {
          const volumenCalculado = punto.paxAsignado * item.consumoUnitario * item.peso * etapa.reglaConsumo;
          if (consolidado.has(item.id)) {
            consolidado.get(item.id)!.volumenTotal += volumenCalculado;
          } else {
            consolidado.set(item.id, { ...item, volumenTotal: volumenCalculado });
          }
        });
      });
    }

    let items = Array.from(consolidado.values());
    if (categoriaFiltro !== 'todos') {
      items = items.filter(i => i.categoria === categoriaFiltro);
    }
    
    return items;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10" data-evento-id={eventoId}>
      
      {/* Controles Superiores sin línea separadora inferior */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        <CategoryFilter 
          options={categoriasFiltroOptions}
          activeId={categoriaFiltro}
          onChange={(id) => setCategoriaFiltro(id)}
        />

        <ToggleButton 
          isActive={modoConsolidadoGlobal}
          onClick={() => setModoConsolidadoGlobal(!modoConsolidadoGlobal)}
          icon={<Scale size={14} />}
        >
          Vista Consolidada Global
        </ToggleButton>
      </div>

      {modoConsolidadoGlobal ? (
        <div className="overflow-x-auto custom-scrollbar pt-2">
          <Table className="border-none bg-transparent shadow-none">
            <TableHead>
              <TableRow className="border-b border-border/50">
                <TableHeaderCell>Concepto Comercial / Cóctel</TableHeaderCell>
                <TableHeaderCell align="center">Consumo Base</TableHeaderCell>
                <TableHeaderCell align="right">Volumen Requerido Global</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {obtenerConsolidado('global').length > 0 ? (
                obtenerConsolidado('global').map((item) => (
                  <TableRow key={item.id} className="border-b border-border/30 hover:bg-transparent transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-surface rounded-lg border border-border/50 shadow-sm">
                          {item.tipo === 'coctel' ? (
                            <Martini size={14} className="text-primary" />
                          ) : (
                            <Package size={14} className="text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-medium text-foreground">{item.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell align="center" className="font-mono text-xs text-muted">
                      {item.consumoUnitario} {item.unidadBase}/PAX
                    </TableCell>
                    <TableCell align="right">
                      <span className="font-mono text-base font-bold text-primary">
                        {item.volumenTotal.toLocaleString('es-CL', { maximumFractionDigits: 1 })} {item.unidadBase}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" className="py-8 text-muted border-none">
                    No hay datos consolidados para proyectar en las categorías seleccionadas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        etapasForecast.map((etapa) => {
          const seleccionActual = selecciones[etapa.id] || 'todos';
          const itemsConsolidados = obtenerConsolidado(etapa);
          const porcentajeHolgura = (etapa.reglaConsumo * 100 - 100).toFixed(0);

          return (
            <div key={etapa.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
              
              {/* Columna Izquierda: BlockHeader Oficial del UI Kit + Puntos Operativos */}
              <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                <BlockHeader 
                  horario={etapa.horario}
                  nombre={etapa.nombre}
                  fase={etapa.fase}
                  pax={etapa.paxEtapa}
                  holgura={porcentajeHolgura}
                />

                <div className="flex flex-col gap-2">
                  <SelectableCard 
                    title="Consolidado Etapa"
                    isActive={seleccionActual === 'todos'}
                    onClick={() => toggleSeleccion(etapa.id, 'todos')}
                  />

                  {etapa.puntos.map(punto => {
                    const estaSeleccionado = seleccionActual !== 'todos' && seleccionActual.includes(punto.id);
                    return (
                      <SelectableCard 
                        key={punto.id}
                        title={punto.nombre}
                        subtitle={`${punto.paxAsignado} PAX Asignados`}
                        isActive={estaSeleccionado}
                        onClick={() => toggleSeleccion(etapa.id, punto.id)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Columna Derecha: Tabla Flotante Read-Only */}
              <div className="lg:col-span-8 xl:col-span-9">
                <div className="overflow-x-auto custom-scrollbar">
                  <Table className="border-none bg-transparent shadow-none">
                    <TableHead>
                      <TableRow className="border-b border-border/50">
                        <TableHeaderCell>Concepto Comercial / Cóctel</TableHeaderCell>
                        <TableHeaderCell align="center">Consumo Base</TableHeaderCell>
                        <TableHeaderCell align="center">Peso (Ajuste)</TableHeaderCell>
                        <TableHeaderCell align="right">Volumen Requerido</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itemsConsolidados.length > 0 ? (
                        itemsConsolidados.map((item) => (
                          <TableRow key={item.id} className="border-b border-border/30 hover:bg-transparent transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-surface rounded-lg border border-border/50 shadow-sm">
                                  {item.tipo === 'coctel' ? (
                                    <Martini size={14} className="text-primary" />
                                  ) : (
                                    <Package size={14} className="text-muted-foreground" />
                                  )}
                                </div>
                                <span className="font-medium text-foreground">{item.nombre}</span>
                              </div>
                            </TableCell>
                            <TableCell align="center" className="font-mono text-xs text-muted">
                              {item.consumoUnitario} {item.unidadBase}/PAX
                            </TableCell>
                            <TableCell align="center" className="font-mono text-xs text-muted">
                              {item.peso}x
                            </TableCell>
                            <TableCell align="right">
                              <span className="font-mono text-base font-bold text-primary">
                                {item.volumenTotal.toLocaleString('es-CL', { maximumFractionDigits: 1 })} {item.unidadBase}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" className="py-8 text-muted border-none">
                            No hay elementos para los filtros o puntos seleccionados.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}