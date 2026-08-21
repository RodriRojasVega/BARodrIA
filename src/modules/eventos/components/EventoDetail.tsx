// src/modules/eventos/components/EventoDetail.tsx
import { useState } from 'react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { CalendarDays, MapPin, Users, Building, Layers, Calculator, ClipboardList, UserCheck, Printer } from 'lucide-react';
import type { EventoConRelaciones } from '../hooks/useEventos';
import { EventoForecastTab } from './EventoForecastTab';
import { EventoPickingsTab } from './EventoPickingsTab';
import { EventoStaffTab } from './EventoStaffTab';

interface EventoDetailProps {
  evento: EventoConRelaciones;
  onVolver: () => void;
}

type TabKey = 'cronograma' | 'forecast' | 'pickings' | 'staff';

export function EventoDetail({ evento, onVolver }: EventoDetailProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('cronograma');

  const tabsConfig = [
    { id: 'cronograma', label: 'Cronograma & Etapas', icon: <Layers size={14} /> },
    { id: 'forecast', label: 'Forecast (Matriz BOM)', icon: <Calculator size={14} /> },
    { id: 'pickings', label: 'Listas de Carga (Pickings)', icon: <ClipboardList size={14} /> },
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
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      {/* Cabecera del Centro de Mando */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                {evento.tipo_evento || 'Evento Corporativo'}
              </span>
              {renderBadgeEstado(evento.estado)}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">{evento.nombre}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<Printer size={15} />} onClick={() => window.print()}>
              Exportar Dossier
            </Button>
          </div>
        </div>

        {/* Panel Resumen (KPIs Directos del Evento) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <SummaryCard 
            label="Fecha del Evento" 
            value={evento.fecha_evento} 
            valueClassName="text-white text-base md:text-xl" 
          />
          <SummaryCard 
            label="Volumen Total (PAX)" 
            value={`${evento.total_pax} PAX`} 
            valueClassName="text-emerald-400 text-base md:text-xl" 
          />
          <SummaryCard 
            label="Mandante Comercial" 
            value={evento.mandante?.nombre || 'Cliente Directo'} 
            valueClassName="text-sky-400 text-sm md:text-lg truncate" 
          />
          <SummaryCard 
            label="Cliente Final" 
            value={evento.cliente_final?.nombre || 'N/A'} 
            valueClassName="text-purple-400 text-sm md:text-lg truncate" 
          />
        </div>
      </div>

      {/* Contenedor de Pestañas Logísticas */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
        <Tabs 
          tabs={tabsConfig} 
          activeTab={activeTab} 
          onChangeTab={(id) => setActiveTab(id as TabKey)} 
        />

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* PESTAÑA 1: CRONOGRAMA Y ETAPAS */}
          <TabPanel id="cronograma" activeTab={activeTab}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">Fases y Etapas Operativas</h3>
                  <p className="text-xs text-slate-400">Distribución temporal del servicio (Ej. Cocktail, Cena, Fiesta principal).</p>
                </div>
                <Button variant="primary" size="sm">+ Añadir Etapa</Button>
              </div>

              <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Orden</TableHeaderCell>
                      <TableHeaderCell>Nombre de la Etapa</TableHeaderCell>
                      <TableHeaderCell>Horario Estimado</TableHeaderCell>
                      <TableHeaderCell align="center">Modalidad</TableHeaderCell>
                      <TableHeaderCell align="center">PAX Etapa</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono text-slate-400">1</TableCell>
                      <TableCell className="font-semibold text-white">Recepción / Cocktail Bienvenida</TableCell>
                      <TableCell className="font-mono text-xs text-slate-300">19:00 - 20:30</TableCell>
                      <TableCell align="center"><Badge variant="info">Barra Libre</Badge></TableCell>
                      <TableCell align="center" className="font-mono font-bold text-emerald-400">3,500 PAX</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabPanel>

          {/* PESTAÑA 2: FORECAST & MATRIZ BOM */}
          <TabPanel id="forecast" activeTab={activeTab}>
            <EventoForecastTab eventoId={evento.id} totalPax={evento.total_pax} />
          </TabPanel>

          {/* PESTAÑA 3: PICKINGS (LOGÍSTICA DE CARGA) */}
          <TabPanel id="pickings" activeTab={activeTab}>
            <EventoPickingsTab totalPax={evento.total_pax} />
          </TabPanel>

          {/* PESTAÑA 4: GESTIÓN DE STAFF */}
          <TabPanel id="staff" activeTab={activeTab}>
            <EventoStaffTab eventoId={evento.id} />
          </TabPanel>
        </div>
      </div>
    </div>
  );
}