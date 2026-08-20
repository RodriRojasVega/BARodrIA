// src/types/proveedores.ts

export interface InsumoGlobal {
  id: number;
  nombre: string;
  unidad_medida: string;
  formato_envase: number;
  precio_compra: number;
  rendimiento_neto_porcentaje: number;
  es_artesanal: boolean;
}

export interface InsumoProveedorRel {
  insumo_id: number;
  proveedor_id: number;
  precio_oferta: number | null;
}

export interface Proveedor {
  id: number;
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  observaciones: string | null;
  insumos: InsumoProveedorRel[];
}

export interface PrecioHistorico {
  id: number;
  insumo_id: number;
  proveedor_id: number | null;
  precio_compra: number;
  costo_unitario: number;
  created_at: string;
  insumo_nombre?: string; // Propiedad calculada para la vista
}