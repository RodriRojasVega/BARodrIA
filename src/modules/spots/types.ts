// src/modules/spots/types.ts
import type { TipoSpot } from '@/types/spots';

export interface SalonFormData {
  id?: number | string; // Permite IDs temporales como 'temp_123' durante la creación
  nombre: string;
  ubicacion_referencia: string | null;
  capacidad_maxima_pax: number | null;
}

export interface SpotFormData {
  nombre: string;
  tipo: TipoSpot | null;
  direccion: string | null;
  ciudad: string | null;
  salones: SalonFormData[];
}