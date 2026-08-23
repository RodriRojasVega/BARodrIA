import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface EventoFormData {
  nombre: string;
  tipo_evento: number | null; 
  total_pax: number;
  staff_proyectado: number;   
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string;
  mandante_id?: number | null;
  cliente_final_id?: number | null;
  observaciones_logistica?: string;
  estado: number;             
  salon_id?: number | null;
  spot_id?: number | null;
}

export function useEventoMutations() {
  const queryClient = useQueryClient();

  const crearEvento = useMutation({
    mutationFn: async (data: EventoFormData) => {
      const slug = data.nombre
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const payload = {
        ...data,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        estado: data.estado || 1, 
      };

      // Tipado estricto directo con el cliente de Supabase tipado por base de datos
      const { data: nuevoEvento, error } = await supabase
        .from('eventos')
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return nuevoEvento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos_b2b'] });
    },
  });

  const actualizarEvento = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EventoFormData> }) => {
      const { data: eventoActualizado, error } = await supabase
        .from('eventos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return eventoActualizado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos_b2b'] });
    },
  });

  const eliminarEvento = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos_b2b'] });
    },
  });

  return {
    crearEvento,
    actualizarEvento,
    eliminarEvento,
  };
}