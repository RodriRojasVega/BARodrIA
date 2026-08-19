// src/modules/insumos/hooks/useInsumos.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { calcularCostoUnitarioInsumo } from '../../../lib/calculos';
import type { Insumo, TipoInsumo, Proveedor, PrecioHistorico } from '../types';

export function useInsumos() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [tipos, setTipos] = useState<TipoInsumo[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [resTipos, resProv, resIns, resRels] = await Promise.all([
        supabase.from('tipos_insumos').select('*'),
        supabase.from('proveedores').select('id, nombre').order('nombre', { ascending: true }),
        supabase.from('insumos').select('*').order('nombre', { ascending: true }),
        supabase.from('insumo_proveedores').select('*')
      ]);

      const provsGlobales = resProv.data || [];
      setTipos(resTipos.data || []);
      setProveedores(provsGlobales);

      const relsTipadas = (resRels.data || []) as any[];
      const mapeados: Insumo[] = (resIns.data || []).map(insumo => {
        const misProveedores = relsTipadas
          .filter(r => r.insumo_id === insumo.id)
          .map(r => {
            const provObj = provsGlobales.find(p => p.id === r.proveedor_id);
            return {
              proveedor_id: Number(r.proveedor_id),
              nombre: provObj ? provObj.nombre : 'Proveedor desconocido',
              precio_oferta: r.precio_oferta !== null ? Number(r.precio_oferta) : null
            };
          });
        return { ...insumo, proveedores: misProveedores };
      });

      setInsumos(mapeados);
    } catch (e) {
      console.error("Error cargando datos de insumos:", e);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const guardarInsumo = async (
    payload: any, 
    proveedoresAsociados: Map<number, number | null>, 
    isEdicion: boolean, 
    idEdicion?: string
  ): Promise<{ success: boolean; insumoActualizado?: Insumo }> => {
    setGuardando(true);
    try {
      const formato = parseFloat(payload.formato_envase) || 1;
      const precio = parseFloat(payload.precio_compra) || 0;
      const rendimientoPct = parseFloat(payload.rendimiento_neto_porcentaje) || 100;
      
      const costoBase = calcularCostoUnitarioInsumo(precio, formato);
      const rendimiento = (rendimientoPct || 100) / 100;
      const costoCalc = costoBase / (rendimiento > 0 ? rendimiento : 1);

      let slugBase = payload.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").trim().replace(/\s+/g, '-');
      if (!slugBase) slugBase = 'insumo';

      const dataToSave = {
        nombre: payload.nombre,
        slug: slugBase,
        tipo_id: payload.tipo_id ? parseInt(payload.tipo_id) : null,
        unidad_medida: payload.unidad_medida,
        formato_envase: formato,
        precio_compra: precio,
        costo_unitario: costoCalc,
        graduacion_alcohol_base: parseFloat(payload.graduacion_alcohol_base) || 0,
        rendimiento_neto_porcentaje: rendimientoPct / 100,
        es_artesanal: payload.es_artesanal
      };

      let insumoIdReal: number;

      if (isEdicion && idEdicion) {
        insumoIdReal = parseInt(idEdicion);
        const { error } = await supabase.from('insumos').update(dataToSave).eq('id', insumoIdReal);
        if (error) throw error;
        await supabase.from('insumo_proveedores').delete().eq('insumo_id', insumoIdReal);
      } else {
        const { data, error } = await supabase.from('insumos').insert([dataToSave]).select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("No se obtuvo ID.");
        insumoIdReal = Number(data[0].id);
      }

      let registrosHistoricos: Omit<PrecioHistorico, 'id' | 'created_at' | 'proveedores'>[] = [{
        insumo_id: insumoIdReal,
        proveedor_id: null,
        precio_compra: precio,
        costo_unitario: costoCalc
      }];

      if (!payload.es_artesanal && proveedoresAsociados.size > 0) {
        const nuevasRels = Array.from(proveedoresAsociados.entries()).map(([provId, oferta]) => ({
          insumo_id: insumoIdReal,
          proveedor_id: provId,
          precio_oferta: oferta !== null && !isNaN(oferta) ? oferta : null
        }));

        await supabase.from('insumo_proveedores').insert(nuevasRels);

        nuevasRels.forEach(r => {
          if (r.precio_oferta !== null && r.precio_oferta > 0) {
            const costoProvBase = calcularCostoUnitarioInsumo(r.precio_oferta, formato);
            registrosHistoricos.push({
              insumo_id: insumoIdReal,
              proveedor_id: Number(r.proveedor_id),
              precio_compra: r.precio_oferta,
              costo_unitario: costoProvBase / (rendimiento > 0 ? rendimiento : 1)
            });
          }
        });
      }

      await supabase.from('insumo_precios_historicos').insert(registrosHistoricos);
      await cargarDatos(); // Recargar lista general oculta

      // Recuperar el actualizado para la vista de detalle
      const { data: insumoRecuperado } = await supabase.from('insumos').select('*').eq('id', insumoIdReal).single();
      const { data: relsProv } = await supabase.from('insumo_proveedores').select('*').eq('insumo_id', insumoIdReal);
      const misProv = (relsProv || []).map((r: any) => {
        const pObj = proveedores.find(p => p.id === r.proveedor_id);
        return {
          proveedor_id: Number(r.proveedor_id),
          nombre: pObj ? pObj.nombre : 'Proveedor desconocido',
          precio_oferta: r.precio_oferta !== null ? Number(r.precio_oferta) : null
        };
      });

      return { success: true, insumoActualizado: { ...insumoRecuperado, proveedores: misProv } as Insumo };
    } catch (err) {
      console.error(err);
      return { success: false };
    } finally {
      setGuardando(false);
    }
  };

  const eliminarInsumo = async (id: number) => {
    const { error } = await supabase.from('insumos').delete().eq('id', id);
    if (!error) await cargarDatos();
    return !error;
  };

  const obtenerHistorico = async (id: number): Promise<PrecioHistorico[]> => {
    const { data } = await supabase
      .from('insumo_precios_historicos')
      .select('*, proveedores(nombre)')
      .eq('insumo_id', id)
      .order('created_at', { ascending: false });
    return data || [];
  };

  return {
    insumos,
    tipos,
    proveedores,
    cargando,
    guardando,
    guardarInsumo,
    eliminarInsumo,
    obtenerHistorico
  };
}