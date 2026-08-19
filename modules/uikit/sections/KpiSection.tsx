// src/modules/uikit/sections/KpiSection.tsx
import { SummaryCard } from '@/components/ui/SummaryCard';
import { Badge } from '@/components/ui/Badge';
import { MOCK_KPIS } from '../uiKitMockData';

export function KpiSection() {
  return (
    <div className="space-y-6 max-w-4xl animate-fade-in py-2">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-white tracking-wide">Tarjetas Indicadoras (SummaryCards / KPIs)</h1>
        <p className="text-xs text-slate-400 mt-0.5">Métricas de rendimiento con soporte para badges y etiquetas contextuales.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* KPI estándar de la base mock */}
        {MOCK_KPIS.map((kpi, idx) => (
          <SummaryCard 
            key={idx} 
            label={kpi.label} 
            value={kpi.value} 
            valueClassName={kpi.color} 
          />
        ))}

        {/* KPI avanzado con el badge integrado inspirado en tu captura */}
        <SummaryCard 
          label="Costo Lote (COGS)" 
          value="$3.500" 
          valueClassName="text-emerald-400"
          badge={<Badge variant="success">1000 ml</Badge>}
        />

        <SummaryCard 
          label="Variación de Merma" 
          value="4.2%" 
          valueClassName="text-amber-400"
          badge={<Badge variant="warning">-0.5% vs prom</Badge>}
        />
      </div>
    </div>
  );
}