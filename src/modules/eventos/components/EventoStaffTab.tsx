// src/modules/eventos/components/EventoStaffTab.tsx
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { Clock, Check, ListFilter, Users, ShieldCheck, GlassWater, Sparkles, Briefcase } from 'lucide-react';

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
  horario: string;
  paxEtapa: number;
  puntos: PuntoServicioStaff[];
}

export function EventoStaffTab({ eventoId: _eventoId }: EventoStaffTabProps) {
  const [perfilesSeleccionados, setPerfilesSeleccionados] = useState<PerfilSeleccion>('all');
  const [modoConsolidado, setModoConsolidado] = useState<boolean>(false);
  const [seleccionesPuntos, setSeleccionesPuntos] = useState<Record<number, 'todos' | number[]>>({});

  const etapasStaff: EtapaStaff[] = [
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

  const togglePerfil = (perfil: PerfilStaffKey | 'all') => {
    setPerfilesSeleccionados(prev => {
      if (perfil === 'all') return 'all';
      if (prev === 'all') return [perfil];
      const existe = prev.includes(perfil);
      const nuevaLista = existe ? prev.filter(p => p !== perfil) : [...prev, perfil];
      return nuevaLista.length === 0 ? 'all' : nuevaLista;
    });
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

  const obtenerStaffProcesado = (etapa: EtapaStaff) => {
    const perfilesActivos: PerfilStaffKey[] = perfilesSeleccionados === 'all' 
      ? ['capitanes', 'bartenders', 'barbacks', 'produccion'] 
      : perfilesSeleccionados;

    if (modoConsolidado) {
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

  const isPerfilSelected = (perfil: PerfilStaffKey | 'all') => {
    if (perfil === 'all') return perfilesSeleccionados === 'all';
    if (perfilesSeleccionados === 'all') return false;
    return perfilesSeleccionados.includes(perfil);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10" data-evento-id={_eventoId}>
      
      {/* 1. CONTROLES SUPERIORES FLOTANTES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Selector Multiselección de Perfiles */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => togglePerfil('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              perfilesSeleccionados === 'all' 
                ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                : 'bg-transparent hover:bg-surface text-foreground border-border/50'
            }`}
          >
            <Sparkles size={14} />
            <span>All Staff</span>
            {perfilesSeleccionados === 'all' && <Check size={14} className="ml-1" />}
          </button>

          <button
            onClick={() => togglePerfil('bartenders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isPerfilSelected('bartenders') 
                ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                : 'bg-transparent hover:bg-surface text-foreground border-border/50'
            }`}
          >
            <GlassWater size={14} />
            <span>Bartenders</span>
            {isPerfilSelected('bartenders') && <Check size={14} className="ml-1" />}
          </button>
          
          <button
            onClick={() => togglePerfil('capitanes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isPerfilSelected('capitanes') 
                ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                : 'bg-transparent hover:bg-surface text-foreground border-border/50'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Capitanes de Barra</span>
            {isPerfilSelected('capitanes') && <Check size={14} className="ml-1" />}
          </button>

          <button
            onClick={() => togglePerfil('barbacks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isPerfilSelected('barbacks') 
                ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                : 'bg-transparent hover:bg-surface text-foreground border-border/50'
            }`}
          >
            <Users size={14} />
            <span>Barbacks & Logística</span>
            {isPerfilSelected('barbacks') && <Check size={14} className="ml-1" />}
          </button>

          <button
            onClick={() => togglePerfil('produccion')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isPerfilSelected('produccion') 
                ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                : 'bg-transparent hover:bg-surface text-foreground border-border/50'
            }`}
          >
            <Briefcase size={14} />
            <span>Staff de Producción</span>
            {isPerfilSelected('produccion') && <Check size={14} className="ml-1" />}
          </button>
        </div>

        {/* Botón Toggle Consolidado Global (Brilla por sí solo, sin headers ni badges) */}
        <button
          onClick={() => setModoConsolidado(!modoConsolidado)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
            modoConsolidado 
              ? 'bg-primary text-primary-foreground border-primary shadow-md' 
              : 'bg-transparent hover:bg-surface text-foreground border-border/50'
          }`}
        >
          <Sparkles size={14} />
          <span>Vista Consolidada Global</span>
        </button>

      </div>

      {/* 2. RENDERIZADO DE CONTENIDO (Sin headers redundantes, alineado a la altura de la tabla) */}
      {modoConsolidado ? (
        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHead>
              <TableRow className="border-b border-border/50">
                <TableHeaderCell>Colaborador</TableHeaderCell>
                <TableHeaderCell>Rol / Perfil</TableHeaderCell>
                <TableHeaderCell>Puntos de Servicio / Alcance</TableHeaderCell>
                <TableHeaderCell align="right">Estado</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {obtenerStaffProcesado(etapasStaff[0]).map((miembro) => (
                <TableRow key={miembro.id} className="border-b border-border/30 hover:bg-transparent">
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
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        etapasStaff.map((etapa) => {
          const seleccionActual = seleccionesPuntos[etapa.id] || 'todos';
          const staffEtapa = obtenerStaffProcesado(etapa);

          return (
            <div key={etapa.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Columna Izquierda: Información de Etapa + Puntos Operativos alineados a la tabla */}
              <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                
                {/* Información de la Etapa integrada arriba al mismo nivel que el header de la tabla */}
                <div className="flex items-center gap-3 p-3 bg-surface/50 border border-border/40 rounded-2xl">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
                    <Clock size={16} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">{etapa.nombre}</h4>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-muted">
                      <span>{etapa.horario} hrs</span>
                      <span>•</span>
                      <span className="font-bold text-primary">{etapa.paxEtapa} PAX</span>
                    </div>
                  </div>
                </div>

                {/* Puntos Operativos */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted font-bold ml-1">
                    <ListFilter size={14} />
                    <span>Puntos Operativos</span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => toggleSeleccionPunto(etapa.id, 'todos')}
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
                          onClick={() => toggleSeleccionPunto(etapa.id, punto.id)}
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
              </div>

              {/* Columna Derecha: Tabla Flotante de Staff (Sus cabeceras inician exactamente a la misma altura que la info de etapa) */}
              <div className="lg:col-span-8 xl:col-span-9">
                <div className="overflow-x-auto custom-scrollbar">
                  <Table>
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
                          <TableRow key={miembro.id} className="border-b border-border/30 hover:bg-transparent">
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