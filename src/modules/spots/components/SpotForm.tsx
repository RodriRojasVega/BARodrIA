// src/modules/spots/components/SpotForm.tsx
import { useState } from 'react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, Save, MapPin, Edit2, Check } from 'lucide-react';
import { useSpotMutations } from '../hooks/useSpotMutations';
import type { SpotFormData, SalonFormData } from '../types';
import type { Spot, TipoSpot } from '@/types/spots';

interface SpotFormProps {
  spot: Spot | null;
  onBack: () => void;
  onSaved: (spotId?: number) => void; // 👈 Actualizado para recibir el ID opcional
}

export function SpotForm({ spot, onBack, onSaved }: SpotFormProps) {
  const { crearSpot, actualizarSpot, eliminarSpot } = useSpotMutations();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<SpotFormData>(() => {
    if (spot) {
      return {
        nombre: spot.nombre,
        tipo: spot.tipo,
        direccion: spot.direccion,
        ciudad: spot.ciudad,
        salones: spot.salones_espacios ? spot.salones_espacios.map(s => ({
          id: s.id, nombre: s.nombre, ubicacion_referencia: s.ubicacion_referencia, capacidad_maxima_pax: s.capacidad_maxima_pax,
        })) : []
      };
    }
    return { nombre: '', tipo: 'centro_eventos', direccion: '', ciudad: 'Santiago', salones: [] };
  });

  const handleAddSalon = () => {
    const nuevoSalon: SalonFormData = { id: `temp_${Date.now()}`, nombre: '', ubicacion_referencia: '', capacidad_maxima_pax: 0 };
    setFormData(prev => {
      const nuevosSalones = [...prev.salones, nuevoSalon];
      setEditingIndex(nuevosSalones.length - 1);
      return { ...prev, salones: nuevosSalones };
    });
  };

  const handleUpdateSalon = (index: number, field: keyof SalonFormData, value: string | number | null) => {
    const nuevosSalones = [...formData.salones];
    nuevosSalones[index] = { ...nuevosSalones[index], [field]: value } as SalonFormData;
    setFormData(prev => ({ ...prev, salones: nuevosSalones }));
  };

  const handleRemoveSalon = (index: number) => {
    setFormData(prev => ({ ...prev, salones: prev.salones.filter((_, i) => i !== index) }));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleGuardar = async () => {
    setEditingIndex(null);
    try {
      let spotGuardadoId = spot?.id;

      if (spot) {
        const updated = await actualizarSpot.mutateAsync({ id: spot.id, data: formData });
        spotGuardadoId = updated.id;
      } else {
        const nuevo = await crearSpot.mutateAsync(formData);
        spotGuardadoId = nuevo.id;
      }

      // 👈 Devolvemos el ID al componente padre para mantener la vista en este spot
      onSaved(spotGuardadoId);
    } catch (error) {
      console.error("Error al guardar", error);
    }
  };

  const handleDelete = async () => {
    if (spot) {
      try {
        await eliminarSpot.mutateAsync(spot.id);
        onSaved(); // Retorna a la lista tras eliminar
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    }
  };

  const isCargando = crearSpot.isPending || actualizarSpot.isPending || eliminarSpot.isPending;

  return (
    <div className="flex flex-col h-full space-y-6 pb-10">
      <ModuleHeader
        title={spot ? "Editar Locación" : "Nueva Locación"}
        icon={<MapPin size={20} className="text-primary" />}
        backAction={onBack}
        backOnRight={true}
        primaryAction={
          <div className="flex items-center gap-2">
            {spot && (
              <Button variant="danger" size="sm" icon={<Trash2 size={16} />} onClick={handleDelete} disabled={isCargando} title="Eliminar Locación" />
            )}
            <Button variant="primary" size="sm" icon={<Save size={16} />} onClick={handleGuardar} disabled={isCargando || !formData.nombre.trim()} title="Guardar Cambios" />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div className="lg:col-span-4 space-y-5 bg-surface/50 border border-border/40 rounded-2xl p-5">
          <div className="space-y-4">
            <Input label="Nombre del Spot" value={formData.nombre} onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))} placeholder="Ej. Espacio Riesco" />
            <Select label="Tipo" value={formData.tipo || ''} onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as TipoSpot }))}>
              <option value="centro_eventos">Centro de Eventos</option>
              <option value="hotel">Hotel</option>
              <option value="casino">Casino</option>
              <option value="centro_convenciones">Centro de Convenciones</option>
              <option value="otro">Otro</option>
            </Select>
            <Input label="Ciudad" value={formData.ciudad || ''} onChange={(e) => setFormData(prev => ({ ...prev, ciudad: e.target.value }))} placeholder="Santiago" />
            <Input label="Dirección" value={formData.direccion || ''} onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))} placeholder="Av. Principal 123" />
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {formData.salones.map((salon, index) => {
              if (editingIndex === index) {
                return (
                  <div key={salon.id} className="p-4 border border-primary/50 bg-primary/5 rounded-2xl space-y-3 shadow-lg shadow-primary/5 animate-fade-in text-left">
                    <Input label="Nombre del Salón" value={salon.nombre} onChange={(e) => handleUpdateSalon(index, 'nombre', e.target.value)} placeholder="Ej. Plenario" />
                    <Input label="Aforo (PAX)" type="number" value={salon.capacidad_maxima_pax === null ? '' : salon.capacidad_maxima_pax} onChange={(e) => handleUpdateSalon(index, 'capacidad_maxima_pax', parseInt(e.target.value) || null)} />
                    <Input label="Ubic. Ref." value={salon.ubicacion_referencia || ''} onChange={(e) => handleUpdateSalon(index, 'ubicacion_referencia', e.target.value)} placeholder="Piso 2" />
                    <div className="flex justify-end gap-2 pt-2 border-t border-primary/10 mt-2">
                      <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => handleRemoveSalon(index)} />
                      <Button size="sm" variant="primary" icon={<Check size={14} />} onClick={() => setEditingIndex(null)} />
                    </div>
                  </div>
                );
              }

              return (
                <div key={salon.id} className="relative p-4 border border-border/50 rounded-2xl bg-surface-muted/10 group hover:border-primary/30 transition-all text-left">
                  <h4 className="font-bold text-foreground text-sm truncate pr-8">{salon.nombre || 'Nuevo Salón'}</h4>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-xs font-mono text-primary font-bold">{salon.capacidad_maxima_pax || 0} PAX</span>
                    {salon.ubicacion_referencia && <span className="text-[10px] text-muted uppercase tracking-wider truncate">{salon.ubicacion_referencia}</span>}
                  </div>
                  
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background/80 rounded-lg p-0.5 backdrop-blur-sm border border-border/50">
                    <button type="button" onClick={() => setEditingIndex(index)} className="p-1.5 text-muted hover:text-primary transition-colors"><Edit2 size={14} /></button>
                    <button type="button" onClick={() => handleRemoveSalon(index)} className="p-1.5 text-danger/60 hover:text-danger transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}

            <button 
              type="button"
              onClick={handleAddSalon} 
              className="flex items-center justify-center h-[120px] border border-dashed border-border/60 rounded-2xl hover:border-primary/50 hover:bg-primary/5 text-muted hover:text-primary transition-all group"
              title="Agregar Salón"
            >
              <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-transform">
                <Plus size={20} /> 
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}