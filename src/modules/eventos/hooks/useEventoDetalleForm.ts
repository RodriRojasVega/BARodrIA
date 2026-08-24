// src/modules/eventos/hooks/useEventoDetalleForm.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useEventoDetalleForm(eventoId: number | null | undefined, isEditMode: boolean) {
  return useQuery({
    queryKey: ['evento_detalle_form', eventoId],
    queryFn: async () => {
      if (!isEditMode || !eventoId) return null;

      // 1. Cargar Etapas y sus Salones
      const { data: etapasData } = await supabase
        .from('evento_etapas')
        .select(`
          id, orden, nombre, hora_inicio, hora_fin, modalidad_calculo, pax_etapa, regla_consumo,
          evento_etapa_salones ( salon_id )
        `)
        .eq('evento_id', eventoId)
        .order('orden', { ascending: true });

      // 2. Cargar Actividades del Cronograma
      const { data: actData } = await supabase
        .from('evento_actividades_cronograma')
        .select('id, etapa_id, orden, nombre, hora_inicio, hora_fin, es_hito')
        .eq('evento_id', eventoId)
        .order('orden', { ascending: true });

      // 3. Cargar Puntos de Servicio, Salones y Pesos
      const { data: puntosData } = await supabase
        .from('evento_puntos_servicio')
        .select(`
          id, etapa_id, nombre, pax_asignado, menu_id,
          evento_punto_salones ( salon_id ),
          evento_punto_conceptos ( concepto_id, peso_ajustado )
        `)
        .eq('evento_id', eventoId);

      return {
        etapas: etapasData || [],
        actividades: actData || [],
        puntos: puntosData || [],
      };
    },
    enabled: isEditMode && !!eventoId,
    staleTime: 0, // Siempre fresco al entrar a editar
  });
}