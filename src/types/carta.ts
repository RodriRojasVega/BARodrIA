// src/types/carta.ts

export type CartaEstado = 'activa' | 'archivada' | 'borrador';

export interface Carta {
  id: number;
  slug: string;
  nombre: string;
  tematica: string | null;
  cliente_institucion: string | null;
  descripcion: string | null;
  estado: CartaEstado;
  created_at: string;
}

export interface CartaCoctel {
  id: number;
  carta_id: number;
  coctel_id: number;
  orden_aparicion: number | null;
  seccion_personalizada: string | null;
  precio_venta_override: number | null;
}

// Tipo auxiliar para cuando hacemos JOIN desde la tabla puente
export interface CartaCoctelDetalle {
  coctel_id: number;
  orden_aparicion: number;
  cocteles: {
    id: number;
    nombre: string;
    precio_venta_sugerido: number;
    grado_alcohol: number;
  } | null;
}

// Declaración global para la navegación cruzada limpia (SPA Hack)
declare global {
  interface Window {
    navegacionSPA?: {
      origen: string;
      cartaIdOculta?: number;
      coctelDestinoId?: number;
      retornarACartaId?: number;
    } | null;
  }
}