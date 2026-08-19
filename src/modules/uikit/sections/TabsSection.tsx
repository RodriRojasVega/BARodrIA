// src/modules/uikit/sections/TabsSection.tsx
import { useState } from 'react';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { MOCK_TABS } from '../uiKitMockData';

export function TabsSection() {
  const [activeSubTab, setActiveSubTab] = useState('ingenieria');

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in py-2 flex flex-col h-full">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-white tracking-wide">Componente: Sistema de Pestañas (Tabs & TabPanel)</h1>
        <p className="text-xs text-slate-400 mt-0.5">Estándar limpio y sin cajas con colores dinámicos por sección.</p>
      </div>

      <div className="flex-1 flex flex-col min-h-0 pt-2">
        <Tabs tabs={MOCK_TABS} activeTab={activeSubTab} onChangeTab={setActiveSubTab} />

        <TabPanel id="ingenieria" activeTab={activeSubTab}>
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Contenido de Escandallo & BOM</h3>
          <p className="text-xs text-slate-300 mt-1">Cálculos de rendimiento y costos del lote flotantes.</p>
        </TabPanel>

        <TabPanel id="operacion" activeTab={activeSubTab}>
          <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono">Contenido de Procesos & Mermas</h3>
          <p className="text-xs text-slate-300 mt-1">Secuencia de preparación paso a paso.</p>
        </TabPanel>

        <TabPanel id="uso" activeTab={activeSubTab}>
          <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest font-mono">Contenido de Uso en Cócteles</h3>
          <p className="text-xs text-slate-300 mt-1">Trazabilidad en tiempo real.</p>
        </TabPanel>
      </div>
    </div>
  );
}