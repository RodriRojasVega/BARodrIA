// src/types/index.ts

export type UnidadMedida = 'ml' | 'g' | 'unit' | 'dash';

export interface TipoSubReceta {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string | null;
}

export interface SubReceta {
  id: number;
  slug: string;
  nombre: string;
  rendimiento_batch: number;
  unidad_rendimiento: 'ml' | 'g' | 'unit';
  elaboracion_instrucciones: string;
  indicaciones_almacenamiento: string;
  vida_util: string;
  control_mermas_economia_circular: string | null;
  garnish_relacionado_id: number | null;
  insumo_asociado_id: number;
  tipo_id: number;
}

export interface TipoInsumo {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string | null;
}

export interface Insumo {
  id: number;
  slug: string;
  nombre: string;
  unidad_medida: UnidadMedida;
  formato_envase: number;
  precio_compra: number;
  costo_unitario: number;
  graduacion_alcohol_base: number;
  tipo_id: number | null;
  es_artesanal: boolean | null;
  rendimiento_neto_porcentaje: number | null;
}

export interface Proveedor {
  id: number;
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  observaciones: string | null;
}

export interface InsumoProveedor {
  insumo_id: number;
  proveedor_id: number;
  precio_oferta: number | null;
}