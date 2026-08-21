// src/types/subrecetas.ts

// 1. Importamos la definición real de UnidadMedida y tipado si es necesario
// O definimos las locales solo si son específicas de este módulo
export type UnidadMedida = 'ml' | 'g' | 'unit' | 'dash';

export interface TipoSubReceta {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string | null;
}

// 2. ELIMINAMOS InsumoGlobal de aquí.
// En los archivos que usaban InsumoGlobal, ahora importaremos desde '@/types/insumos'

export interface IngredienteBOM {
  insumo_id: number;
  cantidad: number;
  unidad_medida: string;
}

export interface PasoPreparacion {
  id: number;
  sub_receta_id: number;
  numero_paso: number;
  descripcion: string;
  es_critico: boolean;
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