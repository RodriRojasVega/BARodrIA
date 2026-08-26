// src/modules/clientes/types.ts

export interface ClienteFormData {
  nombre: string;
  tipo_id: number | null;
  contacto_nombre: string | null;
  telefono: string | null;
  email: string | null;
  spot_ids: number[];
}