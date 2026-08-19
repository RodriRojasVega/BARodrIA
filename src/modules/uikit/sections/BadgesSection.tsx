// src/modules/uikit/sections/BadgesSection.tsx
import { Badge } from '@/components/ui/Badge';
import { MOCK_BADGES } from '../uiKitMockData';

export function BadgesSection() {
  return (
    <div className="space-y-6 max-w-3xl animate-fade-in py-2">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-white tracking-wide">Sistema Normalizado de Badges</h1>
        <p className="text-xs text-slate-400 mt-0.5">Etiquetas tipográficas técnicas para estados, stock y tipologías de mixología.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {MOCK_BADGES.map((b, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-slate-900">
            <span className="text-xs text-slate-300 font-mono">{b.label}:</span>
            {/* @ts-ignore */}
            <Badge variant={b.variant}>{b.text}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}