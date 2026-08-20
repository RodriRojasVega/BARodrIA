// src/components/layout/Topbar.tsx
export function Topbar() {
  const currentDate = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-8 shrink-0 text-foreground">
      <div className="flex items-center gap-2 text-sm text-muted">
        <span>📅</span>
        <span className="font-mono capitalize">{currentDate}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-surface border border-border px-3 py-1.5 rounded-xl text-xs text-muted font-mono shadow-sm">
          Entorno: Producción Local
        </div>
      </div>
    </header>
  );
}