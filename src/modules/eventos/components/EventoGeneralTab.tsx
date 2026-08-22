// src/modules/eventos/components/EventoGeneralTab.tsx
import { EventDashboardCard } from '@/components/ui/EventDashboardCard';
import { CalendarDays, Users, Building, MapPin, Clock, FileText, Briefcase, Phone, Mail } from 'lucide-react';
import type { EventoConRelaciones } from '../hooks/useEventos';

interface EventoGeneralTabProps {
  evento: EventoConRelaciones;
}

export function EventoGeneralTab({ evento }: EventoGeneralTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. MÉTRICAS OPERATIVAS PRINCIPALES */}
      <div>
        <h3 className="text-sm font-bold text-foreground tracking-wide uppercase font-mono mb-4">Métricas Operativas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <EventDashboardCard 
            label="Fecha Operativa" 
            value={evento.fecha_evento} 
            icon={<CalendarDays size={16} />}
          />
          <EventDashboardCard 
            label="Volumen (PAX)" 
            value={`${evento.total_pax} Asistentes`} 
            valueClassName="text-primary"
            icon={<Users size={16} />}
          />
          <EventDashboardCard 
            label="Horario del Servicio" 
            value={`${evento.hora_inicio?.slice(0, 5)} - ${evento.hora_fin?.slice(0, 5)} hrs`} 
            icon={<Clock size={16} />}
          />
          <EventDashboardCard 
            label="Tipología" 
            value={evento.tipo_evento?.toUpperCase() || 'CORPORATIVO'} 
            icon={<Briefcase size={16} />}
          />
        </div>
      </div>

      {/* 2. ENTIDADES COMERCIALES (Mandante & Cliente Final) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mandante */}
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase font-bold tracking-wider">
            <Building size={16} />
            <span>Mandante Comercial</span>
          </div>
          <h4 className="text-base font-bold text-foreground">{evento.mandante?.nombre || 'Directo'}</h4>
          <div className="space-y-1.5 text-xs text-muted">
            <p>Contacto: <strong className="text-foreground">{evento.mandante?.contacto_nombre || 'N/A'}</strong></p>
            <p className="flex items-center gap-1"><Phone size={12} /> {evento.mandante?.telefono || 'Sin registro'}</p>
            <p className="flex items-center gap-1"><Mail size={12} /> {evento.mandante?.email || 'Sin correo'}</p>
          </div>
        </div>

        {/* Cliente Final */}
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase font-bold tracking-wider">
            <MapPin size={16} />
            <span>Cliente Final / Institución</span>
          </div>
          <h4 className="text-base font-bold text-foreground">{evento.cliente_final?.nombre || 'N/A'}</h4>
          <div className="space-y-1.5 text-xs text-muted">
            <p>Contacto: <strong className="text-foreground">{evento.cliente_final?.contacto_nombre || 'N/A'}</strong></p>
            <p className="flex items-center gap-1"><Phone size={12} /> {evento.cliente_final?.telefono || 'Sin registro'}</p>
            <p className="flex items-center gap-1"><Mail size={12} /> {evento.cliente_final?.email || 'Sin correo'}</p>
          </div>
        </div>
      </div>

      {/* 3. OBSERVACIONES LOGÍSTICAS */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-foreground font-mono text-xs uppercase font-bold tracking-wider">
          <FileText size={16} className="text-primary" />
          <span>Observaciones y Restricciones Logísticas</span>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          {evento.observaciones_logistica || 'No se han registrado observaciones logísticas especiales para este evento.'}
        </p>
      </div>
    </div>
  );
}