// src/modules/eventos/components/EventoPickingsTab.tsx
import { useState } from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { Clock, Check, ListFilter, ChefHat, Package, Wine, Wrench, Layers } from 'lucide-react';

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
  horario: string;
  paxEtapa: number;
  puntos: PuntoServicioLogistica[];
}

export function EventoPickingsTab({ eventoId: _eventoId }: EventoPickingsTabProps) {
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaLogistica>('produccion');
  const [modoConsolidado, setModoConsolidado] = useState<boolean>(false);
  const [selecciones, setSelecciones] = useState<Record<number, 'todos' | number[]>>({});

  const etapasLogistica: EtapaLogistica[] = [
    {
      id: 1,
      nombre: 'Etapa 1: Recepción & Cóctel',
      horario: '19:00 - 21:00',
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

  const obtenerItemsProcesados = (etapa: EtapaLogistica) => {
    if (modoConsolidado) {
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
    <div className="space-y-6 animate-fade-in pb-10" data-evento-id={_eventoId}>
      
      {/* 1. CONTROLES SUPERIORES FLOTANTES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Selector de Categorías */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setCategoriaActiva('produccion')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              categoriaActiva === 'produccion' 
                ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                : 'bg-transparent hover:bg-surface text-foreground border-border/50'
            }`}
          >
            <ChefHat size={14} />
            <span>Producción & Mise in Place</span>
          </button>
          
          <button
            onClick={() => setCategoriaActiva('insumos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              categoriaActiva === 'insumos' 
                ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                : 'bg-transparent hover:bg-surface text-foreground border-border/50'
            }`}
          >
            <Wine size={14} />
            <span>Insumos Comerciales</span>
          </button>

          <button
            onClick={() => setCategoriaActiva('soportes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              categoriaActiva === 'soportes' 
                ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                : 'bg-transparent hover:bg-surface text-foreground border-border/50'
            }`}
          >
            <Package size={14} />
            <span>Soportes & Cristalería</span>
          </button>

          <button
            onClick={() => setCategoriaActiva('herramientas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              categoriaActiva === 'herramientas' 
                ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                : 'bg-transparent hover:bg-surface text-foreground border-border/50'
            }`}
          >
            <Wrench size={14} />
            <span>Herramientas & Equipos</span>
          </button>
        </div>

        {/* Botón Toggle Consolidado Global */}
        <button
          onClick={() => setModoConsolidado(!modoConsolidado)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
            modoConsolidado 
              ? 'bg-primary text-primary-foreground border-primary shadow-md' 
              : 'bg-transparent hover:bg-surface text-foreground border-border/50'
          }`}
        >
          <Layers size={14} />
          <span>Vista Consolidada Global</span>
        </button>

      </div>

      {/* 2. RENDERIZADO DE CONTENIDO */}
      {modoConsolidado ? (
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHead>
                <TableRow className="border-b border-border/50">
                  <TableHeaderCell>Descripción del Ítem</TableHeaderCell>
                  <TableHeaderCell>Notas / Formato</TableHeaderCell>
                  <TableHeaderCell align="right">Cantidad Total a Cargar</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {obtenerItemsProcesados(etapasLogistica[0]).map((item) => (
                  <TableRow key={item.id} className="border-b border-border/30 hover:bg-transparent">
                    <TableCell className="font-medium text-foreground">{item.nombre}</TableCell>
                    <TableCell className="text-xs text-muted">{item.detalleAdicional || 'Estándar'}</TableCell>
                    <TableCell align="right">
                      <span className="font-mono text-base font-bold text-primary">
                        {item.cantidad.toLocaleString('es-CL')} {item.unidad}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        etapasLogistica.map((etapa) => {
          const seleccionActual = selecciones[etapa.id] || 'todos';
          const itemsEtapa = obtenerItemsProcesados(etapa);

          return (
            <div key={etapa.id} className="flex flex-col gap-4">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ml-2 border-b border-border/50 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl shadow-sm">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground tracking-tight">{etapa.nombre}</h3>
                    <div className="flex items-center gap-3 text-xs font-mono text-muted">
                      <span>{etapa.horario} hrs</span>
                      <span className="text-border/50">•</span>
                      <span className="font-bold text-primary">{etapa.paxEtapa} PAX</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Columna Izquierda: Puntos Operativos */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted font-bold ml-1">
                    <ListFilter size={14} />
                    <span>Puntos Operativos</span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => toggleSeleccion(etapa.id, 'todos')}
                      className={`flex items-center justify-between p-3 rounded-2xl text-sm transition-all border ${
                        seleccionActual === 'todos' 
                          ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                          : 'bg-transparent hover:bg-surface text-foreground border-border/50'
                      }`}
                    >
                      <span className="font-semibold">Consolidado Etapa</span>
                      {seleccionActual === 'todos' && <Check size={16} />}
                    </button>

                    {etapa.puntos.map(punto => {
                      const estaSeleccionado = seleccionActual !== 'todos' && seleccionActual.includes(punto.id);
                      return (
                        <button
                          key={punto.id}
                          onClick={() => toggleSeleccion(etapa.id, punto.id)}
                          className={`flex flex-col text-left p-3 rounded-2xl transition-all border ${
                            estaSeleccionado 
                              ? 'bg-primary/10 border-primary/30 shadow-sm' 
                              : 'bg-transparent hover:bg-surface border-border/50'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`font-medium text-sm ${estaSeleccionado ? 'text-primary font-bold' : 'text-foreground'}`}>
                              {punto.nombre}
                            </span>
                            {estaSeleccionado && <Check size={16} className="text-primary" />}
                          </div>
                          <span className="text-xs font-mono text-muted mt-1">{punto.paxAsignado} PAX</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Columna Derecha: Tabla Flotante de Picking */}
                <div className="lg:col-span-8 xl:col-span-9">
                  <div className="overflow-x-auto custom-scrollbar">
                    <Table>
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
                            <TableRow key={item.id} className="border-b border-border/30 hover:bg-transparent">
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
            </div>
          );
        })
      )}

    </div>
  );
}