// src/modules/eventos/hooks/usePuntosServicio.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface PuntoServicio {
  id: number;
  punto_servicio_id?: number;
  evento_etapa_salon_id?: number; // Mantenemos compatibilidad de interfaz si la UI lo lee
  etapa_id: number;
  nombre: string;
  pax_estimado_asignado: number | null;
  estado: string | null;
}

export function usePuntosServicio(eventoId: number | null) {
  const {
    data: puntos = [],
    isLoading: cargando,
    error,
    refetch: recargarPuntos,
  } = useQuery({
    queryKey: ['evento_puntos_servicio_real', eventoId],
    queryFn: async () => {
      if (!eventoId) return [];

      // Consultamos directamente la nueva tabla transaccional de puntos del evento
      const { data, error: err } = await supabase
        .from('evento_puntos_servicio')
        .select(`
          id,
          nombre,
          pax_asignado,
          etapa_id,
          menu_id
        `)
        .eq('evento_id', eventoId);

      if (err) {
        console.warn('⚠️ Error al consultar puntos de servicio en Supabase:', err.message);
        return [];
      }

      if (!data || data.length == 0) {
        return [];
      }

      // Mapeamos al formato que espera la UI del cronograma
      const mapeoPuntos: PuntoServicio[] = data.map((item: any) => ({
        id: item.id,
        etapa_id: item.etapa_id,
        nombre: item.nombre,
        pax_estimado_asignado: item.pax_asignado,
        estado: 'activo',
      }));

      return mapeoPuntos;
    },
    enabled: !!eventoId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    puntos,
    cargando,
    error: error instanceof Error ? error.message : null,
    recargarPuntos,
  };
}