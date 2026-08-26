// src/modules/clientes/hooks/useClienteMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ClienteFormData } from '../types';

export function useClienteMutations() {
  const queryClient = useQueryClient();

  const crearCliente = useMutation({
    mutationFn: async (formData: ClienteFormData) => {
      const { spot_ids, ...clienteData } = formData;

      // 1. Insertar el registro principal del cliente
      const { data: nuevoCliente, error: errCliente } = await supabase
        .from('clientes_empresas')
        .insert([clienteData])
        .select()
        .single();

      if (errCliente) throw new Error(`Error al crear cliente: ${errCliente.message}`);

      // 2. Insertar relaciones en la tabla intermedia cliente_spots
      if (spot_ids && spot_ids.length > 0) {
        const payloadSpots = spot_ids.map(sId => ({
          cliente_id: nuevoCliente.id,
          spot_id: sId,
        }));

        const { error: errSpots } = await supabase
          .from('cliente_spots')
          .insert(payloadSpots);

        if (errSpots) throw new Error(`Error al asociar spots: ${errSpots.message}`);
      }

      return nuevoCliente;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes_maestro'] });
    },
  });

  const actualizarCliente = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ClienteFormData }) => {
      const { spot_ids, ...clienteData } = data;

      // 1. Actualizar datos base del cliente
      const { data: clienteActualizado, error: errCliente } = await supabase
        .from('clientes_empresas')
        .update(clienteData)
        .eq('id', id)
        .select()
        .single();

      if (errCliente) throw new Error(`Error al actualizar cliente: ${errCliente.message}`);

      // 2. Sincronizar Spots (Eliminar previos e insertar la nueva selección)
      const { error: errDelete } = await supabase
        .from('cliente_spots')
        .delete()
        .eq('cliente_id', id);

      if (errDelete) throw new Error(`Error al limpiar spots previos: ${errDelete.message}`);

      if (spot_ids && spot_ids.length > 0) {
        const payloadSpots = spot_ids.map(sId => ({
          cliente_id: id,
          spot_id: sId,
        }));

        const { error: errSpots } = await supabase
          .from('cliente_spots')
          .insert(payloadSpots);

        if (errSpots) throw new Error(`Error al actualizar spots asociados: ${errSpots.message}`);
      }

      return clienteActualizado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes_maestro'] });
    },
  });

  const eliminarCliente = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('clientes_empresas')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes_maestro'] });
    },
  });

  return { crearCliente, actualizarCliente, eliminarCliente };
}