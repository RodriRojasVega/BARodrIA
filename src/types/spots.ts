// src/types/spots.ts

export type TipoSpot = 'centro_eventos' | 'hotel' | 'casino' | 'centro_convenciones' | 'otro';

export interface SalonEspacio {
  id: number;
  nombre: string;
  ubicacion_referencia: string | null;
  capacidad_maxima_pax: number | null;
  spot_id: number;
}

export interface Spot {
  id: number;
  nombre: string;
  tipo: TipoSpot | null;
  direccion: string | null;
  ciudad: string | null;
  salones_espacios?: SalonEspacio[];
}