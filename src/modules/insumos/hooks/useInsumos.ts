// src/modules/insumos/hooks/useInsumos.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { calcularCostoUnitarioInsumo } from '@/lib/calculos';
import type { Proveedor } from '../types/proveedor';
import type { Insumo, TipoInsumo, PrecioHistorico } from '@/types/insumos';


interface InsumoPayload {
  nombre: string;
  tipo_id?: number | string | null;
  unidad_medida: string;
  formato_envase: number | string;
  precio_compra: number | string;
  graduacion_alcohol_base?: number | string;
  rendimiento_neto_porcentaje?: number | string;
  es_artesanal: boolean;
}

interface InsumoRelRow {
  insumo_id: number;
  proveedor_id: number;
  precio_oferta: number | null;
}

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

      const relsTipadas = (resRels.data || []) as InsumoRelRow[];
      const mapeados: Insumo[] = (resIns.data || []).map((insumo: any) => {
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
    payload: InsumoPayload, 
    proveedoresAsociados: Map<number, number | null>, 
    isEdicion: boolean, 
    idEdicion?: string
  ): Promise<{ success: boolean; insumoActualizado?: Insumo }> => {
    setGuardando(true);
    try {
      const formato = parseFloat(String(payload.formato_envase)) || 1;
      const precio = parseFloat(String(payload.precio_compra)) || 0;
      const rendimientoPct = parseFloat(String(payload.rendimiento_neto_porcentaje ?? 100)) || 100;
      
      const costoBase = calcularCostoUnitarioInsumo(precio, formato);
      const rendimiento = (rendimientoPct || 100) / 100;
      const costoCalc = costoBase / (rendimiento > 0 ? rendimiento : 1);

      let slugBase = payload.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").trim().replace(/\s+/g, '-');
      if (!slugBase) slugBase = 'insumo';

      const dataToSave = {
        nombre: payload.nombre,
        slug: slugBase,
        tipo_id: payload.tipo_id ? parseInt(String(payload.tipo_id)) : null,
        unidad_medida: payload.unidad_medida,
        formato_envase: formato,
        precio_compra: precio,
        costo_unitario: costoCalc,
        graduacion_alcohol_base: parseFloat(String(payload.graduacion_alcohol_base || 0)),
        rendimiento_neto_porcentaje: rendimientoPct / 100,
        es_artesanal: payload.es_artesanal
      };

      let insumoIdReal: number;
      let precioAnterior = -1;
      const preciosProveedoresAnteriores = new Map<number, number | null>();

      if (isEdicion && idEdicion) {
        insumoIdReal = parseInt(idEdicion);

        // 1. Consultar estado ANTERIOR en la BD para hacer un "diff" inteligente
        const { data: insumoActual } = await supabase.from('insumos').select('precio_compra').eq('id', insumoIdReal).single();
        if (insumoActual) precioAnterior = Number(insumoActual.precio_compra);

        const { data: relsActuales } = await supabase.from('insumo_proveedores').select('proveedor_id, precio_oferta').eq('insumo_id', insumoIdReal);
        relsActuales?.forEach((r: any) => {
          preciosProveedoresAnteriores.set(Number(r.proveedor_id), r.precio_oferta !== null ? Number(r.precio_oferta) : null);
        });

        // 2. Actualizar Insumo y limpiar relaciones viejas
        const { error } = await supabase.from('insumos').update(dataToSave).eq('id', insumoIdReal);
        if (error) throw error;
        await supabase.from('insumo_proveedores').delete().eq('insumo_id', insumoIdReal);
      } else {
        const { data, error } = await supabase.from('insumos').insert([dataToSave]).select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("No se obtuvo ID.");
        insumoIdReal = Number(data[0].id);
      }

      const registrosHistoricos: Array<{
        insumo_id: number;
        proveedor_id: number | null;
        precio_compra: number;
        costo_unitario: number;
      }> = [];

      // 3. Validar si el precio base cambió (o si es nuevo) para registrar historia
      if (!isEdicion || precio !== precioAnterior) {
        registrosHistoricos.push({
          insumo_id: insumoIdReal,
          proveedor_id: null,
          precio_compra: precio,
          costo_unitario: costoCalc
        });
      }

      if (!payload.es_artesanal && proveedoresAsociados.size > 0) {
        const nuevasRels = Array.from(proveedoresAsociados.entries()).map(([provId, oferta]) => ({
          insumo_id: insumoIdReal,
          proveedor_id: provId,
          precio_oferta: oferta !== null && !isNaN(oferta) ? oferta : null
        }));

        await supabase.from('insumo_proveedores').insert(nuevasRels);

        // 4. Validar si el precio de oferta del proveedor cambió o es nuevo para registrar historia
        nuevasRels.forEach(r => {
          if (r.precio_oferta !== null && r.precio_oferta > 0) {
            const proveedorIdNum = Number(r.proveedor_id);
            const precioPrevio = preciosProveedoresAnteriores.get(proveedorIdNum);

            // Si es un proveedor nuevo o su precio oferta cambió
            if (!isEdicion || !preciosProveedoresAnteriores.has(proveedorIdNum) || precioPrevio !== r.precio_oferta) {
              const costoProvBase = calcularCostoUnitarioInsumo(r.precio_oferta, formato);
              registrosHistoricos.push({
                insumo_id: insumoIdReal,
                proveedor_id: proveedorIdNum,
                precio_compra: r.precio_oferta,
                costo_unitario: costoProvBase / (rendimiento > 0 ? rendimiento : 1)
              });
            }
          }
        });
      }

      // 5. Solo insertamos en el histórico si realmente hay cambios detectados
      if (registrosHistoricos.length > 0) {
        await supabase.from('insumo_precios_historicos').insert(registrosHistoricos);
      }

      await cargarDatos();

      const { data: insumoRecuperado } = await supabase.from('insumos').select('*').eq('id', insumoIdReal).single();
      const { data: relsProv } = await supabase.from('insumo_proveedores').select('*').eq('insumo_id', insumoIdReal);
      const misProv = (relsProv || []).map((r: InsumoRelRow) => {
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