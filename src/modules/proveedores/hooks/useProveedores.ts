// src/modules/proveedores/hooks/useProveedores.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { calcularCostoUnitarioInsumo } from '@/lib/calculos';
import type { Proveedor, ProveedorPrecioHistorico } from '@/types/proveedores';
import type { Insumo as InsumoGlobal } from '@/types/insumos';

export function useProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [insumosGlobales, setInsumosGlobales] = useState<InsumoGlobal[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [pData, iData, relData] = await Promise.all([
        supabase.from('proveedores').select('*').order('nombre'),
        supabase.from('insumos').select('*').order('nombre'),
        supabase.from('insumo_proveedores').select('*')
      ]);

      // Solo guardamos insumos comerciales (no artesanales)
      const insumosComerciales = ((iData.data || []) as InsumoGlobal[]).filter(i => !i.es_artesanal);
      setInsumosGlobales(insumosComerciales);

      const relsTipadas = (relData.data || []) as any[];
      const provMapeados: Proveedor[] = (pData.data || []).map((prov: any) => {
        const misInsumos = relsTipadas
          .filter(r => r.proveedor_id === prov.id)
          .map(r => ({
            insumo_id: Number(r.insumo_id),
            proveedor_id: Number(r.proveedor_id),
            precio_oferta: r.precio_oferta !== null ? Number(r.precio_oferta) : null
          }));
        return { ...prov, insumos: misInsumos };
      });

      setProveedores(provMapeados);
    } catch (e) {
      console.error("Error al cargar datos de proveedores:", e);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const guardarProveedor = async (
    payload: any,
    insumosTempo: { insumo_id: number; precio_oferta: number }[],
    isEdicion: boolean,
    idEdicion?: string
  ): Promise<{ success: boolean; provActualizado?: Proveedor }> => {
    setGuardando(true);
    try {
      let provIdReal: number;

      // 1. Guardar o actualizar proveedor
      if (isEdicion && idEdicion) {
        provIdReal = parseInt(idEdicion);
        const { error } = await supabase.from('proveedores').update(payload).eq('id', provIdReal);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('proveedores').insert([payload] as any).select().single();
        if (error) throw error;
        provIdReal = Number(data.id);
      }

      // 2. Obtener relaciones antiguas para saber si cambió el precio (Histórico)
      const { data: relsAnteriores } = await supabase.from('insumo_proveedores').select('*').eq('proveedor_id', provIdReal);
      const mapaViejos = new Map((relsAnteriores || []).map((r: any) => [Number(r.insumo_id), r.precio_oferta !== null ? Number(r.precio_oferta) : null]));

      // 3. Limpiar e Insertar nuevo catálogo de ofertas
      await supabase.from('insumo_proveedores').delete().eq('proveedor_id', provIdReal);
      
      if (insumosTempo.length > 0) {
        const arrInsert = insumosTempo.map(i => ({
          proveedor_id: provIdReal,
          insumo_id: i.insumo_id,
          precio_oferta: i.precio_oferta
        }));
        await supabase.from('insumo_proveedores').insert(arrInsert as any);
      }

      // 4. Auditoría de Histórico
      let registrosHist: any[] = [];
      insumosTempo.forEach(i => {
        const viejoPrecio = mapaViejos.get(i.insumo_id);
        if (viejoPrecio !== i.precio_oferta) {
          const insObj = insumosGlobales.find(x => x.id === i.insumo_id);
          const formato = insObj ? parseFloat(insObj.formato_envase.toString()) || 1 : 1;
          const rend = insObj && insObj.rendimiento_neto_porcentaje ? parseFloat(insObj.rendimiento_neto_porcentaje.toString()) || 1 : 1;
          
          const costoBase = calcularCostoUnitarioInsumo(i.precio_oferta, formato);
          const nuevoCosto = costoBase / (rend > 0 ? rend : 1);
          
          registrosHist.push({ 
            insumo_id: i.insumo_id, 
            proveedor_id: provIdReal, 
            precio_compra: i.precio_oferta, 
            costo_unitario: nuevoCosto 
          });
        }
      });

      if (registrosHist.length > 0) {
        await supabase.from('insumo_precios_historicos').insert(registrosHist as any);
      }

      // 5. Recargar y devolver objeto actualizado
      await cargarDatos();
      const provRecuperado = { ...payload, id: provIdReal, insumos: insumosTempo };
      
      return { success: true, provActualizado: provRecuperado as Proveedor };
    } catch (err) {
      console.error("Error guardando proveedor:", err);
      return { success: false };
    } finally {
      setGuardando(false);
    }
  };

  const eliminarProveedor = async (id: number) => {
    const { error } = await supabase.from('proveedores').delete().eq('id', id);
    if (!error) await cargarDatos();
    return !error;
  };

  const obtenerHistoricoProv = async (id: number): Promise<ProveedorPrecioHistorico[]> => {
    const { data } = await supabase
      .from('insumo_precios_historicos')
      .select('*')
      .eq('proveedor_id', id)
      .order('created_at', { ascending: false });
    
    const mapeado = (data || []).map((h: any) => {
      const ins = insumosGlobales.find(i => i.id === h.insumo_id);
      return { ...h, insumo_nombre: ins ? ins.nombre : 'Insumo Eliminado' };
    });

    return mapeado as ProveedorPrecioHistorico[];
  };

  return {
    proveedores,
    insumosGlobales,
    cargando,
    guardando,
    guardarProveedor,
    eliminarProveedor,
    obtenerHistoricoProv
  };
}