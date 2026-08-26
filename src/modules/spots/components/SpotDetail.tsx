import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Button } from '@/components/ui/Button';
import { DataCard } from '@/components/ui/DataCard';
import { IconText } from '@/components/ui/IconText';
import { MapPin, Edit, Users, Map, Building2 } from 'lucide-react';
import type { Spot } from '@/types/spots';

interface SpotDetailProps {
  spot: Spot;
  onBack: () => void;
  onEdit: () => void;
}

export function SpotDetail({ spot, onBack, onEdit }: SpotDetailProps) {
  return (
    <div className="flex flex-col h-full space-y-6 pb-10">
      <ModuleHeader
        title={spot.nombre}
        icon={<MapPin size={20} className="text-primary" />}
        backAction={onBack}
        backOnRight={true}
        primaryAction={
          <Button variant="primary" size="sm" icon={<Edit size={16} />} onClick={onEdit} title="Editar Locación" />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: Info General (Sin títulos, campos autoexplicativos) */}
        <div className="lg:col-span-4 space-y-5 bg-surface/50 border border-border/40 rounded-2xl p-5">
          <div className="space-y-4">
            <IconText icon={<Building2 size={16} className="text-muted" />} text={spot.tipo?.replace(/_/g, ' ').toUpperCase() || 'N/A'} textClassName="font-mono text-xs font-bold text-primary" />
            <IconText icon={<Map size={16} className="text-muted" />} text={spot.ciudad || 'Sin ciudad registrada'} />
            <IconText icon={<MapPin size={16} className="text-muted" />} text={spot.direccion || 'Sin dirección registrada'} />
          </div>
        </div>

        {/* COLUMNA DERECHA: Salones */}
        <div className="lg:col-span-8 space-y-4">
          {spot.salones_espacios && spot.salones_espacios.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {spot.salones_espacios.map(salon => (
                <DataCard key={salon.id} title={salon.nombre}>
                  <div className="space-y-2 mt-2 text-left">
                    <IconText 
                      icon={<Users size={14} className="text-primary" />} 
                      text={`${salon.capacidad_maxima_pax || 'N/D'} PAX`} 
                      textClassName="font-bold"
                    />
                    {salon.ubicacion_referencia && (
                      <p className="text-xs text-muted mt-2 border-t border-border/50 pt-2 font-mono truncate">
                        {salon.ubicacion_referencia}
                      </p>
                    )}
                  </div>
                </DataCard>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 border border-dashed border-border/50 rounded-2xl text-muted text-sm text-center">
              Aún no se han configurado salones físicos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}