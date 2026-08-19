import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { SubReceta, TipoSubReceta } from '@/types/subrecetas';
import type { SubRecetaViewItem } from '../components/SubRecetasListView';
import { calcularCostoLoteBOM, calcularCostoSubReceta } from '@/lib/calculos';

export function useSubRecetas() {
  const [subRecetas, setSubRecetas] = useState<SubRecetaViewItem[]>([]);
  const [tipos, setTipos] = useState<TipoSubReceta[]>([]);
  const [insumos, setInsumos] = useState<any[]>([]); // Exportaremos esto al Formulario
  const [bomGlobal, setBomGlobal] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cargarMaestros = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        { data: sData }, { data: iData }, { data: tData }, { data: bomData }
      ] = await Promise.all([
        supabase.from('sub_recetas_artesanales').select('*').order('nombre'),
        supabase.from('insumos').select('*'),
        supabase.from('tipos_sub_recetas').select('*'),
        supabase.from('sub_receta_ingredientes').select('*')
      ]);

      setTipos(tData || []);
      setInsumos(iData || []);
      setBomGlobal(bomData || []);

      const subRecetasProcesadas = (sData || []).map(sub => {
        const ingredientesBOM = (bomData || []).filter(bom => bom.sub_receta_id === sub.id);
        const costoLote = calcularCostoLoteBOM(ingredientesBOM, iData || []);
        const costoUnitario = calcularCostoSubReceta(costoLote, sub.rendimiento_batch);
        const tipoObj = (tData || []).find(t => t.id === sub.tipo_id);

        return {
          ...sub,
          categoria_nombre: tipoObj?.nombre,
          costo_lote_clp: costoLote,
          costo_unitario_clp: costoUnitario
        };
      });

      setSubRecetas(subRecetasProcesadas);
    } catch (error) {
      console.error("Error al cargar maestros:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para obtener detalles al hacer click en "Ver" o "Editar"
  const obtenerDetallesSubReceta = async (id: number) => {
    const { data: pasos } = await supabase.from('sub_receta_pasos_preparacion').select('*').eq('sub_receta_id', id).order('numero_paso');
    const bom = bomGlobal.filter(b => b.sub_receta_id === id);
    return { pasos: pasos || [], ingredientes: bom };
  };

  const guardarSubReceta = async (payload: any, ingredientes: any[], pasos: any[]) => {
    try {
      let subReal;
      // SOLUCIÓN AL CREAR: Si no hay ID, Supabase hará el INSERT limpiamente
      if (payload.id) {
        const { data, error } = await supabase.from('sub_recetas_artesanales').update(payload).eq('id', payload.id).select().single();
        if (error) throw error;
        subReal = data;
      } else {
        const { data, error } = await supabase.from('sub_recetas_artesanales').insert([payload]).select().single();
        if (error) throw error;
        subReal = data;
      }

      // Guardar BOM
      await supabase.from('sub_receta_ingredientes').delete().eq('sub_receta_id', subReal.id);
      if (ingredientes.length > 0) {
        await supabase.from('sub_receta_ingredientes').insert(
          ingredientes.map(i => ({ sub_receta_id: subReal.id, insumo_id: i.insumo_id, cantidad: i.cantidad, unidad_medida: i.unidad_medida }))
        );
      }

      // Guardar Pasos
      await supabase.from('sub_receta_pasos_preparacion').delete().eq('sub_receta_id', subReal.id);
      const pasosLimpios = pasos.filter(p => p.descripcion.trim() !== '');
      if (pasosLimpios.length > 0) {
        await supabase.from('sub_receta_pasos_preparacion').insert(
          pasosLimpios.map((p, idx) => ({ sub_receta_id: subReal.id, numero_paso: idx + 1, descripcion: p.descripcion, es_critico: false }))
        );
      }

      // Actualizar costo del insumo espejo
      if (payload.insumo_asociado_id) {
        const { data: iData } = await supabase.from('insumos').select('*');
        const costoLoteTotal = calcularCostoLoteBOM(ingredientes, iData || []);
        const nuevoCosto = payload.rendimiento_batch > 0 ? (costoLoteTotal / payload.rendimiento_batch) : 0;
        await supabase.from('insumos').update({ costo_unitario: nuevoCosto }).eq('id', payload.insumo_asociado_id);
      }

      await cargarMaestros();
      return true;
    } catch (error) {
      console.error("Error guardando:", error);
      throw error;
    }
  };

  const eliminarSubReceta = async (id: number) => {
    // Borrar dependencias primero (Foreign Keys)
    await supabase.from('sub_receta_ingredientes').delete().eq('sub_receta_id', id);
    await supabase.from('sub_receta_pasos_preparacion').delete().eq('sub_receta_id', id);
    await supabase.from('sub_recetas_artesanales').delete().eq('id', id);
    await cargarMaestros();
  };

  useEffect(() => { cargarMaestros(); }, [cargarMaestros]);

  return { subRecetas, tipos, insumos, isLoading, guardarSubReceta, eliminarSubReceta, obtenerDetallesSubReceta };
}