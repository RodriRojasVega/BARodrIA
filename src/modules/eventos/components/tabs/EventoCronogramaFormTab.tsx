// src/modules/eventos/components/tabs/EventoCronogramaFormTab.tsx
import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  Clock, MapPin, Plus, Save, X, ChevronUp, ChevronDown, Trash2, Star, AlertTriangle, Link2, PanelLeftClose, PanelRightClose, PanelLeft, PanelRight, Edit
} from 'lucide-react';

// UI Kit 2.5
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { VerticalTimeline, type VerticalTimelineItem } from '@/components/ui/VerticalTimeline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TimeInput } from '@/components/ui/DateTimeInput';
import { Select } from '@/components/ui/Select';
import { ToggleButton } from '@/components/ui/ToggleButton';
import { IconText } from '@/components/ui/IconText';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';

// Tipos
import type { EventoActividadCronograma, EventoEtapa, ModalidadCalculo } from '@/types/eventos';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface EtapaForm extends Omit<EventoEtapa, 'id'> {
  id: number | string;
  salon_ids: number[];
  actividad_id_temp?: number | string;
}

export interface ActividadForm extends Omit<EventoActividadCronograma, 'id' | 'etapa_id'> {
  id: number | string;
  etapa_id: number | string | null;
}

export interface Salon {
  id: number;
  nombre: string;
}

interface EventoCronogramaFormTabProps {
  actividades: ActividadForm[];
  etapas: EtapaForm[];
  salonesDisponibles: Salon[];
  onChangeActividades: (actividades: ActividadForm[]) => void;
  onChangeEtapas: (etapas: EtapaForm[]) => void;
}

type ViewMode = 'split' | 'actividades' | 'etapas';

export function EventoCronogramaFormTab({
  actividades,
  etapas,
  salonesDisponibles,
  onChangeActividades,
  onChangeEtapas
}: EventoCronogramaFormTabProps) {
  
  const [editingEtapa, setEditingEtapa] = useState<EtapaForm | null>(null);
  const [editingActividad, setEditingActividad] = useState<ActividadForm | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [actToDelete, setActToDelete] = useState<ActividadForm | null>(null);
  
  // Estado para rastrear la selección activa cruzada (Timeline <-> Tabla)
  const [activeFaseOrden, setActiveFaseOrden] = useState<number | null>(null);

  // ==========================================
  // LÓGICA DE ETAPAS
  // ==========================================
  
  const handleAddEtapa = () => {
    const nuevaEtapa: EtapaForm = {
      id: `temp_${Date.now()}`,
      evento_id: 0,
      orden: etapas.length + 1,
      nombre: '',
      hora_inicio: '',
      hora_fin: '',
      modalidad_calculo: 'paquete_fijo',
      pax_etapa: 0,
      regla_consumo: 1,
      salon_ids: [],
      actividad_id_temp: ''
    };
    setEditingEtapa(nuevaEtapa);
    if (viewMode === 'actividades') setViewMode('split');
  };

  const handleEditEtapa = (etapa: EtapaForm) => {
    // Buscamos de forma robusta la actividad vinculada a esta etapa
    const linkedAct = actividades.find(a => String(a.etapa_id) === String(etapa.id));
    setEditingEtapa({ ...etapa, actividad_id_temp: linkedAct ? linkedAct.id : '' });
  };

  const handleSaveEtapa = () => {
    if (!editingEtapa) return;
    
    const existe = etapas.find(e => String(e.id) === String(editingEtapa.id));
    if (existe) {
      onChangeEtapas(etapas.map(e => String(e.id) === String(editingEtapa.id) ? editingEtapa : e));
    } else {
      onChangeEtapas([...etapas, editingEtapa]);
    }

    // Sincronización bidireccional estricta del vínculo Etapa <-> Actividad
    const nuevasActividades = actividades.map(a => {
      // Si esta actividad fue seleccionada en el select temporal de la etapa
      if (editingEtapa.actividad_id_temp && String(a.id) === String(editingEtapa.actividad_id_temp)) {
        return { ...a, etapa_id: editingEtapa.id };
      }
      // Si la actividad estaba vinculada a esta etapa pero ahora se desvinculó en el select
      if (String(a.etapa_id) === String(editingEtapa.id) && String(a.id) !== String(editingEtapa.actividad_id_temp)) {
        return { ...a, etapa_id: null };
      }
      return a;
    });
    
    onChangeActividades(nuevasActividades);
    setEditingEtapa(null);
  };

  const handleDeleteEtapa = (id: number | string) => {
    const filtradas = etapas.filter(e => String(e.id) !== String(id)).map((e, idx) => ({ ...e, orden: idx + 1 }));
    onChangeEtapas(filtradas);
    const actsLiberadas = actividades.map(a => String(a.etapa_id) === String(id) ? { ...a, etapa_id: null } : a);
    onChangeActividades(actsLiberadas);
  };

  const handleMoveEtapa = (index: number, direccion: 'up' | 'down') => {
    if ((direccion === 'up' && index === 0) || (direccion === 'down' && index === etapas.length - 1)) return;
    const nuevasEtapas = [...etapas];
    const targetIndex = direccion === 'up' ? index - 1 : index + 1;
    [nuevasEtapas[index], nuevasEtapas[targetIndex]] = [nuevasEtapas[targetIndex], nuevasEtapas[index]];
    onChangeEtapas(nuevasEtapas.map((e, idx) => ({ ...e, orden: idx + 1 })));
  };

  const toggleSalon = (salonId: number) => {
    if (!editingEtapa) return;
    const ids = editingEtapa.salon_ids.includes(salonId)
      ? editingEtapa.salon_ids.filter(id => id !== salonId)
      : [...editingEtapa.salon_ids, salonId];
    setEditingEtapa({ ...editingEtapa, salon_ids: ids });
  };

  const renderBadgeModalidad = (modalidad: ModalidadCalculo | null) => {
    switch (modalidad) {
      case 'barra_libre': return <Badge variant="info">Barra Libre</Badge>;
      case 'paquete_fijo': return <Badge variant="success">Paquete Fijo</Badge>;
      case 'tickets': return <Badge variant="warning">Tickets</Badge>;
      default: return <Badge variant="default">Estándar</Badge>;
    }
  };

  // ==========================================
  // LÓGICA DE ACTIVIDADES
  // ==========================================

  const handleAddActividad = () => {
    const nuevaActividad: ActividadForm = {
      id: `temp_${Date.now()}`,
      evento_id: 0,
      etapa_id: null,
      orden: actividades.length + 1,
      nombre: '',
      hora_inicio: '',
      hora_fin: '',
      es_hito: false
    };
    setEditingActividad(nuevaActividad);
    if (viewMode === 'etapas') setViewMode('split');
  };

  const handleSaveActividad = () => {
    if (!editingActividad) return;
    const existe = actividades.find(a => String(a.id) === String(editingActividad.id));
    if (existe) {
      onChangeActividades(actividades.map(a => String(a.id) === String(editingActividad.id) ? editingActividad : a));
    } else {
      onChangeActividades([...actividades, editingActividad]);
    }
    setEditingActividad(null);
  };

  const handleConfirmDeleteAct = () => {
    if (!actToDelete) return;
    const id = actToDelete.id;
    const filtradas = actividades.filter(a => String(a.id) !== String(id)).map((a, idx) => ({ ...a, orden: idx + 1 }));
    onChangeActividades(filtradas);
    if (editingActividad && String(editingActividad.id) === String(id)) setEditingActividad(null);
    setActToDelete(null);
  };

  const handleMoveActividad = (id: number | string, direccion: 'up' | 'down') => {
    const index = actividades.findIndex(a => String(a.id) === String(id));
    if (index === -1) return;
    if ((direccion === 'up' && index === 0) || (direccion === 'down' && index === actividades.length - 1)) return;
    
    const nuevas = [...actividades];
    const targetIndex = direccion === 'up' ? index - 1 : index + 1;
    [nuevas[index], nuevas[targetIndex]] = [nuevas[targetIndex], nuevas[index]];
    
    const reordenadas = nuevas.map((a, idx) => ({ ...a, orden: idx + 1 }));
    onChangeActividades(reordenadas);
    
    const updatedEditing = reordenadas.find(a => String(a.id) === String(id));
    if (updatedEditing) setEditingActividad(updatedEditing);
  };

  // Preparamos datos del Timeline
  const timelineData = [...actividades];
  if (editingActividad && !actividades.some(a => String(a.id) === String(editingActividad.id))) {
    timelineData.push(editingActividad);
  }

  const timelineItems: VerticalTimelineItem[] = timelineData.map(a => {
    const etapaVinculada = etapas.find(e => String(e.id) === String(a.etapa_id));
    return {
      id: a.id,
      orden: a.orden,
      nombre: a.nombre,
      hora_inicio: a.hora_inicio,
      hora_fin: a.hora_fin,
      es_hito: a.es_hito,
      faseOrden: etapaVinculada ? etapaVinculada.orden : undefined
    };
  });

  // ==========================================
  // COMPONENTES INLINE (DRY)
  // ==========================================

  const renderFilaEdicionActividad = () => {
    if (!editingActividad) return null;
    return (
      <div className="space-y-3 animate-fade-in p-1">
        <Input 
          label="Nombre del Hito / Actividad" 
          value={editingActividad.nombre}
          onChange={(e) => setEditingActividad({ ...editingActividad, nombre: e.target.value })}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <TimeInput 
            label="Inicio" 
            value={editingActividad.hora_inicio}
            onChange={(e) => setEditingActividad({ ...editingActividad, hora_inicio: e.target.value })}
          />
          <TimeInput 
            label="Fin" 
            value={editingActividad.hora_fin}
            onChange={(e) => setEditingActividad({ ...editingActividad, hora_fin: e.target.value })}
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <ToggleButton 
            isActive={!!editingActividad.es_hito} 
            onClick={() => setEditingActividad({ ...editingActividad, es_hito: !editingActividad.es_hito })}
          >
            <Star size={14} className={editingActividad.es_hito ? 'fill-current' : ''} />
          </ToggleButton>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={<X size={14}/>} onClick={() => setEditingActividad(null)} title="Cancelar" />
            <Button variant="primary" size="sm" icon={<Save size={14}/>} onClick={handleSaveActividad} title="Guardar Actividad" />
          </div>
        </div>
      </div>
    );
  };

  const renderFilaEdicionEtapa = () => {
    if (!editingEtapa) return null;
    return (
      <TableRow key={editingEtapa.id} className="bg-primary/5 border-l-2 border-primary shadow-subtle">
        <TableCell className="align-top">
          <div className="space-y-3">
            <Input 
              label="Nombre de Etapa" 
              value={editingEtapa.nombre} 
              onChange={(e) => setEditingEtapa({ ...editingEtapa, nombre: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <TimeInput 
                label="Inicio" 
                value={editingEtapa.hora_inicio || ''} 
                onChange={(e) => setEditingEtapa({ ...editingEtapa, hora_inicio: e.target.value })}
              />
              <TimeInput 
                label="Fin" 
                value={editingEtapa.hora_fin || ''} 
                onChange={(e) => setEditingEtapa({ ...editingEtapa, hora_fin: e.target.value })}
              />
            </div>
          </div>
        </TableCell>

        <TableCell className="align-top">
          <label className="text-[11px] font-mono font-bold text-muted uppercase tracking-wider mb-2 block">
            Asignar Salones Físicos
          </label>
          <div className="flex flex-wrap gap-2">
            {salonesDisponibles.map(salon => (
              <ToggleButton 
                key={salon.id}
                isActive={editingEtapa.salon_ids.includes(salon.id)}
                onClick={() => toggleSalon(salon.id)}
                className="py-1 px-2 text-[11px] h-auto min-h-0"
              >
                {salon.nombre}
              </ToggleButton>
            ))}
            {salonesDisponibles.length === 0 && (
              <span className="text-xs text-danger/80 flex items-center gap-1 mt-1">
                <AlertTriangle size={12} /> Selecciona un Spot válido.
              </span>
            )}
          </div>
        </TableCell>

        <TableCell className="align-top">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <Select 
              label="Actividad Asociada"
              value={editingEtapa.actividad_id_temp || ''}
              onChange={(e) => setEditingEtapa({ ...editingEtapa, actividad_id_temp: e.target.value })}
            >
              <option value="">-- Ninguna --</option>
              {actividades.map(a => (
                <option key={a.id} value={a.id}>{a.nombre || `Actividad #${a.orden}`}</option>
              ))}
            </Select>

            <Select 
              label="Cálculo"
              value={editingEtapa.modalidad_calculo || 'paquete_fijo'}
              onChange={(e) => setEditingEtapa({ ...editingEtapa, modalidad_calculo: e.target.value as ModalidadCalculo })}
            >
              <option value="paquete_fijo">Paquete Fijo</option>
              <option value="barra_libre">Barra Libre</option>
              <option value="tickets">Tickets</option>
            </Select>
          </div>
        </TableCell>

        <TableCell className="align-top">
          <Input 
            label="Total" 
            type="number" 
            min="0"
            value={editingEtapa.pax_etapa || ''}
            onChange={(e) => setEditingEtapa({ ...editingEtapa, pax_etapa: Number(e.target.value) })}
          />
        </TableCell>

        <TableCell className="align-top" align="center">
          <div className="flex gap-2 mt-4 justify-center">
            <Button variant="ghost" size="sm" icon={<X size={16}/>} onClick={() => setEditingEtapa(null)} title="Cancelar" />
            <Button variant="primary" size="sm" icon={<Save size={16}/>} onClick={handleSaveEtapa} title="Guardar Etapa" />
          </div>
        </TableCell>
      </TableRow>
    );
  };

  // ==========================================
  // RENDERIZADO DEL COMPONENTE
  // ==========================================

  return (
    <div className="w-full animate-fade-in pb-8 pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: TIMELINE DE ACTIVIDADES */}
        <section className={cn(
          "flex flex-col gap-4 transition-all duration-300 ease-in-out", 
          viewMode === 'split' ? "lg:col-span-4 lg:sticky lg:top-4" : viewMode === 'actividades' ? "lg:col-span-12 max-w-3xl mx-auto w-full" : "hidden"
        )}>
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            {viewMode === 'split' && (
              <Button variant="ghost" size="sm" icon={<PanelLeftClose size={16} className="text-muted" />} onClick={() => setViewMode('etapas')} title="Ocultar Línea de Tiempo" />
            )}
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">Hitos y Actividades</h3>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="secondary" size="sm" icon={<Plus size={16} />} onClick={handleAddActividad} title="Añadir Actividad" />
              {viewMode === 'actividades' && (
                <Button variant="ghost" size="sm" icon={<PanelRight size={16} className="text-muted" />} onClick={() => setViewMode('split')} title="Mostrar Etapas" />
              )}
            </div>
          </div>

          {timelineItems.length === 0 ? (
            <EmptyState 
              title="Sin actividades" 
              description="Añade hitos para construir la línea de tiempo." 
              icon={<Clock size={32} />} 
            />
          ) : (
            <VerticalTimeline 
              items={timelineItems} 
              activeItem={editingActividad ? editingActividad.id : null}
              onSelectItem={(ordenOrId) => {
                const act = actividades.find(a => a.id === ordenOrId || a.orden === ordenOrId);
                if (act) {
                  setEditingActividad(act);
                  // Destacamos visualmente la etapa vinculada si la tiene
                  if (act.etapa_id) {
                    const etapaVinculada = etapas.find(e => String(e.id) === String(act.etapa_id));
                    if (etapaVinculada) setActiveFaseOrden(etapaVinculada.orden);
                  }
                }
              }}
              onEdit={(id) => {
                const act = actividades.find(a => String(a.id) === String(id));
                if (act) setEditingActividad(act);
              }}
              onDelete={(id) => {
                const act = actividades.find(a => String(a.id) === String(id));
                if (act) setActToDelete(act);
              }}
              onMoveUp={(id) => handleMoveActividad(id, 'up')}
              onMoveDown={(id) => handleMoveActividad(id, 'down')}
              renderActiveCard={renderFilaEdicionActividad}
            />
          )}
        </section>

        {/* COLUMNA DERECHA: TABLA DE ETAPAS OPERATIVAS */}
        <section className={cn(
          "flex flex-col gap-4 transition-all duration-300 ease-in-out", 
          viewMode === 'split' ? "lg:col-span-8" : viewMode === 'etapas' ? "lg:col-span-12" : "hidden"
        )}>
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            {viewMode === 'etapas' && (
              <Button variant="ghost" size="sm" icon={<PanelLeft size={16} className="text-muted" />} onClick={() => setViewMode('split')} title="Mostrar Línea de Tiempo" />
            )}
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">Etapas Operativas</h3>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="secondary" size="sm" icon={<Plus size={16} />} onClick={handleAddEtapa} title="Añadir Etapa" />
              {viewMode === 'split' && (
                <Button variant="ghost" size="sm" icon={<PanelRightClose size={16} className="text-muted" />} onClick={() => setViewMode('actividades')} title="Ocultar Etapas" />
              )}
            </div>
          </div>

          <div className="w-full overflow-x-auto custom-scrollbar pb-10">
            <Table className="border-none bg-transparent shadow-none min-w-[750px]">
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="w-[25%]">Etapa / Horario</TableHeaderCell>
                  <TableHeaderCell className="w-[25%]">Despliegue</TableHeaderCell>
                  <TableHeaderCell className="w-[25%]">Logística</TableHeaderCell>
                  <TableHeaderCell align="center" className="w-[10%]">PAX</TableHeaderCell>
                  <TableHeaderCell align="center" className="w-[15%]">Acciones</TableHeaderCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {etapas.length === 0 && !editingEtapa && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" className="py-8 text-muted italic text-sm">
                      No hay etapas configuradas.
                    </TableCell>
                  </TableRow>
                )}

                {etapas.map((etapa, index) => {
                  const isEditing = editingEtapa && String(editingEtapa.id) === String(etapa.id);
                  if (isEditing) return renderFilaEdicionEtapa();

                  const linkedAct = actividades.find(a => String(a.etapa_id) === String(etapa.id));
                  const isHighlighted = activeFaseOrden === etapa.orden || (editingActividad && String(editingActividad.etapa_id) === String(etapa.id));

                  return (
                    <TableRow 
                      key={etapa.id} 
                      onClick={() => setActiveFaseOrden(etapa.orden === activeFaseOrden ? null : etapa.orden)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        isHighlighted ? "bg-primary/5 border-l-2 border-primary" : "border-border/40 hover:bg-surface-muted/30"
                      )}
                    >
                      <TableCell>
                        <div className="flex flex-col min-w-[140px]">
                          <span className={cn("font-semibold text-sm", isHighlighted ? "text-primary" : "text-foreground")}>{etapa.nombre}</span>
                          <IconText 
                            icon={<Clock size={12} className={isHighlighted ? "text-primary" : "text-primary/70"} />}
                            text={`${etapa.hora_inicio?.slice(0, 5) || '--:--'} - ${etapa.hora_fin?.slice(0, 5) || '--:--'} hrs`}
                            textClassName="font-mono text-xs text-muted"
                            className="mt-1"
                          />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted mt-1">
                            Fase {etapa.orden}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          {etapa.salon_ids.length > 0 ? (
                            etapa.salon_ids.map(id => {
                              const sInfo = salonesDisponibles.find(s => s.id === id);
                              return (
                                <div key={id} className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-surface-muted/50 border-border/50 w-fit">
                                  <MapPin size={12} className="text-primary/70" />
                                  <span className="font-medium text-foreground text-[11px]">{sInfo?.nombre || 'Salón'}</span>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-xs text-muted italic">Sin salón asignado</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col items-start gap-2">
                          {renderBadgeModalidad(etapa.modalidad_calculo)}
                          {linkedAct && (
                            <div className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 shadow-xs" title="Actividad Asociada">
                              <Link2 size={10} className="shrink-0" />
                              <span className="font-medium truncate max-w-[120px]">{linkedAct.nombre}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell align="center">
                        <span className="font-mono font-bold text-sm text-primary/80">
                          {etapa.pax_etapa?.toLocaleString() || 0}
                        </span>
                      </TableCell>

                      <TableCell align="center">
                        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" icon={<ChevronUp size={16} />} onClick={() => handleMoveEtapa(index, 'up')} disabled={index === 0} title="Mover Arriba" />
                          <Button variant="ghost" size="sm" icon={<ChevronDown size={16} />} onClick={() => handleMoveEtapa(index, 'down')} disabled={index === etapas.length - 1} title="Mover Abajo" />
                          <div className="w-px h-4 bg-border/50 mx-1"></div>
                          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" icon={<Edit size={15} />} onClick={() => handleEditEtapa(etapa)} title="Editar Etapa" />
                          <Button variant="danger" size="sm" icon={<Trash2 size={15} />} onClick={() => handleDeleteEtapa(etapa.id)} title="Eliminar Etapa" />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {editingEtapa && !etapas.some(e => String(e.id) === String(editingEtapa.id)) && renderFilaEdicionEtapa()}
              </TableBody>
            </Table>
          </div>
        </section>

      </div>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE ACTIVIDAD */}
      <Modal isOpen={!!actToDelete} onClose={() => setActToDelete(null)} title="Eliminar Actividad">
        <div className="space-y-4 pt-2">
          <p className="text-sm text-foreground">¿Estás seguro de eliminar el hito/actividad <strong>{actToDelete?.nombre}</strong>?</p>
          <p className="text-xs text-muted">
            Si esta actividad está vinculada a una Etapa Operativa, la asociación será eliminada.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" size="sm" onClick={() => setActToDelete(null)} title="Cancelar" />
            <Button variant="danger" size="sm" onClick={handleConfirmDeleteAct} title="Sí, Eliminar" />
          </div>
        </div>
      </Modal>

    </div>
  );
}