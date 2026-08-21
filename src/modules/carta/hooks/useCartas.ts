// src/modules/carta/hooks/useCartas.ts
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Carta } from '@/types/carta';

export interface CoctelCatalogoItem {
  id: number;
  nombre: string;
  precio_venta_sugerido: number;
}

export function useCartas() {
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [coctelesGlobales, setCoctelesGlobales] = useState<CoctelCatalogoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Cargar las Cartas (y revisar si venimos de un "retorno" de navegación cruzada)
  const cargarCartas = useCallback(async (): Promise<Carta | null> => {
    setIsLoading(true);
    let cartaParaRetorno: Carta | null = null;

    try {
      const { data, error } = await supabase
        .from('cartas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const listaCartas = (data as Carta[]) || [];
      setCartas(listaCartas);

      // Evaluación del SPA Hack (Retorno Seguro)
      if (window.navegacionSPA && window.navegacionSPA.retornarACartaId) {
        const encontrada = listaCartas.find(c => c.id === window.navegacionSPA!.retornarACartaId);
        if (encontrada) {
          cartaParaRetorno = encontrada;
        }
        window.navegacionSPA = null; // Limpiamos el boleto de regreso
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error cargando cartas:', err.message);
    } finally {
      setIsLoading(false);
    }
    
    return cartaParaRetorno;
  }, []);

  // 2. Cargar catálogo de cócteles para el DualAsignador
  const cargarCatalogoCocteles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('cocteles')
        .select('id, nombre, precio_venta_sugerido')
        .order('nombre');
      
      if (error) throw error;
      setCoctelesGlobales((data as CoctelCatalogoItem[]) || []);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error cargando catálogo de cócteles:', err.message);
    }
  }, []);

  // 3. Eliminar Carta y sus relaciones
  const eliminarCarta = async (id: number): Promise<void> => {
    try {
      // Por integridad referencial, Supabase (si está configurado con ON DELETE CASCADE) 
      // borrará los hijos, pero lo hacemos explícito por seguridad de la UI.
      await supabase.from('carta_cocteles').delete().eq('carta_id', id);
      const { error } = await supabase.from('cartas').delete().eq('id', id);
      if (error) throw error;
      
      await cargarCartas();
    } catch (error: unknown) {
      const err = error as Error;
      throw new Error(`Error al eliminar: ${err.message}`);
    }
  };

  // 4. Guardar Carta y Sincronizar el "Dual Asignador"
  const guardarCartaMultinivel = async (cartaId: number | undefined, formData: Partial<Carta>, coctelIds: number[]): Promise<Carta> => {
    try {
      let cartaGuardada: Carta;

      // Upsert de la entidad principal
      if (cartaId) {
        const { data, error } = await supabase.from('cartas').update(formData).eq('id', cartaId).select().single();
        if (error) throw error;
        cartaGuardada = data as Carta;
      } else {
        const { data, error } = await supabase.from('cartas').insert([formData]).select().single();
        if (error) throw error;
        cartaGuardada = data as Carta;
      }

      // Sincronizar puente (carta_cocteles)
      await supabase.from('carta_cocteles').delete().eq('carta_id', cartaGuardada.id);
      
      if (coctelIds.length > 0) {
        const relaciones = coctelIds.map((coctelId, idx) => ({
          carta_id: cartaGuardada.id,
          coctel_id: coctelId,
          orden_aparicion: idx + 1
        }));
        const { error: errRel } = await supabase.from('carta_cocteles').insert(relaciones);
        if (errRel) throw errRel;
      }

      await cargarCartas();
      return cartaGuardada;
    } catch (error: unknown) {
      throw error;
    }
  };

  return {
    cartas,
    coctelesGlobales,
    isLoading,
    cargarCartas,
    cargarCatalogoCocteles,
    eliminarCarta,
    guardarCartaMultinivel
  };
}