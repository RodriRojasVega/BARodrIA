// src/modules/eventos/components/EventoStaffTab.tsx
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { BlockHeader } from '@/components/ui/BlockHeader';
import { SelectableCard } from '@/components/ui/SelectableCard';
import { ToggleButton } from '@/components/ui/ToggleButton';
import { CategoryFilter, type CategoryOption } from '@/components/ui/CategoryFilter';
import { Sparkles, GlassWater, ShieldCheck, Users, Briefcase } from 'lucide-react';

interface EventoStaffTabProps {
  eventoId: number;
}

type PerfilStaffKey = 'capitanes' | 'bartenders' | 'barbacks' | 'produccion';
type PerfilSeleccion = 'all' | PerfilStaffKey[];

interface MiembroStaff {
  id: number;
  nombre: string;
  rol: PerfilStaffKey;
  rolEspecifico: string;
  estado: 'Asignado' | 'Confirmado' | 'En Ruta';
  puntosAsignados: string;
}

interface PuntoServicioStaff {
  id: number;
  nombre: string;
  paxAsignado: number;
  secciones: {
    capitanes: MiembroStaff[];
    bartenders: MiembroStaff[];
    barbacks: MiembroStaff[];
    produccion: MiembroStaff[];
  };
}

interface EtapaStaff {
  id: number;
  nombre: string;
  fase: string;
  horario: string;
  paxEtapa: number;
  puntos: PuntoServicioStaff[];
}

export function EventoStaffTab({ eventoId }: EventoStaffTabProps) {
  const [perfilesSeleccionados, setPerfilesSeleccionados] = useState<PerfilSeleccion>('all');
  const [modoConsolidado, setModoConsolidado] = useState<boolean>(false);
  const [seleccionesPuntos, setSeleccionesPuntos] = useState<Record<number, 'todos' | number[]>>({});

  const perfilesFiltroOptions: CategoryOption[] = [
    { id: 'all', label: 'All Staff', icon: <Sparkles size={14} /> },
    { id: 'bartenders', label: 'Bartenders', icon: <GlassWater size={14} /> },
    { id: 'capitanes', label: 'Capitanes de Barra', icon: <ShieldCheck size={14} /> },
    { id: 'barbacks', label: 'Barbacks & Logística', icon: <Users size={14} /> },
    { id: 'produccion', label: 'Staff de Producción', icon: <Briefcase size={14} /> },
  ];

  const etapasStaff: EtapaStaff[] = [
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
            capitanes: [
              { id: 1, nombre: 'Carlos Mendoza', rol: 'capitanes', rolEspecifico: 'Capitán de Barra Senior', estado: 'Confirmado', puntosAsignados: 'Barra Terraza, Estación VIP' }
            ],
            bartenders: [
              { id: 2, nombre: 'Matías Soto', rol: 'bartenders', rolEspecifico: 'Bartender Coctelería Clásica', estado: 'Confirmado', puntosAsignados: 'Barra Terraza Exterior' },
              { id: 3, nombre: 'Valentina Rojas', rol: 'bartenders', rolEspecifico: 'Bartender Mixer & Highball', estado: 'Asignado', puntosAsignados: 'Barra Terraza Exterior' }
            ],
            barbacks: [
              { id: 4, nombre: 'Ignacio Pizarro', rol: 'barbacks', rolEspecifico: 'Barback / Logística de Hielo', estado: 'Confirmado', puntosAsignados: 'Barra Terraza, Isla Central' }
            ],
            produccion: [
              { id: 5, nombre: 'Camila Valenzuela', rol: 'produccion', rolEspecifico: 'Jefe de Mise en Place & Producción', estado: 'Confirmado', puntosAsignados: 'Global del Evento' }
            ]
          }
        },
        {
          id: 102,
          nombre: 'Estación de Bienvenida VIP',
          paxAsignado: 150,
          secciones: {
            capitanes: [],
            bartenders: [
              { id: 6, nombre: 'Esteban Fariña', rol: 'bartenders', rolEspecifico: 'Bartender Espumantes', estado: 'Confirmado', puntosAsignados: 'Estación VIP' }
            ],
            barbacks: [
              { id: 7, nombre: 'Lucas Morales', rol: 'barbacks', rolEspecifico: 'Barback Auxiliar', estado: 'Asignado', puntosAsignados: 'Estación VIP' }
            ],
            produccion: []
          }
        }
      ]
    }
  ];

  const handlePerfilChange = (id: string | number) => {
    if (id === 'all') {
      setPerfilesSeleccionados('all');
      return;
    }
    const perfil = id as PerfilStaffKey;
    setPerfilesSeleccionados(prev => {
      if (prev === 'all') return [perfil];
      const existe = prev.includes(perfil);
      const nuevaLista = existe ? prev.filter(p => p !== perfil) : [...prev, perfil];
      return nuevaLista.length === 0 ? 'all' : nuevaLista;
    });
  };

  const getActivePerfilIds = () => {
    if (perfilesSeleccionados === 'all') return ['all'];
    return perfilesSeleccionados;
  };

  const toggleSeleccionPunto = (etapaId: number, puntoId: number | 'todos') => {
    setSeleccionesPuntos(prev => {
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

  const obtenerStaffProcesado = (etapa: EtapaStaff | 'global') => {
    const perfilesActivos: PerfilStaffKey[] = perfilesSeleccionados === 'all' 
      ? ['capitanes', 'bartenders', 'barbacks', 'produccion'] 
      : perfilesSeleccionados;

    if (etapa === 'global') {
      const mapaGlobal = new Map<number, MiembroStaff>();
      etapasStaff.forEach(e => {
        e.puntos.forEach(p => {
          perfilesActivos.forEach(perfilKey => {
            p.secciones[perfilKey].forEach(miembro => {
              if (!mapaGlobal.has(miembro.id)) {
                mapaGlobal.set(miembro.id, miembro);
              }
            });
          });
        });
      });
      return Array.from(mapaGlobal.values());
    } else {
      const seleccion = seleccionesPuntos[etapa.id] || 'todos';
      const puntosActivos = seleccion === 'todos' 
        ? etapa.puntos 
        : etapa.puntos.filter(p => seleccion.includes(p.id));

      const mapaEtapa = new Map<number, MiembroStaff>();
      puntosActivos.forEach(punto => {
        perfilesActivos.forEach(perfilKey => {
          punto.secciones[perfilKey].forEach(miembro => {
            if (!mapaEtapa.has(miembro.id)) {
              mapaEtapa.set(miembro.id, miembro);
            }
          });
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
          options={perfilesFiltroOptions}
          activeId={getActivePerfilIds()}
          onChange={handlePerfilChange}
        />

        <ToggleButton 
          isActive={modoConsolidado}
          onClick={() => setModoConsolidado(!modoConsolidado)}
          icon={<Sparkles size={14} />}
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
                <TableHeaderCell>Colaborador</TableHeaderCell>
                <TableHeaderCell>Rol / Perfil</TableHeaderCell>
                <TableHeaderCell>Puntos de Servicio / Alcance</TableHeaderCell>
                <TableHeaderCell align="right">Estado</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {obtenerStaffProcesado('global').length > 0 ? (
                obtenerStaffProcesado('global').map((miembro) => (
                  <TableRow key={miembro.id} className="border-b border-border/30 hover:bg-transparent transition-colors">
                    <TableCell className="font-medium text-foreground">{miembro.nombre}</TableCell>
                    <TableCell className="text-xs text-muted">
                      <span className="capitalize font-semibold text-primary">{miembro.rol}</span> — {miembro.rolEspecifico}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-foreground">{miembro.puntosAsignados}</TableCell>
                    <TableCell align="right">
                      <Badge variant={miembro.estado === 'Confirmado' ? 'success' : 'warning'}>
                        {miembro.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" className="py-8 text-muted border-none">
                    No hay personal en los perfiles seleccionados para proyectar globalmente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        etapasStaff.map((etapa) => {
          const seleccionActual = seleccionesPuntos[etapa.id] || 'todos';
          const staffEtapa = obtenerStaffProcesado(etapa);

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
                    onClick={() => toggleSeleccionPunto(etapa.id, 'todos')}
                  />

                  {etapa.puntos.map(punto => {
                    const estaSeleccionado = seleccionActual !== 'todos' && seleccionActual.includes(punto.id);
                    return (
                      <SelectableCard 
                        key={punto.id}
                        title={punto.nombre}
                        subtitle={`${punto.paxAsignado} PAX Asignados`}
                        isActive={estaSeleccionado}
                        onClick={() => toggleSeleccionPunto(etapa.id, punto.id)}
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
                        <TableHeaderCell>Colaborador</TableHeaderCell>
                        <TableHeaderCell>Rol / Perfil</TableHeaderCell>
                        <TableHeaderCell>Puntos de Servicio / Alcance</TableHeaderCell>
                        <TableHeaderCell align="right">Estado</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {staffEtapa.length > 0 ? (
                        staffEtapa.map((miembro) => (
                          <TableRow key={miembro.id} className="border-b border-border/30 hover:bg-transparent transition-colors">
                            <TableCell className="font-medium text-foreground">{miembro.nombre}</TableCell>
                            <TableCell className="text-xs text-muted">
                              <span className="capitalize font-semibold text-primary">{miembro.rol}</span> — {miembro.rolEspecifico}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-foreground">{miembro.puntosAsignados}</TableCell>
                            <TableCell align="right">
                              <Badge variant={miembro.estado === 'Confirmado' ? 'success' : 'warning'}>
                                {miembro.estado}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" className="py-8 text-muted border-none">
                            No hay personal asignado en los perfiles seleccionados para estos puntos.
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