// src/modules/eventos/components/tabs/EventoForecastFormTab.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectableCard } from '@/components/ui/SelectableCard';
import { BlockHeader } from '@/components/ui/BlockHeader';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { Plus, Store, Users, Martini, Package, Trash2, Settings2, Pencil } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 1. IMPORTAMOS LOS TIPOS DEL PADRE
import type { EtapaForm, Salon } from './EventoCronogramaFormTab';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// ==========================================
// INTERFACES & PROPS
// ==========================================
interface EventoForecastFormTabProps {
  eventoId: number;
  puntos: PuntoServicioForm[];
  onChangePuntos: (puntos: PuntoServicioForm[]) => void;
  etapas: EtapaForm[];
  salonesDisponibles: Salon[];
}

export interface PuntoServicioForm {
  id: string; 
  etapa_id: string | number;
  nombre: string;
  pax: number;
  salon_ids: number[];
  menu_id: number | null;
  pesos_ajustados: Record<number, number>; 
}

// TODO: Reemplazar con fetch a catálogo de Supabase en el futuro
const mockMenus = [
  { 
    id: 1, 
    nombre: 'Barra Abierta Estándar', 
    conceptos: [
      { id: 1, nombre: 'Pisco Sour Catedral', tipo: 'Cócteles', unidad: 'unit', peso_defecto: 30 },
      { id: 2, nombre: 'Mojito Tradicional', tipo: 'Cócteles', unidad: 'unit', peso_defecto: 20 },
      { id: 3, nombre: 'Bebida de Fantasía Cola', tipo: 'Mixers', unidad: 'ml', peso_defecto: 30 },
      { id: 4, nombre: 'Bebida Limón', tipo: 'Mixers', unidad: 'ml', peso_defecto: 20 },
    ]
  },
  {
    id: 2,
    nombre: 'Estación de Bienvenida',
    conceptos: [
      { id: 1, nombre: 'Pisco Sour Catedral', tipo: 'Cócteles', unidad: 'unit', peso_defecto: 50 },
      { id: 5, nombre: 'Agua Mineral Sin Gas', tipo: 'Mixers', unidad: 'ml', peso_defecto: 50 },
    ]
  }
];

export function EventoForecastFormTab({ 
  eventoId, 
  puntos, 
  onChangePuntos, 
  etapas, 
  salonesDisponibles 
}: EventoForecastFormTabProps) {
  
  const [puntoActivoId, setPuntoActivoId] = useState<string | null>(null);
  
  // Nota: Mantenemos el factor de la etapa local por ahora para visualización.
  // Si deseas guardarlo en BD, deberíamos elevarlo al onChangeEtapas del padre.
  const [factoresEtapa, setFactoresEtapa] = useState<Record<string | number, number>>({});
  const [editingFactorId, setEditingFactorId] = useState<string | number | null>(null);

  // ==========================================
  // LÓGICA DE NEGOCIO (Utilizando onChangePuntos)
  // ==========================================
  const handleAddPunto = (etapaId: string | number) => {
    const nuevoPunto: PuntoServicioForm = {
      id: `temp_${Date.now()}`,
      etapa_id: etapaId,
      nombre: 'Nuevo Punto de Servicio',
      pax: 0,
      salon_ids: [],
      menu_id: null,
      pesos_ajustados: {},
    };
    onChangePuntos([...puntos, nuevoPunto]);
    setPuntoActivoId(nuevoPunto.id);
  };

  const handleUpdatePunto = (id: string, field: keyof PuntoServicioForm, value: unknown) => {
    onChangePuntos(puntos.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, [field]: value };
      
      if (field === 'menu_id') {
        const menuSeleccionado = mockMenus.find(m => m.id === value);
        if (menuSeleccionado) {
          const nuevosPesos: Record<number, number> = {};
          menuSeleccionado.conceptos.forEach(c => nuevosPesos[c.id] = c.peso_defecto);
          updated.pesos_ajustados = nuevosPesos;
        } else {
          updated.pesos_ajustados = {};
        }
      }
      return updated;
    }));
  };

  const toggleSalon = (puntoId: string, salonId: number) => {
    onChangePuntos(puntos.map(p => {
      if (p.id !== puntoId) return p;
      const isSelected = p.salon_ids.includes(salonId);
      const newSalones = isSelected 
        ? p.salon_ids.filter(id => id !== salonId) 
        : [...p.salon_ids, salonId];
      return { ...p, salon_ids: newSalones };
    }));
  };

  const handleUpdatePeso = (puntoId: string, conceptoId: number, nuevoPeso: number) => {
    onChangePuntos(puntos.map(p => p.id === puntoId 
      ? { ...p, pesos_ajustados: { ...p.pesos_ajustados, [conceptoId]: nuevoPeso } } 
      : p
    ));
  };

  const handleDeletePunto = (id: string) => {
    onChangePuntos(puntos.filter(p => p.id !== id));
    if (puntoActivoId === id) setPuntoActivoId(null);
  };

  const getPaxAsignadosPorEtapa = (etapaId: string | number) => {
    return puntos.filter(p => p.etapa_id === etapaId).reduce((acc, p) => acc + (Number(p.pax) || 0), 0);
  };

  const puntoActivo = puntos.find(p => p.id === puntoActivoId);
  const menuDelPunto = mockMenus.find(m => m.id === puntoActivo?.menu_id);

  if (etapas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted p-8 border border-border/30 rounded-xl bg-transparent border-dashed mt-4">
        <Users size={32} className="mb-4 opacity-50" />
        <p className="font-medium text-foreground">Sin etapas operativas</p>
        <p className="text-sm mt-1 text-center max-w-sm">
          Debes crear al menos una etapa en la pestaña "Etapas Operativas" antes de poder asignar puntos de servicio.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in pb-8 pt-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================== */}
        {/* COLUMNA IZQUIERDA: ETAPAS Y PUNTOS (MASTER) */}
        {/* ========================================== */}
        <section className="lg:col-span-4 lg:sticky lg:top-4 flex flex-col gap-6">
          {etapas.map((etapa, index) => {
            const paxAsignados = getPaxAsignadosPorEtapa(etapa.id);
            const paxObjetivo = Number(etapa.pax_etapa) || 0;
            const cuadraPax = paxAsignados === paxObjetivo && paxObjetivo > 0;
            const excesoPax = paxAsignados > paxObjetivo;
            const puntosDeEtapa = puntos.filter(p => p.etapa_id === etapa.id);
            
            const factorActual = factoresEtapa[etapa.id] !== undefined 
              ? factoresEtapa[etapa.id] 
              : ((Number(etapa.regla_consumo) || 1) - 1) * 100;

            const horarioFormateado = `${etapa.hora_inicio?.slice(0,5) || '--:--'} - ${etapa.hora_fin?.slice(0,5) || '--:--'} hrs`;

            return (
              <div key={etapa.id} className="space-y-4 relative">
                
                <BlockHeader 
                  horario={horarioFormateado}
                  nombre={etapa.nombre}
                  fase={`Etapa ${index + 1}`}
                  rightElement={
                    <div className="flex flex-col items-end gap-1.5">
                      <div className={cn(
                        "flex items-center gap-1.5 text-xs font-mono font-bold px-2 py-1 rounded border",
                        cuadraPax ? "bg-success/10 text-success border-success/30" : 
                        excesoPax ? "bg-danger/10 text-danger border-danger/30" : "bg-warning/10 text-warning border-warning/30"
                      )}>
                        <Users size={13} />
                        <span>{paxAsignados} / {paxObjetivo}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-border/40 bg-surface-muted/30 text-xs font-mono">
                        <Settings2 size={12} className="text-muted-foreground" />
                        
                        {editingFactorId === etapa.id ? (
                          <div className="flex items-center gap-0.5">
                            <input 
                              type="number" 
                              autoFocus
                              className="w-10 bg-transparent text-foreground text-right focus:outline-none" 
                              value={factorActual === 0 ? '' : factorActual}
                              onChange={(e) => setFactoresEtapa({...factoresEtapa, [etapa.id]: parseInt(e.target.value) || 0})}
                              onBlur={() => setEditingFactorId(null)}
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-foreground font-bold">{factorActual}%</span>
                            <button 
                              onClick={() => setEditingFactorId(etapa.id)}
                              className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                              title="Editar Factor"
                            >
                              <Pencil size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  }
                />

                <div className="flex flex-col gap-2 pt-1">
                  {puntosDeEtapa.length === 0 ? (
                    <div className="text-xs text-muted italic p-3 text-center border border-border/30 rounded-xl bg-surface-muted/20">
                      Sin puntos de servicio asignados.
                    </div>
                  ) : (
                    puntosDeEtapa.map(punto => (
                      <SelectableCard 
                        key={punto.id}
                        title={punto.nombre}
                        subtitle={`${punto.pax} PAX Asignados`}
                        isActive={puntoActivoId === punto.id}
                        onClick={() => setPuntoActivoId(punto.id)}
                        icon={<Store size={15} className={puntoActivoId === punto.id ? "text-primary" : "text-muted-foreground"} />}
                        action={
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePunto(punto.id);
                            }}
                            className={cn(
                              "p-1.5 rounded-lg transition-all flex items-center justify-center",
                              puntoActivoId === punto.id 
                                ? "text-danger hover:bg-danger/20" 
                                : "text-muted-foreground/40 hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100"
                            )}
                            title="Eliminar Punto"
                          >
                            <Trash2 size={14} />
                          </button>
                        }
                      />
                    ))
                  )}

                  {/* 👈 CORRECCIÓN APLICADA: variant="outline" cambiado a variant="secondary" */}
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    icon={<Plus size={14} />} 
                    className="w-full mt-1 border-dashed border-border/40 bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface-muted/20"
                    onClick={() => handleAddPunto(etapa.id)}
                  >
                    Agregar Punto de Servicio
                  </Button>
                </div>
              </div>
            );
          })}
        </section>

        {/* ========================================== */}
        {/* COLUMNA DERECHA: EDICIÓN DEL PUNTO (DETAIL) */}
        {/* ========================================== */}
        <section className="lg:col-span-8">
          {!puntoActivo ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted p-8 border border-border/30 rounded-xl bg-transparent border-dashed">
              <Store size={32} className="mb-4 opacity-50" />
              <p className="font-medium text-foreground">Distribución de Oferta</p>
              <p className="text-sm mt-1 text-center max-w-sm">Selecciona un punto de servicio en el panel lateral o crea uno nuevo para configurar su menú y proyección.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in pt-1">
              
              {/* FORMULARIO BASE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nombre del Punto</label>
                  <Input 
                    value={puntoActivo.nombre}
                    onChange={(e) => handleUpdatePunto(puntoActivo.id, 'nombre', e.target.value)}
                    placeholder="Ej. Barra Terraza Principal"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PAX Asignado</label>
                  <Input 
                    type="number"
                    value={puntoActivo.pax === 0 ? '' : puntoActivo.pax}
                    onChange={(e) => handleUpdatePunto(puntoActivo.id, 'pax', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Salón(es) Operativo(s)</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {salonesDisponibles.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic mt-2">No hay salones asignados al Spot.</span>
                    ) : (
                      salonesDisponibles.map(salon => {
                        const isSelected = puntoActivo.salon_ids.includes(salon.id);
                        return (
                          <button
                            key={salon.id}
                            onClick={() => toggleSalon(puntoActivo.id, salon.id)}
                            className={cn(
                              "px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                              isSelected
                                ? "bg-primary/10 text-primary border-primary/40 shadow-sm"
                                : "bg-background text-muted-foreground border-border/60 hover:bg-surface-muted hover:border-border"
                            )}
                          >
                            {salon.nombre}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menú Base (Plantilla)</label>
                  <select 
                    className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none"
                    value={puntoActivo.menu_id || ''}
                    onChange={(e) => handleUpdatePunto(puntoActivo.id, 'menu_id', parseInt(e.target.value))}
                  >
                    <option value="" disabled>Seleccionar menú...</option>
                    {mockMenus.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>

              {/* MATRIZ DE PESOS INLINE GLOBAL */}
              {menuDelPunto && (() => {
                const sumaTotal = menuDelPunto.conceptos.reduce((acc, c) => acc + (puntoActivo.pesos_ajustados[c.id] || 0), 0);
                const cuadraSuma = sumaTotal === 100;

                return (
                  <div className="pt-4 mt-6 border-t border-border/20 space-y-4">
                    <div className="overflow-hidden">
                      <Table className="border-none bg-transparent shadow-none">
                        <TableHead>
                          <TableRow className="border-b border-border/40 bg-transparent">
                            <TableHeaderCell>Concepto Comercial</TableHeaderCell>
                            <TableHeaderCell align="center">Unidad</TableHeaderCell>
                            <TableHeaderCell align="right" className="w-[120px]">Preferencia (%)</TableHeaderCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {menuDelPunto.conceptos.map(concepto => (
                            <TableRow key={concepto.id} className="border-b border-border/20 hover:bg-transparent">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {concepto.tipo === 'Cócteles' ? <Martini size={14} className="text-primary/80" /> : <Package size={14} className="text-muted-foreground/80" />}
                                  <span className="font-medium text-sm text-foreground">{concepto.nombre}</span>
                                </div>
                              </TableCell>
                              <TableCell align="center" className="font-mono text-xs text-muted uppercase">
                                {concepto.unidad}/PAX
                              </TableCell>
                              <TableCell align="right">
                                <Input 
                                  type="number"
                                  className="h-8 w-20 text-right font-mono text-sm inline-block shadow-none"
                                  value={puntoActivo.pesos_ajustados[concepto.id] === 0 ? '' : puntoActivo.pesos_ajustados[concepto.id]}
                                  onChange={(e) => handleUpdatePeso(puntoActivo.id, concepto.id, parseFloat(e.target.value) || 0)}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                          {/* FILA DE SUMATORIA GLOBAL */}
                          <TableRow className={cn("transition-colors font-mono font-bold", cuadraSuma ? "bg-success/5" : "bg-danger/5")}>
                            <TableCell colSpan={2} align="right" className={cn("text-xs uppercase", cuadraSuma ? "text-success" : "text-danger")}>
                              {cuadraSuma ? 'Suma Total Cuadrada' : 'Descuadre en Menú'}
                            </TableCell>
                            <TableCell align="right" className={cn("text-sm", cuadraSuma ? "text-success" : "text-danger")}>
                              {sumaTotal}%
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}