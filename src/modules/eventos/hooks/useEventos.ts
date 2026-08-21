// src/modules/eventos/hooks/useEventos.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Evento, ClienteEmpresa } from '@/types';

export interface EventoConRelaciones extends Evento {
  mandante?: ClienteEmpresa;
  cliente_final?: ClienteEmpresa;
}

export function useEventos() {
  const [eventos, setEventos] = useState<EventoConRelaciones[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('eventos')
        .select(`
          *,
          mandante:mandante_id(id, nombre, tipo, contacto_nombre, telefono, email),
          cliente_final:cliente_final_id(id, nombre, tipo, contacto_nombre, telefono, email)
        `)
        .order('fecha_evento', { ascending: true });

      if (err) throw err;
      setEventos((data as any) || []);
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido al cargar eventos';
      setError(mensaje);
      console.error('Error fetching eventos:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  return {
    eventos,
    cargando,
    error,
    recargarEventos: fetchEventos
  };
}