// src/modules/insumos/hooks/useInsumos.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Proveedor } from '@/types/proveedores';
import type { Insumo, TipoInsumo, InsumoProveedor, InsumoPrecioHistorico } from '@/types/insumos';
import type { Tables } from '@/types/database.types';

export function useInsumos() {
  const queryData = useQuery({
    queryKey: ['insumos_maestro'],
    queryFn: async () => {
      const [resTipos, resProv, resIns, resRels] = await Promise.all([
        supabase.from('tipos_insumos').select('*'),
        supabase.from('proveedores').select('id, nombre').order('nombre', { ascending: true }),
        supabase.from('insumos').select('*').order('nombre', { ascending: true }),
        supabase.from('insumo_proveedores').select('*')
      ]);

      if (resTipos.error) throw new Error(resTipos.error.message);
      if (resProv.error) throw new Error(resProv.error.message);
      if (resIns.error) throw new Error(resIns.error.message);
      if (resRels.error) throw new Error(resRels.error.message);

      const tipos = resTipos.data as TipoInsumo[];
      const provsGlobales = resProv.data as Proveedor[];
      const relsTipadas = resRels.data;
      const insumosData = resIns.data as Tables<'insumos'>[];

      const insumos: Insumo[] = insumosData.map((insumo) => {
        const misProveedores: InsumoProveedor[] = relsTipadas
          .filter(r => r.insumo_id === insumo.id)
          .map(r => {
            const provObj = provsGlobales.find(p => p.id === r.proveedor_id);
            return {
              proveedor_id: Number(r.proveedor_id),
              nombre: provObj ? provObj.nombre : 'Proveedor desconocido',
              precio_oferta: r.precio_oferta !== null ? Number(r.precio_oferta) : null
            };
          });

        return {
          ...insumo,
          proveedores: misProveedores,
          unidad_medida: insumo.unidad_medida as 'ml' | 'g' | 'unit' | 'dash'
        };
      });

      return { insumos, tipos, proveedores: provsGlobales };
    }
  });

  const obtenerHistorico = async (id: number): Promise<InsumoPrecioHistorico[]> => {
    const { data, error } = await supabase
      .from('insumo_precios_historicos')
      .select('*, proveedores(nombre)')
      .eq('insumo_id', id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as unknown as InsumoPrecioHistorico[]) || [];
  };

  return {
    insumos: queryData.data?.insumos || [],
    tipos: queryData.data?.tipos || [],
    proveedores: queryData.data?.proveedores || [],
    cargando: queryData.isLoading,
    error: queryData.error,
    obtenerHistorico
  };
}

