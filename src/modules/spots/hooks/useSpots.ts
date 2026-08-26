// src/modules/spots/hooks/useSpots.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Spot } from '@/types/spots';

export function useSpots() {
  return useQuery({
    queryKey: ['spots_maestro'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spots')
        .select(`
          *,
          salones_espacios (*)
        `)
        .order('nombre');

      if (error) {
        throw new Error(error.message);
      }
      
      // Casteo explícito a nuestra interfaz estricta (Cero `any`)
      return data as Spot[];
    },
  });
}