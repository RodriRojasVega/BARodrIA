export interface Coctel {
  id: number;
  slug: string;
  nombre: string;
  coctel_base_id?: number | null;
  categoria_id: number;
  familia_id: number;
  soporte_id: number;
  hielo_id: number;
  tecnica_id: number;
  reseña_inspiracion?: string | null;
  reseña_vista?: string | null;
  reseña_nariz?: string | null;
  reseña_boca?: string | null;
  maridaje_propuesta?: string | null;
  maridaje_justificacion?: string | null;
  maridaje_alternativa?: string | null;
  tips?: string | null;
  grado_alcohol: number;
  porcentaje_azucar: number;
  costo_produccion: number;
  precio_venta_sugerido: number;
}