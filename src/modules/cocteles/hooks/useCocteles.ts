// src/modules/coctel/hooks/useCocteles.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Coctel } from '@/types/cocteles';
import type { Insumo } from '@/types/insumos';

export interface CatalogItem {
  id: number;
  nombre: string;
  [key: string]: string | number | boolean | null | undefined;
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

      setInsumosGlobales((insRes.data || []) as Insumo[]);
      setCocteles((coctelRes.data || []) as Coctel[]);
      setCatalogos({
        categorias: (catRes.data || []) as CatalogItem[],
        familias: (famRes.data || []) as CatalogItem[],
        soportes: (sopRes.data || []) as CatalogItem[],
        hielos: (hieRes.data || []) as CatalogItem[],
        tecnicas: (tecRes.data || []) as CatalogItem[]
      });
    } catch (error) {
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
      // Manejo seguro del error para evitar la línea roja en el throw de tu captura
      const errMsg = error instanceof Error ? error.message : 'Error desconocido de Supabase';
      throw new Error(`Error al eliminar: ${errMsg}`);
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
        // En update, Supabase acepta Partial nativamente.
        const { data, error } = await supabase
          .from('cocteles')
          .update(formData)
          .eq('id', coctelId)
          .select()
          .single();
          
        if (error) throw error;
        coctelGuardado = data as Coctel;
      } else {
        // En insert, omitimos el ID para que coincida perfecto con el tipo esperado (Insert).
        const { data, error } = await supabase
          .from('cocteles')
          .insert(formData as Omit<Coctel, 'id'>)
          .select()
          .single();
          
        if (error) throw error;
        coctelGuardado = data as Coctel;
      }

      // 2. Sincronizar BOM (Ingredientes)
      await supabase.from('coctel_ingredientes').delete().eq('coctel_id', coctelGuardado.id);
      
      if (ingredientes.length > 0) {
        const payloadIngredientes = ingredientes.map(i => ({
          coctel_id: coctelGuardado.id, 
          insumo_id: i.insumo_id, 
          cantidad: i.cantidad, 
          unidad_medida: i.unidad_medida
        }));
        // Pasamos el array directamente, Supabase lo tipificará bien
        const { error: errIng } = await supabase.from('coctel_ingredientes').insert(payloadIngredientes);
        if (errIng) throw errIng;
      }

      // 3. Sincronizar Pasos
      await supabase.from('coctel_pasos_preparacion').delete().eq('coctel_id', coctelGuardado.id);
      
      if (pasos.length > 0) {
        const payloadPasos = pasos.map((p, idx) => ({
          coctel_id: coctelGuardado.id, 
          numero_paso: idx + 1, 
          descripcion: p.descripcion, 
          es_critico: p.es_critico || false
        }));
        // Pasamos el array directamente
        const { error: errPasos } = await supabase.from('coctel_pasos_preparacion').insert(payloadPasos);
        if (errPasos) throw errPasos;
      }

      await cargarMaestros();
      return coctelGuardado;
    } catch (error) {
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