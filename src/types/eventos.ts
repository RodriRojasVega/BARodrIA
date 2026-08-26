// src/types/eventos.ts
import type { ClienteEmpresa } from './clientes';
import type { Spot, SalonEspacio } from './spots';

// ==========================================
// ENUMS Y TIPOS LITERALES
// ==========================================
// Mantenemos estos tipos por si los usas para validar slugs en el frontend,
// aunque en la entidad principal ahora usaremos los IDs numéricos.
export type TipoEvento = 'corporativo' | 'matrimonio' | 'cumpleanos' | 'activacion_marca' | 'festival_masivo' | 'particular' | 'otro';
export type EstadoEvento = 'cotizacion' | 'confirmado' | 'en_produccion' | 'ejecutado' | 'cancelado';
export type ModalidadCalculo = 'paquete_fijo' | 'barra_libre' | 'tickets';
export type CategoriaHerramienta = 'preparacion' | 'servicio' | 'montaje';
export type RolStaff = 'produccion' | 'barback' | 'bartender' | 'capitan';

// Reexportamos ClienteEmpresa para que el módulo de eventos siga disponiendo de ella de forma nativa
export type { ClienteEmpresa };

// ==========================================
// ENTIDADES DEL EVENTO Y LOGÍSTICA
// ==========================================
export interface Evento {
  id: number;
  slug: string;
  nombre: string;
  fecha_evento: string; // Formato YYYY-MM-DD
  hora_inicio: string;  // Formato HH:mm:ss
  hora_fin: string;     // Formato HH:mm:ss
  total_pax: number;
  estado_id: number; // Actualizado: FK a estados_evento
  observaciones_logistica: string | null;
  created_at: string;
  
  // Relaciones Geográficas y Comerciales
  salon_id: number | null;
  spot_id: number | null;
  tipo_evento_id: number | null; // Actualizado: FK a tipos_evento
  mandante_id: number | null;
  cliente_final_id: number | null;
  staff_proyectado?: number;

  // Joins opcionales para renderizado en vistas
  spots?: Spot;
  salones_espacios?: SalonEspacio;
  mandante?: ClienteEmpresa;
  cliente_final?: ClienteEmpresa;
  estados_evento?: { nombre: string; slug: string }; // Join con catálogo de estados
  tipos_evento?: { nombre: string; slug: string }; // Join con catálogo de tipos
}

export interface EventoEtapa {
  id: number;
  evento_id: number;
  orden: number;
  nombre: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  
  // Variables del Motor Forecast
  modalidad_calculo: ModalidadCalculo | null;
  pax_etapa: number | null;
  regla_consumo: number | null;
}

// ==========================================
// NUEVOS ACTIVOS OPERATIVOS (Soportes y Herramientas)
// ==========================================
export interface Soporte {
  id: number;
  slug: string;
  nombre: string;
  capacidad_operativa_ml: number;
  
  // Volumetría Logística
  unidades_por_rack: number | null;
  racks_por_pallet: number | null;
  proveedor_id: number | null;
}

export interface Herramienta {
  id: number;
  slug: string;
  nombre: string;
  categoria: CategoriaHerramienta | null;
  proveedor_id: number | null;
}

// ==========================================
// PRODUCCIÓN Y STAFF
// ==========================================
export interface Garnish {
  id: number;
  insumo_base_id: number;
  nombre: string;
  tipo_corte: string;
  rendimiento_por_unidad: number;
}

export interface CoctelGarnish {
  id: number;
  coctel_id: number;
  garnish_id: number;
  cantidad: number;
}

export interface Staff {
  id: number;
  nombre: string;
  rol: RolStaff | null;
  telefono: string | null;
  estado: string | null;
}

export interface EventoStaffAsignacion {
  id: number;
  staff_id: number;
  evento_id: number;
  etapa_id: number | null;
  punto_servicio_id: number | null;
  hora_citacion: string | null;
}

export interface EventoActividadCronograma {
  id: number;
  evento_id: number;
  etapa_id: number | null;
  orden: number;
  nombre: string;
  hora_inicio: string; // 'HH:mm:ss'
  hora_fin: string;   // 'HH:mm:ss'
  es_hito: boolean;
}