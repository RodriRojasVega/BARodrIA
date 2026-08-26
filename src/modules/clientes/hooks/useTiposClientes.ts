// src/modules/clientes/hooks/useTiposClientes.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { TipoCliente } from '@/types/clientes';

export function useTiposClientes() {
  return useQuery({
    queryKey: ['tipos_clientes_maestro'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_clientes')
        .select('*')
        .order('nombre');

      if (error) {
        throw new Error(error.message);
      }

      return data as TipoCliente[];
    },
  });
}