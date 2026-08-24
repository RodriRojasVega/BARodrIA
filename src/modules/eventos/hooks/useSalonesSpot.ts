// src/modules/eventos/hooks/useSalonesSpot.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useSalonesSpot(spotId: number | null | undefined) {
  return useQuery({
    queryKey: ['salones_spot', spotId],
    queryFn: async () => {
      if (!spotId) return [];
      const { data, error } = await supabase
        .from('salones_espacios')
        .select('id, nombre')
        .eq('spot_id', spotId);

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!spotId, // Solo se ejecuta si hay un spot seleccionado
  });
}