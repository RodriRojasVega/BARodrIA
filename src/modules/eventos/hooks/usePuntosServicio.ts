// src/modules/eventos/hooks/usePuntosServicio.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface PuntoServicio {
  id: number;
  punto_servicio_id?: number;
  evento_etapa_salon_id?: number; 
  etapa_id: number;
  nombre: string;
  pax_asignado: number | null; // Actualizado a pax_asignado para calzar con la UI y BD
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

      if (!data || data.length === 0) {
        return [];
      }

      // Mapeo tipado estrictamente sin usar 'any'
      const mapeoPuntos: PuntoServicio[] = data.map((item) => ({
        id: item.id,
        etapa_id: item.etapa_id,
        nombre: item.nombre,
        pax_asignado: item.pax_asignado,
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