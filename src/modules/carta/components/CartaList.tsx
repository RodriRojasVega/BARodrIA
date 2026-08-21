// src/modules/carta/components/CartaList.tsx
import { useState } from 'react';
import { ScrollText, Plus, Search } from 'lucide-react';
import type { Carta } from '@/types/carta';

// UI Kit
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { DataCard } from '@/components/ui/DataCard';

interface CartaListProps {
  data: Carta[];
  isLoading: boolean;
  onNuevo: () => void;
  onVerDetalle: (carta: Carta) => void;
}

export function CartaList({ data, isLoading, onNuevo, onVerDetalle }: CartaListProps) {
  const [showKpis, setShowKpis] = useState(false);
  const [buscador, setBuscador] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');

  // Filtrado local
  const filtradas = data.filter(c => {
    const matchTxt = c.nombre.toLowerCase().includes(buscador.toLowerCase()) || 
                     (c.cliente_institucion && c.cliente_institucion.toLowerCase().includes(buscador.toLowerCase())) ||
                     (c.tematica && c.tematica.toLowerCase().includes(buscador.toLowerCase()));
    const matchEst = filtroEstado === 'todas' || c.estado === filtroEstado;
    return matchTxt && matchEst;
  });

  const totalActivas = data.filter(c => c.estado === 'activa').length;
  const totalBorradores = data.filter(c => c.estado === 'borrador').length;

  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'activa': return 'success';
      case 'borrador': return 'warning';
      case 'archivada': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col min-h-full w-full space-y-4 p-4 md:p-6 bg-background text-foreground animate-fade-in overflow-hidden">
      
      <ModuleHeader 
        icon={<ScrollText size={20} />}
        title="Cartas de Menú"
        subtitle="Gestión de menús, temáticas y asignación de catálogo a clientes."
        showKpis={showKpis}
        onToggleKpis={() => setShowKpis(!showKpis)}
        kpiButtonText="KPIs"
        primaryAction={
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={onNuevo}>
            Nueva Carta
          </Button>
        }
      />

      {showKpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 animate-fade-in">
          <SummaryCard label="Total Menús" value={data.length.toString()} />
          <SummaryCard label="Cartas Activas" value={totalActivas.toString()} valueClassName="text-success" />
          <SummaryCard label="Borradores" value={totalBorradores.toString()} valueClassName="text-warning" />
        </div>
      )}

      {/* BARRA DE FILTROS */}
      <div className="flex flex-col sm:flex-row gap-4 shrink-0 pt-2">
        <div className="flex-1">
          <Input 
            icon={<Search size={14} />}
            placeholder="Buscar por nombre, cliente o temática..."
            value={buscador}
            onChange={e => setBuscador(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="todas">Todos los estados</option>
            <option value="activa">Activas</option>
            <option value="borrador">Borradores</option>
            <option value="archivada">Archivadas</option>
          </Select>
        </div>
      </div>

      {/* GRILLA DE TARJETAS (Usando DataCard) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pt-2 min-h-0">
        {isLoading ? (
          <div className="text-center py-16 text-muted font-mono text-xs animate-pulse">
            Cargando catálogos de cartas...
          </div>
        ) : filtradas.length === 0 ? (
          <div className="text-center py-16 text-muted font-mono text-xs border border-border rounded-2xl bg-surface">
            No se encontraron cartas registradas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtradas.map(carta => (
              <DataCard 
                key={carta.id}
                title={carta.nombre}
                onClick={() => onVerDetalle(carta)}
                badge={<Badge variant={getBadgeVariant(carta.estado)} className="uppercase">{carta.estado}</Badge>}
              >
                <p className="truncate">📋 {carta.tematica || 'Sin temática general'}</p>
                <p className="truncate">🏢 {carta.cliente_institucion || 'Sin cliente asignado'}</p>
              </DataCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}