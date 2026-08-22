import type { EventoConRelaciones } from '../hooks/useEventos';

export interface EtapaOperativaMock {
  id: number;
  evento_id: number;
  orden: number;
  nombre: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  modalidad_calculo: 'paquete_fijo' | 'barra_libre' | 'tickets' | null;
  pax_etapa: number | null;
  regla_consumo: number | null;
}

export const mockEventoDetalleCompleto: EventoConRelaciones = {
  id: 1,
  slug: 'gran-aniversario-corporativo-2026',
  nombre: 'Gran Aniversario Corporativo 2026',
  tipo_evento: 'corporativo',
  fecha_evento: '2026-08-25',
  hora_inicio: '19:00:00',
  hora_fin: '04:00:00',
  total_pax: 3500,
  estado: 'en_produccion',
  mandante_id: 101,
  cliente_final_id: 202,
  salon_id: 1,
  spot_id: 1,
  cliente_empresa_id: 101,
  observaciones_logistica: 'Requiere supervisión estricta en la cadena de frío para barra principal.',
  created_at: new Date().toISOString(),
  mandante: {
    id: 101,
    nombre: 'Productora Global Events SpA',
    tipo: 'productora',
    contacto_nombre: 'Carlos Mendoza',
    telefono: '+56912345678',
    email: 'contacto@globalevents.cl'
  },
  cliente_final: {
    id: 202,
    nombre: 'Banco de Innovación Tecnológica',
    tipo: 'empresa_final',
    contacto_nombre: 'Ana Torres',
    telefono: '+56987654321',
    email: 'atorres@bancoit.cl'
  }
};

// NUEVO: Arreglo de lista para abastecer el hook inteligente en EventosList
export const mockEventosLista: EventoConRelaciones[] = [
  mockEventoDetalleCompleto,
  {
    id: 2,
    slug: 'lanzamiento-marca-tech-2026',
    nombre: 'Lanzamiento de Marca Tech',
    tipo_evento: 'activacion_marca',
    fecha_evento: '2026-08-30',
    hora_inicio: '20:00:00',
    hora_fin: '02:00:00',
    total_pax: 800,
    estado: 'confirmado',
    mandante_id: 102,
    cliente_final_id: 203,
    salon_id: 2,
    spot_id: 1,
    cliente_empresa_id: 102,
    observaciones_logistica: 'Coctelería molecular de autor requerida.',
    created_at: new Date().toISOString(),
    mandante: {
      id: 102,
      nombre: 'Marketing Experencial Ltda',
      tipo: 'productora',
      contacto_nombre: 'Sofía Valdés',
      telefono: '+56998877665',
      email: 'svaldes@marketing.cl'
    },
    cliente_final: {
      id: 203,
      nombre: 'TechStore Andina',
      tipo: 'empresa_final',
      contacto_nombre: 'Felipe Rojas',
      telefono: '+56955443322',
      email: 'frojas@techstore.cl'
    }
  }
];

export const mockCronogramaEtapas: EtapaOperativaMock[] = [
  {
    id: 1,
    evento_id: 1,
    orden: 1,
    nombre: 'Recepción / Cocktail Bienvenida',
    hora_inicio: '19:00:00',
    hora_fin: '20:30:00',
    modalidad_calculo: 'barra_libre',
    pax_etapa: 3500,
    regla_consumo: 2.5
  },
  {
    id: 2,
    evento_id: 1,
    orden: 2,
    nombre: 'Cena de Gala Principal',
    hora_inicio: '20:30:00',
    hora_fin: '22:30:00',
    modalidad_calculo: 'paquete_fijo',
    pax_etapa: 3200,
    regla_consumo: 1.0
  },
  {
    id: 3,
    evento_id: 1,
    orden: 3,
    nombre: 'Fiesta & Barra Abierta Premium',
    hora_inicio: '22:30:00',
    hora_fin: '04:00:00',
    modalidad_calculo: 'barra_libre',
    pax_etapa: 3500,
    regla_consumo: 3.0
  }
];