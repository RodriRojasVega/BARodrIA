// src/types/clientes.ts
import type { Spot } from './spots';

export interface TipoCliente {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string | null;
}

export interface ClienteSpotRelacion {
  spot_id: number;
  spots?: Spot;
}

export interface ClienteEmpresa {
  id: number;
  nombre: string;
  tipo_id: number | null;
  tipos_clientes?: TipoCliente | null;
  contacto_nombre: string | null;
  telefono: string | null;
  email: string | null;
  cliente_spots?: ClienteSpotRelacion[];
}