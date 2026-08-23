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
  tipo_evento: number | null; // ID numérico de la FK
  estado: number;             // ID numérico de la FK
  // Relaciones de catálogos y entidades
  mandante?: ClienteEmpresa;
  cliente_final?: ClienteEmpresa;
  tipo_evento_info?: { id: number; slug: string; nombre: string };
  estado_info?: { id: number; slug: string; nombre: string };
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
      const { data, error: err } = await supabase
        .from('eventos')
        .select(`
          *,
          mandante:clientes_empresas!mandante_id(id, nombre, tipo, contacto_nombre, telefono, email),
          cliente_final:clientes_empresas!cliente_final_id(id, nombre, tipo, contacto_nombre, telefono, email),
          tipo_evento_info:tipos_evento!tipo_evento(id, slug, nombre),
          estado_info:estados_evento!estado(id, slug, nombre)
        `)
        .order('fecha_evento', { ascending: true });

      if (err) {
        console.warn('⚠️ Error en Supabase. Activando Fallback a Mocks:', err.message);
        return mockEventosLista as EventoConRelaciones[];
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ Tabla de eventos vacía en Supabase. Mostrando Mock Data.');
        return mockEventosLista as EventoConRelaciones[];
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