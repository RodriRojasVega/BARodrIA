// src/modules/uikit/UiKitView.tsx
import { useState } from 'react';
import { TablasSection } from './sections/TablasSection';
import { TabsSection } from './sections/TabsSection';
import { BotonesSection } from './sections/BotonesSection';
import { BadgesSection } from './sections/BadgesSection';
import { KpiSection } from './sections/KpiSection';
import { InputsSection } from './sections/InputsSection';
import { AsignadorSection } from './sections/AsignadorSection';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { Button } from '@/components/ui/Button';
import { Layers, Plus } from 'lucide-react';

type Tab = 'tabla' | 'asignador' | 'inputs' | 'kpi' | 'badges' | 'botones' | 'tabs';

export function UiKitView() {
  const [activeTab, setActiveTab] = useState<Tab>('tabla');
  const [showKpis, setShowKpis] = useState(true);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'tabla', label: 'Tablas' },
    { id: 'asignador', label: 'Asignador Dual' },
    { id: 'inputs', label: 'Inputs' },
    { id: 'kpi', label: 'Tarjetas KPIs' },
    { id: 'badges', label: 'Badges' },
    { id: 'botones', label: 'Botones' },
    { id: 'tabs', label: 'Pestañas (Tabs)' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 shrink-0 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 font-bold">📏 [UI KIT Modular]:</span>
          <div className="flex gap-1 overflow-x-auto custom-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-950/65 text-emerald-400 border border-emerald-500/30 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4 md:p-6 custom-scrollbar overflow-y-auto flex flex-col space-y-4">
        {/* Cabecera transparente optimizada con ModuleHeader */}
        <ModuleHeader 
          icon={<Layers size={20} />}
          title="Laboratorio de Componentes UI"
          subtitle="Sistema de diseño modular para pruebas atómicas e integración de vistas."
          showKpis={showKpis}
          onToggleKpis={() => setShowKpis(!showKpis)}
          kpiButtonText="KPIs"
          primaryAction={
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => alert('Acción de prueba')}>
              Nueva Entidad
            </Button>
          }
        />

        {/* Tarjetas de indicadores utilizando SummaryCard oficial */}
        {showKpis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 animate-fade-in">
            <SummaryCard 
              label="Componentes Activos" 
              value={
                <>
                  24 <span className="text-xs font-normal text-emerald-400">Estables</span>
                </>
              } 
            />

            <SummaryCard 
              label="Patrón de Diseño" 
              value={
                <>
                  Atomic <span className="text-xs font-normal text-slate-500">Design</span>
                </>
              }
              valueClassName="text-emerald-400"
            />

            <SummaryCard 
              label="Estado de Sistema" 
              value={
                <>
                  100% <span className="text-xs font-normal text-slate-500">Sincronizado</span>
                </>
              }
              valueClassName="text-sky-400"
            />
          </div>
        )}

        {/* Contenedor principal de secciones */}
        <div className="flex-1 flex flex-col min-h-0">
          {activeTab === 'tabla' && <TablasSection />}
          {activeTab === 'tabs' && <TabsSection />}
          {activeTab === 'botones' && <BotonesSection />}
          {activeTab === 'badges' && <BadgesSection />}
          {activeTab === 'kpi' && <KpiSection />}
          {activeTab === 'inputs' && <InputsSection />}
          {activeTab === 'asignador' && <AsignadorSection />}
        </div>
      </div>
    </div>
  );
}

export default UiKitView;