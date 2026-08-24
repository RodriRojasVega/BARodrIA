// src/modules/eventos/hooks/useCronogramaDetalle.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useCronogramaDetalle(eventoId: number) {
  const { data, isLoading: cargando, refetch } = useQuery({
    queryKey: ['cronograma_detalle', eventoId],
    queryFn: async () => {
      if (!eventoId) return { actividades: [], etapas: [] };

      // 1. Consultar las etapas y los nombres de sus salones asignados
      const { data: etapasData, error: errEtapas } = await supabase
        .from('evento_etapas')
        .select(`
          *,
          evento_etapa_salones (
            salon_id,
            salones_espacios ( nombre )
          )
        `)
        .eq('evento_id', eventoId)
        .order('orden', { ascending: true });

      if (errEtapas) console.error('Error cargando etapas:', errEtapas);

      // 2. Consultar las actividades vinculadas al nuevo modelo
      const { data: actData, error: errAct } = await supabase
        .from('evento_actividades_cronograma')
        .select('*')
        .eq('evento_id', eventoId)
        .order('orden', { ascending: true });

      if (errAct) console.error('Error cargando actividades:', errAct);

      return {
        etapas: etapasData || [],
        actividades: actData || []
      };
    },
    enabled: !!eventoId,
  });

  return {
    actividades: data?.actividades || [],
    etapas: data?.etapas || [],
    cargando,
    refetch
  };
}