// src/modules/carta/components/CartaDetail.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Trash2, Wine, ScrollText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Carta, CartaCoctelDetalle } from '@/types/carta';

// UI Kit Maestro 2.0
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { InfoCard } from '@/components/ui/InfoCard';
import { DataCard } from '@/components/ui/DataCard';

interface CartaDetailProps {
  carta: Carta;
  onVolver: () => void;
  onEditar: () => void;
  onEliminar: () => void;
}

export function CartaDetail({ carta, onVolver, onEditar, onEliminar }: CartaDetailProps) {
  const [coctelesAsignados, setCoctelesAsignados] = useState<CartaCoctelDetalle[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarCoctelesDeCarta() {
      setCargando(true);
      try {
        const { data, error } = await supabase
          .from('carta_cocteles')
          .select(`coctel_id, orden_aparicion, cocteles(id, nombre, precio_venta_sugerido, grado_alcohol)`)
          .eq('carta_id', carta.id)
          .order('orden_aparicion');

        if (error) throw error;
        
        // Forzamos el tipado seguro ya que sabemos que la query devuelve esta estructura
        setCoctelesAsignados((data as unknown as CartaCoctelDetalle[]) || []);
      } catch (error: unknown) {
        console.error('Error cargando cócteles de la carta:', (error as Error).message);
      } finally {
        setCargando(false);
      }
    }

    cargarCoctelesDeCarta();
  }, [carta.id]);

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
      
      {/* MODULE HEADER */}
      <ModuleHeader 
        icon={<ScrollText size={20} />}
        title={
          <div className="flex items-center gap-3">
            <span>{carta.nombre}</span>
            <Badge variant={getBadgeVariant(carta.estado)} size="sm" className="uppercase">
              {carta.estado}
            </Badge>
          </div>
        }
        primaryAction={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={onVolver}>
              Volver
            </Button>
            <Button variant="secondary" size="sm" icon={<Edit3 size={14} />} onClick={onEditar}>
              Editar
            </Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={onEliminar}>
              Eliminar
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6 space-y-8">
        
        {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
        <section className="space-y-4 pt-2">
           <h3 className="text-sm font-bold text-muted uppercase tracking-widest flex items-center gap-2 font-mono border-b border-border pb-2">
             Información General
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <InfoCard 
               title="Cliente / Institución" 
               value={carta.cliente_institucion || 'General / Sin cliente específico'} 
               variant="primary"
             />
             <InfoCard 
               title="Temática" 
               value={carta.tematica || 'Sin temática'} 
               variant="info"
             />
           </div>

           {carta.descripcion && (
             <div className="bg-surface p-4 rounded-xl border border-border text-sm text-foreground shadow-sm">
               <span className="text-primary font-mono font-bold text-xs uppercase block mb-1">Descripción Concepto</span>
               <p className="text-muted leading-relaxed">{carta.descripcion}</p>
             </div>
           )}
        </section>

        {/* SECCIÓN 2: CÓCTELES ASIGNADOS */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2 font-mono border-b border-border pb-2">
            <Wine size={16} /> Cócteles en este Menú
          </h3>

          {cargando ? (
            <div className="text-center py-12 text-muted font-mono text-xs animate-pulse">
              Cargando recetas de la carta...
            </div>
          ) : coctelesAsignados.length === 0 ? (
            <div className="text-center py-12 text-muted font-mono text-xs bg-surface border border-border rounded-2xl">
              Esta carta no tiene cócteles asignados. Edítala para agregar recetas.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {coctelesAsignados.map((item) => {
                const c = item.cocteles;
                if (!c) return null;
                
                return (
                  <DataCard 
                    key={item.coctel_id}
                    title={c.nombre}
                    badge={<Badge variant="info" size="sm">{Number(c.grado_alcohol || 0).toFixed(1)}% ABV</Badge>}
                    onClick={() => {
                      // NAVEGACIÓN CRUZADA SEGURA SPA (Tipada en global Window)
                      window.navegacionSPA = {
                        origen: 'cartas',
                        cartaIdOculta: carta.id,
                        coctelDestinoId: c.id
                      };
                      const btnNav = document.querySelector('.btn-nav[data-view="cocteles"]') as HTMLButtonElement;
                      if (btnNav) btnNav.click();
                    }}
                  >
                    <div className="flex justify-between items-center mt-2 border-t border-border pt-2">
                      <span className="font-bold text-foreground">Precio Sugerido:</span>
                      <span className="font-mono text-primary font-bold">
                        ${Number(c.precio_venta_sugerido || 0).toFixed(0)}
                      </span>
                    </div>
                    <div className="mt-3">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-full text-xs"
                      >
                        Ver Ficha Técnica
                      </Button>
                    </div>
                  </DataCard>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default CartaDetail;