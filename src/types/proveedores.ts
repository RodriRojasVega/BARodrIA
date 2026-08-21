// src/types/proveedores.ts

export interface ProveedorInsumo {
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
  insumos: ProveedorInsumo[];
}

export interface ProveedorPrecioHistorico {
  id: number;
  insumo_id: number;
  proveedor_id: number | null;
  precio_compra: number;
  costo_unitario: number;
  created_at: string;
  insumo_nombre?: string; // Propiedad calculada para la vista
}