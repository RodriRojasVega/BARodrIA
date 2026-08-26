// src/modules/eventos/hooks/useEventos.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ClienteEmpresa } from '@/types';
import { mockEventosLista } from '../data/eventoMock';

export interface EventoConRelaciones {
  id: number;
  slug: string;
  nombre: string;
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string;
  total_pax: number;
  staff_proyectado: number;
  observaciones_logistica?: string;
  mandante_id?: number | null;
  cliente_final_id?: number | null;
  salon_id?: number | null;
  spot_id?: number | null;
  tipo_evento_id: number | null; // Actualizado a tipo_evento_id
  estado_id: number;            // Actualizado a estado_id
  
  mandante?: ClienteEmpresa;
  cliente_final?: ClienteEmpresa;
  spot?: { id: number; nombre: string }; 
  tipos_evento?: { id: number; slug: string; nombre: string }; // Actualizado al nombre real del Join
  estados_evento?: { id: number; slug: string; nombre: string }; // Actualizado al nombre real del Join
  etapas?: { 
    id: number; 
    orden: number; 
    nombre: string; 
    evento_etapa_salones?: { salon_id: number; salones_espacios?: { nombre: string } }[] 
  }[];
}

export function useEventos() {
  const {
    data: eventos = [], 
    isLoading: cargando,
    error,
    refetch: recargarEventos,
  } = useQuery({
    queryKey: ['eventos_b2b'],
    queryFn: async () => {
      // Ajustamos la consulta con las FKs e identificadores correctos
      const { data, error: err } = await supabase
        .from('eventos')
        .select(`
          *,
          mandante:clientes_empresas!mandante_id(id, nombre, tipo_id, contacto_nombre, telefono, email, tipos_clientes(*)),
          cliente_final:clientes_empresas!cliente_final_id(id, nombre, tipo_id, contacto_nombre, telefono, email, tipos_clientes(*)),
          spot:spots!spot_id(id, nombre),
          tipos_evento:tipos_evento!tipo_evento_id(id, slug, nombre),
          estados_evento:estados_evento!estado_id(id, slug, nombre)
        `)
        .order('fecha_evento', { ascending: true });

      if (err) {
        console.warn('⚠️ Error en Supabase. Activando Fallback a Mocks:', err.message);
        return mockEventosLista as unknown as EventoConRelaciones[];
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ Tabla de eventos vacía en Supabase. Mostrando Mock Data.');
        return mockEventosLista as unknown as EventoConRelaciones[];
      }

      return data as unknown as EventoConRelaciones[];
    },
    staleTime: 1000 * 60 * 5, 
  });

  return {
    eventos,
    cargando,
    error: error instanceof Error ? error.message : null, 
    recargarEventos,
  };
}