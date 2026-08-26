// src/modules/spots/hooks/useSpotMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { SpotFormData } from '../types';

export function useSpotMutations() {
  const queryClient = useQueryClient();

  const crearSpot = useMutation({
    mutationFn: async (formData: SpotFormData) => {
      const { salones, ...spotData } = formData;

      // 1. Insertar el Spot Maestro
      const { data: nuevoSpot, error: errSpot } = await supabase
        .from('spots')
        .insert([{
          ...spotData,
          ciudad: spotData.ciudad || 'Santiago'
        }])
        .select()
        .single();

      if (errSpot) throw new Error(`Error al crear spot: ${errSpot.message}`);

      // 2. Insertar los Salones asociados
      if (salones && salones.length > 0) {
        const salonesPayload = salones.map(s => ({
          spot_id: nuevoSpot.id,
          nombre: s.nombre,
          ubicacion_referencia: s.ubicacion_referencia || null,
          capacidad_maxima_pax: s.capacidad_maxima_pax || null,
        }));

        const { error: errSalones } = await supabase
          .from('salones_espacios')
          .insert(salonesPayload);

        if (errSalones) throw new Error(`Error al crear salones: ${errSalones.message}`);
      }

      return nuevoSpot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots_maestro'] });
    },
  });

  const actualizarSpot = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SpotFormData }) => {
      const { salones, ...spotData } = data;

      // 1. Actualizar datos base del Spot
      const { data: spotActualizado, error: errSpot } = await supabase
        .from('spots')
        .update({
          ...spotData,
          ciudad: spotData.ciudad || 'Santiago'
        })
        .eq('id', id)
        .select()
        .single();

      if (errSpot) throw new Error(`Error al actualizar spot: ${errSpot.message}`);

      // 2. Sincronización de Salones
      const { data: salonesActuales, error: errFetch } = await supabase
        .from('salones_espacios')
        .select('id')
        .eq('spot_id', id);
        
      if (errFetch) throw new Error(errFetch.message);

      // Identificar qué salones se mantienen y cuáles se borraron en la UI
      const idsNuevos = salones.map(s => s.id).filter(id => typeof id === 'number') as number[];
      const idsActuales = salonesActuales?.map(s => s.id) || [];
      const idsAEliminar = idsActuales.filter(id => !idsNuevos.includes(id));

      // Eliminar salones que ya no están en el formulario
      if (idsAEliminar.length > 0) {
        await supabase.from('salones_espacios').delete().in('id', idsAEliminar);
      }

      // Upsert: Insertar nuevos o actualizar existentes
      for (const salon of salones) {
        const payload = {
          spot_id: id,
          nombre: salon.nombre,
          ubicacion_referencia: salon.ubicacion_referencia || null,
          capacidad_maxima_pax: salon.capacidad_maxima_pax || null,
        };

        if (typeof salon.id === 'number') {
          await supabase.from('salones_espacios').update(payload).eq('id', salon.id);
        } else {
          await supabase.from('salones_espacios').insert([payload]);
        }
      }

      return spotActualizado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots_maestro'] });
    },
  });

  const eliminarSpot = useMutation({
    mutationFn: async (id: number) => {
      // Nota: Si en BD configuraste ON DELETE CASCADE, esto borrará sus salones automáticamente.
      // Si no, fallará por constraint, lo cual es deseable como protección de datos.
      const { error } = await supabase.from('spots').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots_maestro'] });
    },
  });

  return { crearSpot, actualizarSpot, eliminarSpot };
}