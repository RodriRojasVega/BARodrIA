// src/modules/eventos/hooks/useEventos.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Evento, ClienteEmpresa } from '@/types';
import { mockEventosLista } from '../data/eventoMock';

export interface EventoConRelaciones extends Evento {
  mandante?: ClienteEmpresa;
  cliente_final?: ClienteEmpresa;
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
          cliente_final:clientes_empresas!cliente_final_id(id, nombre, tipo, contacto_nombre, telefono, email)
        `)
        .order('fecha_evento', { ascending: true });

      if (err) {
        console.warn('⚠️ Error en Supabase. Activando Fallback a Mocks:', err.message);
        // Si falla la BD, devolvemos los datos mock para no dejar la UI vacía
        return mockEventosLista as EventoConRelaciones[];
      }

      // PATRÓN DE FALLBACK: Si la tabla está vacía, usamos los mocks
      if (!data || data.length === 0) {
        console.warn('⚠️ Tabla de eventos vacía en Supabase. Mostrando Mock Data.');
        return mockEventosLista as EventoConRelaciones[];
      }

      return (data as unknown) as EventoConRelaciones[];
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