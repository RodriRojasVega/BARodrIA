// src/types/eventos.ts

// ==========================================
// ENUMS Y TIPOS LITERALES
// ==========================================
export type TipoClienteEmpresa = 'empresa_final' | 'productora' | 'banquetera' | 'centro_eventos' | 'particular';
export type TipoEvento = 'corporativo' | 'matrimonio' | 'cumpleanos' | 'activacion_marca' | 'festival_masivo' | 'particular' | 'otro';
export type EstadoEvento = 'cotizacion' | 'confirmado' | 'en_produccion' | 'ejecutado' | 'cancelado';
export type ModalidadCalculo = 'paquete_fijo' | 'barra_libre' | 'tickets';
export type CategoriaHerramienta = 'preparacion' | 'servicio' | 'montaje';
export type RolStaff = 'produccion' | 'barback' | 'bartender' | 'capitan';

// ==========================================
// ENTIDADES DEL CRM B2B
// ==========================================
export interface ClienteEmpresa {
  id: number;
  nombre: string;
  tipo: TipoClienteEmpresa | null;
  contacto_nombre: string | null;
  telefono: string | null;
  email: string | null;
}

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
  estado: EstadoEvento;
  observaciones_logistica: string | null;
  created_at: string;
  
  // Relaciones Geográficas y Comerciales
  salon_id: number | null;
  spot_id: number | null;
  tipo_evento: TipoEvento | null;
  mandante_id: number | null;
  cliente_final_id: number | null;
  cliente_empresa_id: number | null; // Legacy
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