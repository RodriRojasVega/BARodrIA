// src/modules/eventos/components/EventoDetail.tsx
import { useState } from 'react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Layers, Calculator, ClipboardList, UserCheck, Printer, Edit, Trash2, Info, CalendarRange } from 'lucide-react';
import type { EventoConRelaciones } from '../hooks/useEventos';

import { EventoGeneralTab } from './EventoGeneralTab';
import { EventoCronogramaTab } from './EventoCronogramaTab';
import { EventoForecastTab } from './EventoForecastTab';
import { EventoPickingsTab } from './EventoPickingsTab';
import { EventoStaffTab } from './EventoStaffTab';

interface EventoDetailProps {
  evento: EventoConRelaciones;
  onVolver: () => void;
}

type TabKey = 'general' | 'cronograma' | 'forecast' | 'pickings' | 'staff';

export function EventoDetail({ evento, onVolver }: EventoDetailProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  const tabsConfig = [
    { id: 'general', label: 'Info. General', icon: <Info size={14} /> },
    { id: 'cronograma', label: 'Cronograma & Etapas', icon: <Layers size={14} /> },
    { id: 'forecast', label: 'Forecast (Matriz BOM)', icon: <Calculator size={14} /> },
    { id: 'pickings', label: 'Listas de Carga', icon: <ClipboardList size={14} /> },
    { id: 'staff', label: 'Asignación de Staff', icon: <UserCheck size={14} /> },
  ];

  const renderBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'confirmado': return <Badge variant="success">Confirmado</Badge>;
      case 'en_produccion': return <Badge variant="warning">En Producción</Badge>;
      case 'ejecutado': return <Badge variant="info">Ejecutado</Badge>;
      case 'cancelado': return <Badge variant="danger">Cancelado</Badge>;
      default: return <Badge variant="default">Cotización</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-5 animate-fade-in pt-4 md:pt-6">
      
      {/* 1. SECCIÓN SUPERIOR: HEADER ESTANDARIZADO */}
      <div className="shrink-0">
        <ModuleHeader 
          icon={<CalendarRange size={20} className="text-primary" />}
          title={evento.nombre}
          backAction={onVolver}
          backOnRight={true}
          badges={
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                {evento.tipo_evento || 'Evento Corporativo'}
              </span>
              {renderBadgeEstado(evento.estado)}
            </div>
          }
          primaryAction={
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                icon={<Printer size={15} />} 
                onClick={() => window.print()}
                title="Exportar Dossier"
              />
              <Button 
                variant="secondary" 
                size="sm" 
                icon={<Edit size={15} />}
              >
                Editar
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                icon={<Trash2 size={15} />}
              >
                Eliminar
              </Button>
            </div>
          }
        />
      </div>

      {/* 2. SISTEMA DE PESTAÑAS (TABS) */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b border-border/50 mb-4">
          <Tabs 
            tabs={tabsConfig} 
            activeTab={activeTab} 
            onChangeTab={(id) => setActiveTab(id as TabKey)} 
          />
        </div>

        {/* 3. CONTENIDO DE LAS PESTAÑAS */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
          
          {/* PESTAÑA 1: INFORMACIÓN GENERAL (Modularizada) */}
          <TabPanel id="general" activeTab={activeTab}>
            <EventoGeneralTab evento={evento} />
          </TabPanel>

          {/* PESTAÑA 2: CRONOGRAMA Y ETAPAS */}
          <TabPanel id="cronograma" activeTab={activeTab}>
            <EventoCronogramaTab eventoId={evento.id} />
          </TabPanel>

          {/* PESTAÑA 3: FORECAST & MATRIZ BOM */}
          <TabPanel id="forecast" activeTab={activeTab}>
            <EventoForecastTab eventoId={evento.id} totalPax={evento.total_pax} />
          </TabPanel>

          {/* PESTAÑA 4: PICKINGS */}
          <TabPanel id="pickings" activeTab={activeTab}>
            <EventoPickingsTab eventoId={evento.id} totalPax={evento.total_pax} />
          </TabPanel>

          {/* PESTAÑA 5: STAFF */}
          <TabPanel id="staff" activeTab={activeTab}>
            <EventoStaffTab eventoId={evento.id} />
          </TabPanel>
          
        </div>
      </div>
    </div>
  );
}