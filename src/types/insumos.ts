// src/types/insumos.ts

export type UnidadMedida = 'ml' | 'g' | 'unit' | 'dash';

export interface TipoInsumo {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string | null;
}

export interface InsumoProveedor {
  proveedor_id: number;
  nombre: string;
  precio_oferta: number | null;
}

export interface Insumo {
  id: number;
  nombre: string;
  slug: string;
  tipo_id: number | null;
  unidad_medida: UnidadMedida;
  formato_envase: number;
  precio_compra: number;
  costo_unitario: number;
  graduacion_alcohol_base: number;
  rendimiento_neto_porcentaje: number | null; // Corregido a nullable
  es_artesanal: boolean | null;              // Corregido a nullable
  proveedores?: InsumoProveedor[];
}

export interface InsumoPrecioHistorico {
  id: number;
  insumo_id: number;
  proveedor_id: number | null;
  precio_compra: number;
  costo_unitario: number;
  created_at: string;
  proveedores?: { nombre: string };
}

// Alias para evitar errores de exportación en otros módulos
export type InsumoGlobal = Insumo;