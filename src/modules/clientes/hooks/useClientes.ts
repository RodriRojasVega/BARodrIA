// src/modules/clientes/hooks/useClientes.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ClienteEmpresa } from '@/types/clientes';

export function useClientes() {
  return useQuery({
    queryKey: ['clientes_maestro'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes_empresas')
        .select(`
          *,
          tipos_clientes (*),
          cliente_spots (
            spot_id,
            spots (*)
          )
        `)
        .order('nombre');

      if (error) {
        throw new Error(error.message);
      }

      return data as ClienteEmpresa[];
    },
  });
}