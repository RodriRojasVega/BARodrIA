// src/modules/eventos/hooks/usePuntosServicio.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Mantenemos la interfaz casi idéntica para no romper la UI, 
// pero internamente reflejará la asignación (relación N:M)
export interface PuntoServicio {
  id: number; // ID de la asignación (único por cada cruce punto-salón)
  punto_servicio_id: number; // El ID físico de la barra
  evento_etapa_salon_id: number;
  nombre: string;
  pax_estimado_asignado: number | null;
  estado: string | null;
  ubicacion?: string;
}

// Mocks actualizados a la nueva estructura lógica
const mockPuntosServicio: PuntoServicio[] = [
  { 
    id: 101, // ID de asignación
    punto_servicio_id: 1, // Barra Central física
    evento_etapa_salon_id: 1, 
    nombre: 'Barra Central / VIP (Salón A)', 
    pax_estimado_asignado: 2500, 
    estado: 'activo', 
    ubicacion: 'Salón Principal A' 
  },
  { 
    id: 102, 
    punto_servicio_id: 1, // ¡La MISMA Barra Central física!
    evento_etapa_salon_id: 2, 
    nombre: 'Barra Central / VIP (Salón B)', 
    pax_estimado_asignado: 500, 
    estado: 'activo', 
    ubicacion: 'Salón Principal B' 
  },
  { 
    id: 103, 
    punto_servicio_id: 2, 
    evento_etapa_salon_id: 3, 
    nombre: 'Barra Terraza / Exterior', 
    pax_estimado_asignado: 1000, 
    estado: 'activo', 
    ubicacion: 'Terraza Jardín' 
  },
];

export function usePuntosServicio(eventoId: number | null) {
  const {
    data: puntos = mockPuntosServicio,
    isLoading: cargando,
    error,
    refetch: recargarPuntos,
  } = useQuery({
    queryKey: ['puntos_servicio_asignados', eventoId],
    queryFn: async () => {
      if (!eventoId) return mockPuntosServicio;

      // Consulta relacional a través de la NUEVA tabla puente:
      // punto_servicio_asignaciones -> puntos_servicio + evento_etapa_salones -> evento_etapas
      const { data, error: err } = await supabase
        .from('punto_servicio_asignaciones')
        .select(`
          id,
          pax_estimado_asignado,
          evento_etapa_salon_id,
          punto_servicio_id,
          puntos_servicio (
            nombre,
            estado
          ),
          evento_etapa_salones!inner (
            salon_id,
            evento_etapas!inner (
              evento_id
            )
          )
        `)
        .eq('evento_etapa_salones.evento_etapas.evento_id', eventoId);

      if (err) {
        console.warn('⚠️ Error al consultar asignaciones de puntos en Supabase. Usando Mocks:', err.message);
        return mockPuntosServicio;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No se encontraron puntos asignados para este evento. Usando Mocks.');
        return mockPuntosServicio;
      }

      // Aplanamos la respuesta para que la UI la consuma fácilmente
      const mapeoPuntos: PuntoServicio[] = data.map((item: any) => ({
        id: item.id, // Usamos el ID de la asignación para iterar en la UI
        punto_servicio_id: item.punto_servicio_id,
        evento_etapa_salon_id: item.evento_etapa_salon_id,
        nombre: item.puntos_servicio?.nombre || 'Barra sin nombre',
        pax_estimado_asignado: item.pax_estimado_asignado,
        estado: item.puntos_servicio?.estado || 'activo',
        ubicacion: 'Espacio Dinámico' // Podríamos hacer un join con salones_espacios después
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