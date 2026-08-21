// src/modules/subrecetas/hooks/useSubRecetas.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { TipoSubReceta, IngredienteBOM, PasoPreparacion } from '@/types/subrecetas';
import type { Insumo } from '@/types/insumos';
import type { SubRecetaItem } from '../components/SubRecetasList';

export function useSubRecetas() {
  const [subRecetas, setSubRecetas] = useState<SubRecetaItem[]>([]);
  const [tipos, setTipos] = useState<TipoSubReceta[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch de datos en paralelo (usamos as any para bypassear tipado estricto temporalmente)
      const [srRes, tiposRes, insRes] = await Promise.all([
        supabase.from('sub_recetas_artesanales').select('*'),
        supabase.from('tipos_sub_recetas' as any).select('*'),
        supabase.from('insumos' as any).select('*')
      ]);

      if (srRes.error) throw srRes.error;

      // 2. Mapeo de SubRecetas para incluir datos calculados si es necesario
      const datos: SubRecetaItem[] = (srRes.data || []).map((sr: any) => ({
        ...sr,
        categoria_nombre: (tiposRes.data as any[])?.find((t: any) => t.id === sr.tipo_id)?.nombre || 'General'
      }));

      setSubRecetas(datos);
      setTipos((tiposRes.data as any) || []);
      setInsumos((insRes.data as any) || []);
    } catch (error) {
      console.error('Error cargando sub-recetas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const obtenerDetallesSubReceta = async (id: number) => {
    const [ings, pasos] = await Promise.all([
      supabase.from('sub_receta_ingredientes' as any).select('*').eq('sub_receta_id', id),
      supabase.from('sub_receta_pasos_preparacion' as any).select('*').eq('sub_receta_id', id).order('numero_paso')
    ]);
    
    return {
      ingredientes: ((ings.data as any) || []) as IngredienteBOM[],
      pasos: ((pasos.data as any) || []) as PasoPreparacion[]
    };
  };

  const guardarSubReceta = async (payload: any, ings: IngredienteBOM[], pasos: PasoPreparacion[]) => {
    try {
      // 1. Upsert de la SubReceta Principal
      const { data: srData, error: srError } = await supabase
        .from('sub_recetas_artesanales')
        .upsert([payload as any])
        .select()
        .single();

      if (srError) throw srError;
      const srId = (srData as any).id;

      // 2. Limpieza y Re-inserción de dependencias (BOM y Pasos)
      await Promise.all([
        supabase.from('sub_receta_ingredientes' as any).delete().eq('sub_receta_id', srId),
        supabase.from('sub_receta_pasos_preparacion' as any).delete().eq('sub_receta_id', srId)
      ]);

      if (ings.length > 0) {
        await supabase.from('sub_receta_ingredientes' as any).insert(
          ings.map(i => ({ ...i, sub_receta_id: srId })) as any
        );
      }

      if (pasos.length > 0) {
        await supabase.from('sub_receta_pasos_preparacion' as any).insert(
          pasos.map((p, idx) => ({ 
            sub_receta_id: srId, 
            numero_paso: idx + 1, 
            descripcion: p.descripcion,
            es_critico: p.es_critico || false 
          })) as any
        );
      }

      await cargarDatos();
      return { success: true };
    } catch (error) {
      console.error('Error guardando:', error);
      return { success: false };
    }
  };

  const eliminarSubReceta = async (id: number) => {
    const { error } = await supabase.from('sub_recetas_artesanales').delete().eq('id', id);
    if (!error) await cargarDatos();
    return !error;
  };

  return {
    subRecetas,
    tipos,
    insumos,
    isLoading,
    guardarSubReceta,
    eliminarSubReceta,
    obtenerDetallesSubReceta
  };
}