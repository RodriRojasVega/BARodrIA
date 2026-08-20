// src/types/insumos.ts
export interface TipoInsumo {
  id: number;
  nombre: string;
  slug: string;
}

export interface InsumoProveedorRel {
  proveedor_id: number;
  nombre: string;
  precio_oferta: number | null;
}

export interface Insumo {
  id: number;
  nombre: string;
  slug: string;
  tipo_id: number | null;
  unidad_medida: string;
  formato_envase: number;
  precio_compra: number;
  costo_unitario: number;
  graduacion_alcohol_base: number;
  rendimiento_neto_porcentaje: number;
  es_artesanal: boolean;
  proveedores?: InsumoProveedorRel[];
}

export interface PrecioHistorico {
  id: number;
  insumo_id: number;
  proveedor_id: number | null;
  precio_compra: number;
  costo_unitario: number;
  created_at: string;
  proveedores?: { nombre: string };
}