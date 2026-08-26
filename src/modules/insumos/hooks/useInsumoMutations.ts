// src/modules/insumos/hooks/useInsumoMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { calcularCostoUnitarioInsumo } from '@/lib/calculos';
import type { TablesInsert } from '@/types/database.types';
import type { InsumoPayload } from '../components/InsumosForm';

interface GuardarInsumoParams {
  payload: InsumoPayload;
  proveedoresAsociados: Map<number, number | null>;
  isEdicion: boolean;
  idEdicion?: string;
}

export function useInsumoMutations() {
  const queryClient = useQueryClient();

  const guardarInsumo = useMutation({
    mutationFn: async ({ payload, proveedoresAsociados, isEdicion, idEdicion }: GuardarInsumoParams) => {
      const formato = parseFloat(String(payload.formato_envase)) || 1;
      const precio = parseFloat(String(payload.precio_compra)) || 0;
      const rendimientoPct = parseFloat(String(payload.rendimiento_neto_porcentaje ?? 100)) || 100;

      const costoBase = calcularCostoUnitarioInsumo(precio, formato);
      const rendimiento = (rendimientoPct || 100) / 100;
      const costoCalc = costoBase / (rendimiento > 0 ? rendimiento : 1);

      const slugCalculado = payload.nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const dataToSave: TablesInsert<'insumos'> = {
        nombre: payload.nombre,
        slug: slugCalculado,
        tipo_id: payload.tipo_id ? Number(payload.tipo_id) : null,
        unidad_medida: payload.unidad_medida,
        formato_envase: formato,
        precio_compra: precio,
        costo_unitario: costoCalc,
        graduacion_alcohol_base: parseFloat(String(payload.graduacion_alcohol_base)) || 0,
        rendimiento_neto_porcentaje: rendimiento,
        es_artesanal: payload.es_artesanal,
      };

      let insumoIdReal: number;
      let precioAnterior: number | null = null;
      const preciosProveedoresAnteriores = new Map<number, number | null>();

      if (isEdicion && idEdicion) {
        insumoIdReal = parseInt(idEdicion, 10);

        const { data: insumoActual } = await supabase
          .from('insumos')
          .select('precio_compra')
          .eq('id', insumoIdReal)
          .single();
        if (insumoActual) precioAnterior = Number(insumoActual.precio_compra);

        const { data: relsActuales } = await supabase
          .from('insumo_proveedores')
          .select('proveedor_id, precio_oferta')
          .eq('insumo_id', insumoIdReal);

        relsActuales?.forEach((r) => {
          preciosProveedoresAnteriores.set(
            Number(r.proveedor_id),
            r.precio_oferta !== null ? Number(r.precio_oferta) : null
          );
        });

        const { error: updateError } = await supabase.from('insumos').update(dataToSave).eq('id', insumoIdReal);
        if (updateError) throw new Error(updateError.message);

        const { error: deleteRelError } = await supabase.from('insumo_proveedores').delete().eq('insumo_id', insumoIdReal);
        if (deleteRelError) throw new Error(deleteRelError.message);
      } else {
        const { data, error } = await supabase.from('insumos').insert([dataToSave]).select().single();
        if (error) throw new Error(error.message);
        insumoIdReal = Number(data.id);
      }

      const registrosHistoricos: TablesInsert<'insumo_precios_historicos'>[] = [];

      if (!isEdicion || precio !== precioAnterior) {
        registrosHistoricos.push({ insumo_id: insumoIdReal, proveedor_id: null, precio_compra: precio, costo_unitario: costoCalc });
      }

      if (!payload.es_artesanal && proveedoresAsociados.size > 0) {
        const nuevasRels: TablesInsert<'insumo_proveedores'>[] = Array.from(
          proveedoresAsociados.entries()
        ).map(([provId, oferta]) => ({
          insumo_id: insumoIdReal,
          proveedor_id: provId,
          precio_oferta: oferta !== null && !isNaN(oferta) ? oferta : null,
        }));

        const { error: relInsertError } = await supabase.from('insumo_proveedores').insert(nuevasRels);
        if (relInsertError) throw new Error(relInsertError.message);

        nuevasRels.forEach((r) => {
          if (r.precio_oferta != null && r.precio_oferta > 0) {
            const proveedorIdNum = Number(r.proveedor_id);
            const precioPrevio = preciosProveedoresAnteriores.get(proveedorIdNum);

            if (!isEdicion || !preciosProveedoresAnteriores.has(proveedorIdNum) || precioPrevio !== r.precio_oferta) {
              const costoProvBase = calcularCostoUnitarioInsumo(r.precio_oferta, formato);
              registrosHistoricos.push({
                insumo_id: insumoIdReal,
                proveedor_id: proveedorIdNum,
                precio_compra: r.precio_oferta,
                costo_unitario: costoProvBase / (rendimiento > 0 ? rendimiento : 1),
              });
            }
          }
        });
      }

      if (registrosHistoricos.length > 0) {
        const { error: histError } = await supabase.from('insumo_precios_historicos').insert(registrosHistoricos);
        if (histError) throw new Error(histError.message);
      }

      return insumoIdReal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos_maestro'] });
      queryClient.invalidateQueries({ queryKey: ['insumos_historicos'] });
    },
  });

  const eliminarInsumo = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('insumos').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos_maestro'] });
    },
  });

  return { guardarInsumo, eliminarInsumo };
}
