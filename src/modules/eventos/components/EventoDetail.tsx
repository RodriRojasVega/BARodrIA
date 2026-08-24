// src/modules/eventos/components/EventoDetail.tsx
import { useState } from 'react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Layers, Calculator, ClipboardList, UserCheck, Printer, Edit, Trash2, Info, CalendarRange } from 'lucide-react';
import type { EventoConRelaciones } from '../hooks/useEventos';
import { useEventoMutations } from '../hooks/useEventoMutations'; // 👈 1. Importamos el hook de mutaciones

import { EventoGeneralTab } from './EventoGeneralTab';
import { EventoCronogramaTab } from './EventoCronogramaTab';
import { EventoForecastTab } from './EventoForecastTab';
import { EventoPickingsTab } from './EventoPickingsTab';
import { EventoStaffTab } from './EventoStaffTab';

interface EventoDetailProps {
  evento: EventoConRelaciones;
  onVolver: () => void;
  onEditar?: (eventoId: number) => void;
}

type TabKey = 'general' | 'cronograma' | 'forecast' | 'pickings' | 'staff';

export function EventoDetail({ evento, onVolver, onEditar }: EventoDetailProps){
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const { eliminarEvento } = useEventoMutations(); // 👈 2. Instanciamos la función de eliminar

  const tabsConfig = [
    { id: 'general', label: 'Info. General', icon: <Info size={14} /> },
    { id: 'cronograma', label: 'Cronograma & Etapas', icon: <Layers size={14} /> },
    { id: 'forecast', label: 'Forecast (Matriz BOM)', icon: <Calculator size={14} /> },
    { id: 'pickings', label: 'Listas de Carga', icon: <ClipboardList size={14} /> },
    { id: 'staff', label: 'Asignación de Staff', icon: <UserCheck size={14} /> },
  ];

  const estadoNombre = evento.estado_info?.nombre || 'Cotización';
  const estadoSlug = evento.estado_info?.slug || 'cotizacion';
  const tipoNombre = evento.tipo_evento_info?.nombre || 'Evento Corporativo';

  const renderBadgeEstado = (slug: string, nombre: string) => {
    switch (slug) {
      case 'confirmado': return <Badge variant="success">{nombre}</Badge>;
      case 'en_produccion': return <Badge variant="warning">{nombre}</Badge>;
      case 'ejecutado': return <Badge variant="info">{nombre}</Badge>;
      case 'cancelado': return <Badge variant="danger">{nombre}</Badge>;
      default: return <Badge variant="default">{nombre}</Badge>;
    }
  };

  // 👈 3. Creamos la función manejadora con la confirmación de seguridad
  const handleEliminar = async () => {
    const confirmar = window.confirm(
      '¿Estás seguro de que deseas eliminar este evento? Esta acción borrará todas sus etapas y puntos, y no se puede deshacer.'
    );
    if (confirmar) {
      try {
        await eliminarEvento.mutateAsync(evento.id);
        onVolver(); // Volvemos al listado/calendario tras eliminar
      } catch (error) {
        alert('Error al eliminar el evento. Revisa la consola para más detalles.');
        console.error(error);
      }
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
                {tipoNombre}
              </span>
              {renderBadgeEstado(estadoSlug, estadoNombre)}
            </div>
          }
          primaryAction={
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                icon={<Printer size={15} />} 
                onClick={() => window.print()}
                title="Exportar Dossier"
              />
              <Button 
                variant="secondary" 
                size="sm" 
                icon={<Edit size={15} />}
                onClick={() => onEditar?.(evento.id)}
                title="Editar Evento"
              />
              {/* 👈 4. Conectamos la función al botón y bloqueamos clics dobles mientras procesa */}
              <Button 
                variant="danger" 
                size="sm" 
                icon={<Trash2 size={15} />}
                title="Eliminar Evento"
                onClick={handleEliminar}
                disabled={eliminarEvento.isPending}
              />
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
          
          <TabPanel id="general" activeTab={activeTab}>
            <EventoGeneralTab evento={evento} />
          </TabPanel>

          <TabPanel id="cronograma" activeTab={activeTab}>
            <EventoCronogramaTab eventoId={evento.id} />
          </TabPanel>

          <TabPanel id="forecast" activeTab={activeTab}>
            <EventoForecastTab eventoId={evento.id} totalPax={evento.total_pax} />
          </TabPanel>

          <TabPanel id="pickings" activeTab={activeTab}>
            <EventoPickingsTab eventoId={evento.id} totalPax={evento.total_pax} />
          </TabPanel>

          <TabPanel id="staff" activeTab={activeTab}>
            <EventoStaffTab eventoId={evento.id} />
          </TabPanel>
          
        </div>
      </div>
    </div>
  );
}