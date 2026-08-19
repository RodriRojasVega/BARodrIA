// src/types/subrecetas.ts

export interface TipoSubReceta {
  id: number;
  nombre: string;
}

export interface InsumoGlobal {
  id: number;
  nombre: string;
  unidad_medida: string;
  formato_envase: number;
  costo_unitario: number;
  es_artesanal: boolean;
}

export interface IngredienteBOM {
  insumo_id: number;
  cantidad: number;
  unidad_medida: string;
}

export interface PasoPreparacion {
  descripcion: string;
}

export interface SubReceta {
  id: number;
  slug: string;
  nombre: string;
  rendimiento_batch: number;
  unidad_rendimiento: 'ml' | 'g' | 'unit'; // Según tu CHECK constraint
  elaboracion_instrucciones: string;
  indicaciones_almacenamiento: string;
  vida_util: string;
  control_mermas_economia_circular: string | null; // Puede ser nulo
  garnish_relacionado_id: number | null; // Puede ser nulo
  insumo_asociado_id: number;
  tipo_id: number;
}