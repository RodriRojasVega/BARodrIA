// src/modules/eventos/components/EventoGeneralTab.tsx
import { EventDashboardCard } from '@/components/ui/EventDashboardCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { IconText } from '@/components/ui/IconText';
import { Badge } from '@/components/ui/Badge';
import { CalendarDays, Users, Building, MapPin, Clock, FileText, Activity, Store, Layers, Briefcase } from 'lucide-react';
import type { EventoConRelaciones } from '../hooks/useEventos';

interface EventoGeneralTabProps {
  evento: EventoConRelaciones;
}

export function EventoGeneralTab({ evento }: EventoGeneralTabProps) {
  // TODO: Estos datos provendrán de las relaciones (etapas, staff y salones).
  const resumenSalones = ['Salón Principal A', 'Terraza Exterior', 'Estación VIP'];
  const resumenModalidades = ['Barra Libre', 'Paquete Fijo'];
  const totalStaffAsignado = 24;

  // Extraer nombres de catálogos o valores de respaldo seguros
  const tipoNombre = evento.tipo_evento_info?.nombre || (typeof evento.tipo_evento === 'string' ? evento.tipo_evento : 'Corporativo');
  const estadoNombre = evento.estado_info?.nombre || (typeof evento.estado === 'string' ? evento.estado : 'Cotización');
  const estadoSlug = evento.estado_info?.slug || (typeof evento.estado === 'string' ? evento.estado : 'cotizacion');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* 1. PRIMERA FILA: 6 TARJETAS KPI (Dashboard Edge-to-Edge) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <EventDashboardCard 
          label="Fecha Operativa" 
          value={evento.fecha_evento} 
          icon={<CalendarDays size={16} />}
        />
        <EventDashboardCard 
          label="Horario Servicio" 
          value={`${evento.hora_inicio?.slice(0, 5)} - ${evento.hora_fin?.slice(0, 5)}`} 
          icon={<Clock size={16} />}
        />
        <EventDashboardCard 
          label="Tipología" 
          value={tipoNombre.toUpperCase()} 
          icon={<Briefcase size={16} />}
        />
        <EventDashboardCard 
          label="Volumen (PAX)" 
          value={`${evento.total_pax}`} 
          valueClassName="text-primary font-bold"
          icon={<Users size={16} />}
        />
        <EventDashboardCard 
          label="Staff Proj. / Asignado" 
          value={`${evento.staff_proyectado || 0} / ${totalStaffAsignado}`} 
          icon={<Users size={16} />}
        />
        <EventDashboardCard 
          label="Estado Operativo" 
          value={<span className="capitalize">{estadoNombre}</span>} 
          valueClassName={estadoSlug === 'confirmado' ? 'text-success' : 'text-foreground'}
          icon={<Activity size={16} />}
        />
      </div>

      {/* 2. SEGUNDA FILA: GRILLA DE 3 COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA 1: Entidades Comerciales */}
        <SectionCard className="space-y-6 h-full">
          {/* Mandante */}
          <div className="space-y-2">
            <IconText 
              icon={<Building size={15} className="text-primary" />} 
              text="Mandante Comercial" 
              textClassName="text-primary font-mono text-[11px] uppercase font-bold tracking-wider" 
            />
            <div>
              <h4 className="text-sm font-bold text-foreground">{evento.mandante?.nombre || 'Directo'}</h4>
              <p className="text-xs text-muted mt-1">Contacto: <strong className="text-foreground">{evento.mandante?.contacto_nombre || 'N/A'}</strong></p>
            </div>
          </div>

          <div className="h-px w-full bg-border/50" />

          {/* Cliente Final */}
          <div className="space-y-2">
            <IconText 
              icon={<MapPin size={15} className="text-primary" />} 
              text="Cliente Final / Institución" 
              textClassName="text-primary font-mono text-[11px] uppercase font-bold tracking-wider" 
            />
            <div>
              <h4 className="text-sm font-bold text-foreground">{evento.cliente_final?.nombre || 'N/A'}</h4>
              <p className="text-xs text-muted mt-1">Contacto: <strong className="text-foreground">{evento.cliente_final?.contacto_nombre || 'N/A'}</strong></p>
            </div>
          </div>
        </SectionCard>

        {/* COLUMNA 2: Locaciones y Modalidades */}
        <SectionCard className="space-y-6 h-full">
          {/* Salones */}
          <div className="space-y-3">
            <IconText 
              icon={<Store size={15} className="text-primary" />} 
              text="Locaciones Asignadas" 
              textClassName="text-primary font-mono text-[11px] uppercase font-bold tracking-wider" 
            />
            <div className="flex flex-wrap gap-2">
              {resumenSalones.map(salon => (
                <Badge key={salon} variant="default" size="sm">{salon}</Badge>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-border/50" />

          {/* Modalidades */}
          <div className="space-y-3">
            <IconText 
              icon={<Layers size={15} className="text-primary" />} 
              text="Modalidades de Servicio" 
              textClassName="text-primary font-mono text-[11px] uppercase font-bold tracking-wider" 
            />
            <div className="flex flex-wrap gap-2">
              {resumenModalidades.map(mod => (
                <Badge key={mod} variant="info" size="sm">{mod}</Badge>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* COLUMNA 3: Observaciones y Restricciones */}
        <SectionCard className="space-y-3 h-full bg-surface-muted/30">
          <IconText 
            icon={<FileText size={15} className="text-primary" />} 
            text="Observaciones / Restricciones" 
            textClassName="text-primary font-mono text-[11px] uppercase font-bold tracking-wider" 
          />
          <p className="text-xs text-muted leading-relaxed">
            {evento.observaciones_logistica || 'No se han registrado observaciones logísticas especiales para este evento.'}
          </p>
        </SectionCard>

      </div>
    </div>
  );
}