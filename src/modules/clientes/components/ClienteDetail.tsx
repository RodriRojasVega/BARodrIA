// src/modules/clientes/components/ClienteDetail.tsx
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Button } from '@/components/ui/Button';
import { DataCard } from '@/components/ui/DataCard';
import { IconText } from '@/components/ui/IconText';
import { Users, Edit, Phone, Mail, UserCheck, Building2, MapPin } from 'lucide-react';
import type { ClienteEmpresa } from '@/types/clientes';

interface ClienteDetailProps {
  cliente: ClienteEmpresa;
  onBack: () => void;
  onEdit: () => void;
}

export function ClienteDetail({ cliente, onBack, onEdit }: ClienteDetailProps) {
  return (
    <div className="flex flex-col h-full space-y-6 pb-10">
      <ModuleHeader
        title={cliente.nombre}
        icon={<Users size={20} className="text-primary" />}
        backAction={onBack}
        backOnRight={true}
        primaryAction={
          <Button variant="primary" size="sm" icon={<Edit size={16} />} onClick={onEdit} title="Editar Cliente" />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: Información General */}
        <div className="lg:col-span-4 space-y-5 bg-surface/50 border border-border/40 rounded-2xl p-5">
          <div className="space-y-4 text-left">
            <IconText icon={<Building2 size={16} className="text-muted" />} text={cliente.tipos_clientes?.nombre?.toUpperCase() || 'N/A'} textClassName="font-mono text-xs font-bold text-primary" />
            <IconText icon={<UserCheck size={16} className="text-muted" />} text={cliente.contacto_nombre || 'Sin contacto registrado'} />
            <IconText icon={<Phone size={16} className="text-muted" />} text={cliente.telefono || 'Sin teléfono registrado'} />
            <IconText icon={<Mail size={16} className="text-muted" />} text={cliente.email || 'Sin correo registrado'} />
          </div>
        </div>

        {/* COLUMNA DERECHA: Spots Asociados */}
        <div className="lg:col-span-8 space-y-4">
          {cliente.cliente_spots && cliente.cliente_spots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cliente.cliente_spots.map(cs => {
                const spot = cs.spots;
                if (!spot) return null;
                return (
                  <DataCard key={spot.id} title={spot.nombre}>
                    <div className="space-y-2 mt-2 text-left">
                      {/* Validamos de forma segura por si la propiedad ciudad/tipo opcional no existe en Spot */}
                      <IconText icon={<MapPin size={14} className="text-primary" />} text={('ciudad' in spot ? (spot.ciudad as string) : null) || 'Santiago'} />
                      <span className="inline-block mt-2 text-[10px] uppercase font-mono bg-surface-muted px-2 py-0.5 rounded text-muted">
                        {('tipo' in spot && typeof spot.tipo === 'string' ? spot.tipo : 'spot').replace(/_/g, ' ')}
                      </span>
                    </div>
                  </DataCard>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 border border-dashed border-border/50 rounded-2xl text-muted text-sm text-center">
              Este cliente no está vinculado a ningún Spot específico.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}