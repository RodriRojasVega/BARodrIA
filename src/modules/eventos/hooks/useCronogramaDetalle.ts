// src/modules/eventos/hooks/useCronogramaDetalle.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useCronogramaDetalle(eventoId: number | null) {
  const {
    data,
    isLoading: cargando,
    error,
    refetch: recargarCronograma,
  } = useQuery({
    queryKey: ['cronograma_detalle', eventoId],
    queryFn: async () => {
      if (!eventoId) return { actividades: [], etapas: [] };

      // 1. Consultar actividades del evento
      const { data: actividades, error: errAct } = await supabase
        .from('evento_actividades_cronograma')
        .select('*')
        .eq('evento_id', eventoId)
        .order('orden', { ascending: true });

      if (errAct) throw new Error(errAct.message);

      // 2. Consultar etapas y sus salones asociados (evento_etapa_salones -> salones_espacios)
      const { data: etapas, error: errEtapas } = await supabase
        .from('evento_etapas')
        .select(`
          *,
          evento_etapa_salones (
            salon_id,
            salones_espacios (
              id,
              nombre
            )
          )
        `)
        .eq('evento_id', eventoId)
        .order('orden', { ascending: true });

      if (errEtapas) throw new Error(errEtapas.message);

      return {
        actividades: actividades || [],
        etapas: etapas || [],
      };
    },
    enabled: !!eventoId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    actividades: data?.actividades || [],
    etapas: data?.etapas || [],
    cargando,
    error: error instanceof Error ? error.message : null,
    recargarCronograma,
  };
}