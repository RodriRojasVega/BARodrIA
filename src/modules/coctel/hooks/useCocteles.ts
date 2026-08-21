// src/modules/coctel/hooks/useCocteles.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Coctel } from '@/types/coctel';
import type { Insumo } from '@/types/insumos';

export interface CatalogItem {
  id: number;
  nombre: string;
  [key: string]: string | number | boolean | null;
}

export interface CatalogosState {
  categorias: CatalogItem[];
  familias: CatalogItem[];
  soportes: CatalogItem[];
  hielos: CatalogItem[];
  tecnicas: CatalogItem[];
}

export interface CoctelIngredientePayload {
  insumo_id: number;
  cantidad: number;
  unidad_medida: string;
}

export interface CoctelPasoPayload {
  descripcion: string;
  es_critico?: boolean;
}

export function useCocteles() {
  const [cocteles, setCocteles] = useState<Coctel[]>([]);
  const [insumosGlobales, setInsumosGlobales] = useState<Insumo[]>([]);
  const [catalogos, setCatalogos] = useState<CatalogosState>({
    categorias: [],
    familias: [],
    soportes: [],
    hielos: [],
    tecnicas: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const cargarMaestros = useCallback(async () => {
    setIsLoading(true);
    try {
      const [insRes, coctelRes, catRes, famRes, sopRes, hieRes, tecRes] = await Promise.all([
        supabase.from('insumos').select('*'),
        supabase.from('cocteles').select('*').order('nombre'),
        supabase.from('categorias').select('*'),
        supabase.from('familias').select('*'),
        supabase.from('soportes').select('*'),
        supabase.from('hielos').select('*'),
        supabase.from('tecnicas').select('*')
      ]);

      setInsumosGlobales((insRes.data as Insumo[]) || []);
      setCocteles((coctelRes.data as Coctel[]) || []);
      setCatalogos({
        categorias: (catRes.data as CatalogItem[]) || [],
        familias: (famRes.data as CatalogItem[]) || [],
        soportes: (sopRes.data as CatalogItem[]) || [],
        hielos: (hieRes.data as CatalogItem[]) || [],
        tecnicas: (tecRes.data as CatalogItem[]) || []
      });
    } catch (error: unknown) {
      console.error("Error al cargar maestros de cócteles:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const eliminarCoctel = async (id: number): Promise<void> => {
    try {
      await supabase.from('coctel_ingredientes').delete().eq('coctel_id', id);
      await supabase.from('coctel_pasos_preparacion').delete().eq('coctel_id', id);
      const { error } = await supabase.from('cocteles').delete().eq('id', id);
      if (error) throw error;
      await cargarMaestros();
    } catch (error: unknown) {
      const err = error as Error;
      throw new Error(`Error al eliminar: ${err.message}`);
    }
  };

  const guardarCoctel = async (
    coctelId: number | undefined, 
    formData: Partial<Coctel>, 
    ingredientes: CoctelIngredientePayload[], 
    pasos: CoctelPasoPayload[]
  ): Promise<Coctel> => {
    try {
      let coctelGuardado: Coctel;

      // 1. Persistencia Principal
      if (coctelId) {
        const { data, error } = await supabase.from('cocteles').update(formData).eq('id', coctelId).select().single();
        if (error) throw error;
        coctelGuardado = data as Coctel;
      } else {
        const { data, error } = await supabase.from('cocteles').insert([formData]).select().single();
        if (error) throw error;
        coctelGuardado = data as Coctel;
      }

      // 2. Sincronizar BOM (Ingredientes)
      await supabase.from('coctel_ingredientes').delete().eq('coctel_id', coctelGuardado.id);
      if (ingredientes.length > 0) {
        const { error: errIng } = await supabase.from('coctel_ingredientes').insert(ingredientes.map(i => ({
          coctel_id: coctelGuardado.id, 
          insumo_id: i.insumo_id, 
          cantidad: i.cantidad, 
          unidad_medida: i.unidad_medida
        })));
        if (errIng) throw errIng;
      }

      // 3. Sincronizar Pasos
      await supabase.from('coctel_pasos_preparacion').delete().eq('coctel_id', coctelGuardado.id);
      if (pasos.length > 0) {
        const { error: errPasos } = await supabase.from('coctel_pasos_preparacion').insert(pasos.map((p, idx) => ({
          coctel_id: coctelGuardado.id, 
          numero_paso: idx + 1, 
          descripcion: p.descripcion, 
          es_critico: p.es_critico || false
        })));
        if (errPasos) throw errPasos;
      }

      await cargarMaestros();
      return coctelGuardado;
    } catch (error: unknown) {
      throw error;
    }
  };

  useEffect(() => { 
    cargarMaestros(); 
  }, [cargarMaestros]);

  return { 
    cocteles, 
    insumosGlobales, 
    catalogos, 
    isLoading, 
    eliminarCoctel, 
    guardarCoctel, 
    cargarMaestros 
  };
}