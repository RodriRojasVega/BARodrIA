// src/modules/eventos/components/EventoPickingsTab.tsx
import { useState } from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { BlockHeader } from '@/components/ui/BlockHeader';
import { SelectableCard } from '@/components/ui/SelectableCard';
import { ToggleButton } from '@/components/ui/ToggleButton';
import { CategoryFilter, type CategoryOption } from '@/components/ui/CategoryFilter';
import { ChefHat, Wine, Package, Wrench, Layers } from 'lucide-react';

interface EventoPickingsTabProps {
  eventoId: number;
  totalPax?: number;
}

type CategoriaLogistica = 'produccion' | 'insumos' | 'soportes' | 'herramientas';

interface ItemLogistico {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
  detalleAdicional?: string;
}

interface PuntoServicioLogistica {
  id: number;
  nombre: string;
  paxAsignado: number;
  secciones: {
    produccion: ItemLogistico[];
    insumos: ItemLogistico[];
    soportes: ItemLogistico[];
    herramientas: ItemLogistico[];
  };
}

interface EtapaLogistica {
  id: number;
  nombre: string;
  fase: string;
  horario: string;
  paxEtapa: number;
  puntos: PuntoServicioLogistica[];
}

export function EventoPickingsTab({ eventoId }: EventoPickingsTabProps) {
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaLogistica>('produccion');
  const [modoConsolidado, setModoConsolidado] = useState<boolean>(false);
  const [selecciones, setSelecciones] = useState<Record<number, 'todos' | number[]>>({});

  const categoriasLogisticaOptions: CategoryOption[] = [
    { id: 'produccion', label: 'Producción & Mise in Place', icon: <ChefHat size={14} /> },
    { id: 'insumos', label: 'Insumos Comerciales', icon: <Wine size={14} /> },
    { id: 'soportes', label: 'Soportes & Cristalería', icon: <Package size={14} /> },
    { id: 'herramientas', label: 'Herramientas & Equipos', icon: <Wrench size={14} /> },
  ];

  const etapasLogistica: EtapaLogistica[] = [
    {
      id: 1,
      nombre: 'Recepción & Cóctel',
      fase: 'Etapa 1',
      horario: '19:00 - 21:00 hrs',
      paxEtapa: 600,
      puntos: [
        {
          id: 101,
          nombre: 'Barra Terraza Exterior',
          paxAsignado: 450,
          secciones: {
            produccion: [
              { id: 1, nombre: 'Almíbar de Romero (Artesanal)', cantidad: 2.5, unidad: 'Litros', detalleAdicional: 'Batch previo de 24 hrs' },
              { id: 2, nombre: 'Zumo de Limón Clarificado', cantidad: 4.0, unidad: 'Litros' }
            ],
            insumos: [
              { id: 3, nombre: 'Pisco Transparente 40° (Botella 750ml)', cantidad: 18, unidad: 'Unidades' },
              { id: 4, nombre: 'Bebida de Fantasía Cola (Pack 3L)', cantidad: 12, unidad: 'Unidades' }
            ],
            soportes: [
              { id: 5, nombre: 'Vaso Highball (Racks de 25)', cantidad: 4, unidad: 'Racks', detalleAdicional: '100 unidades total' }
            ],
            herramientas: [
              { id: 6, nombre: 'Jigger Acero Inoxidable 1oz/2oz', cantidad: 3, unidad: 'Unidades' },
              { id: 7, nombre: 'Pinza para Hielo Inox', cantidad: 2, unidad: 'Unidades' }
            ]
          }
        },
        {
          id: 102,
          nombre: 'Estación de Bienvenida VIP',
          paxAsignado: 150,
          secciones: {
            produccion: [
              { id: 8, nombre: 'Garnish: Rodajas Deshidratadas Cítricas', cantidad: 150, unidad: 'Unidades' }
            ],
            insumos: [
              { id: 9, nombre: 'Espumante Brut (Botella 750ml)', cantidad: 10, unidad: 'Unidades' }
            ],
            soportes: [
              { id: 10, nombre: 'Copa Flauta Champaña (Racks de 20)', cantidad: 2, unidad: 'Racks' }
            ],
            herramientas: [
              { id: 11, nombre: 'Enfriador de Botellas Acrílico', cantidad: 2, unidad: 'Unidades' }
            ]
          }
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

  const obtenerItemsProcesados = (etapa: EtapaLogistica | 'global') => {
    if (etapa === 'global') {
      const mapaGlobal = new Map<string, ItemLogistico & { cantidad: number }>();
      etapasLogistica.forEach(e => {
        e.puntos.forEach(p => {
          p.secciones[categoriaActiva].forEach(item => {
            if (mapaGlobal.has(item.nombre)) {
              mapaGlobal.get(item.nombre)!.cantidad += item.cantidad;
            } else {
              mapaGlobal.set(item.nombre, { ...item });
            }
          });
        });
      });
      return Array.from(mapaGlobal.values());
    } else {
      const seleccion = selecciones[etapa.id] || 'todos';
      const puntosActivos = seleccion === 'todos' 
        ? etapa.puntos 
        : etapa.puntos.filter(p => seleccion.includes(p.id));

      const mapaEtapa = new Map<string, ItemLogistico & { cantidad: number }>();
      puntosActivos.forEach(punto => {
        punto.secciones[categoriaActiva].forEach(item => {
          if (mapaEtapa.has(item.nombre)) {
            mapaEtapa.get(item.nombre)!.cantidad += item.cantidad;
          } else {
            mapaEtapa.set(item.nombre, { ...item });
          }
        });
      });
      return Array.from(mapaEtapa.values());
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10" data-evento-id={eventoId}>
      
      {/* 1. CONTROLES SUPERIORES: CategoryFilter y ToggleButton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        <CategoryFilter 
          options={categoriasLogisticaOptions}
          activeId={categoriaActiva}
          onChange={(id) => setCategoriaActiva(id as CategoriaLogistica)}
        />

        <ToggleButton 
          isActive={modoConsolidado}
          onClick={() => setModoConsolidado(!modoConsolidado)}
          icon={<Layers size={14} />}
        >
          Vista Consolidada Global
        </ToggleButton>
      </div>

      {/* 2. RENDERIZADO DE CONTENIDO */}
      {modoConsolidado ? (
        <div className="overflow-x-auto custom-scrollbar pt-2">
          <Table className="border-none bg-transparent shadow-none">
            <TableHead>
              <TableRow className="border-b border-border/50">
                <TableHeaderCell>Descripción del Ítem</TableHeaderCell>
                <TableHeaderCell>Notas / Formato</TableHeaderCell>
                <TableHeaderCell align="right">Cantidad Total a Cargar</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {obtenerItemsProcesados('global').length > 0 ? (
                obtenerItemsProcesados('global').map((item) => (
                  <TableRow key={item.id} className="border-b border-border/30 hover:bg-transparent transition-colors">
                    <TableCell className="font-medium text-foreground">{item.nombre}</TableCell>
                    <TableCell className="text-xs text-muted">{item.detalleAdicional || 'Estándar'}</TableCell>
                    <TableCell align="right">
                      <span className="font-mono text-base font-bold text-primary">
                        {item.cantidad.toLocaleString('es-CL')} {item.unidad}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" className="py-8 text-muted border-none">
                    No hay elementos en esta categoría para proyectar globalmente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        etapasLogistica.map((etapa) => {
          const seleccionActual = selecciones[etapa.id] || 'todos';
          const itemsEtapa = obtenerItemsProcesados(etapa);

          return (
            <div key={etapa.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
              
              {/* Columna Izquierda: BlockHeader Oficial + Puntos Operativos */}
              <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                <BlockHeader 
                  horario={etapa.horario}
                  nombre={etapa.nombre}
                  fase={etapa.fase}
                  pax={etapa.paxEtapa}
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
                        <TableHeaderCell>Descripción del Ítem</TableHeaderCell>
                        <TableHeaderCell>Notas / Formato</TableHeaderCell>
                        <TableHeaderCell align="right">Cantidad Requerida</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itemsEtapa.length > 0 ? (
                        itemsEtapa.map((item) => (
                          <TableRow key={item.id} className="border-b border-border/30 hover:bg-transparent transition-colors">
                            <TableCell className="font-medium text-foreground">{item.nombre}</TableCell>
                            <TableCell className="text-xs text-muted">{item.detalleAdicional || 'Estándar'}</TableCell>
                            <TableCell align="right">
                              <span className="font-mono text-base font-bold text-primary">
                                {item.cantidad.toLocaleString('es-CL')} {item.unidad}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center" className="py-8 text-muted border-none">
                            No hay elementos en esta sección para los puntos seleccionados.
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