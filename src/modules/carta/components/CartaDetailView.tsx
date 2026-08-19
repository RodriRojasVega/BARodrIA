import { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Trash2, Wine, Building, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Carta } from '@/types/carta';

// UI Kit
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface CartaDetailViewProps {
  carta: Carta;
  onVolver: () => void;
  onEditar: () => void;
  onEliminar: () => void;
}

export function CartaDetailView({ carta, onVolver, onEditar, onEliminar }: CartaDetailViewProps) {
  const [coctelesAsignados, setCoctelesAsignados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCoctelesDeCarta();
  }, [carta.id]);

  async function cargarCoctelesDeCarta() {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('carta_cocteles')
        .select(`coctel_id, orden_aparicion, cocteles(id, nombre, precio_venta_sugerido, grado_alcohol)`)
        .eq('carta_id', carta.id)
        .order('orden_aparicion');

      if (error) throw error;
      setCoctelesAsignados(data || []);
    } catch (e) {
      console.error('Error cargando cócteles de la carta:', e);
    } finally {
      setCargando(false);
    }
  }

  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'activa': return 'success';
      case 'borrador': return 'warning';
      case 'archivada': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-4 md:p-6 animate-fade-in overflow-y-auto custom-scrollbar text-slate-100 space-y-6">
      
      {/* HEADER */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 shadow-lg">
        <div>
          <button 
            type="button" 
            onClick={onVolver}
            className="text-xs font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={14} /> Volver al catálogo
          </button>
          
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-wide">{carta.nombre}</h2>
            <Badge variant={getBadgeVariant(carta.estado)} size="md">
              {carta.estado}
            </Badge>
          </div>

          <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
            <span className="flex items-center gap-1"><Building size={14}/> {carta.cliente_institucion || 'Sin cliente'}</span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1"><FileText size={14}/> {carta.tematica || 'General'}</span>
          </div>

          <p className="mt-3 text-sm text-slate-400 max-w-3xl leading-relaxed">
            {carta.descripcion || 'Sin descripción conceptual registrada.'}
          </p>
        </div>
        
        <div className="flex gap-3 shrink-0">
          <Button variant="secondary" icon={<Edit3 size={16} />} onClick={onEditar}>
            Editar Carta
          </Button>
          <Button variant="inline-danger" icon={<Trash2 size={16} />} onClick={onEliminar}>
            Eliminar
          </Button>
        </div>
      </div>

      {/* SECCIÓN DE CÓCTELES ASIGNADOS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-mono">
          <Wine size={18} className="text-emerald-400" /> Cócteles en este Menú
        </h3>

        {cargando ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs animate-pulse">
            Cargando recetas de la carta...
          </div>
        ) : coctelesAsignados.length === 0 ? (
          <div className="text-center py-12 text-slate-600 font-mono text-xs bg-slate-900 border border-slate-800 rounded-2xl">
            Esta carta no tiene cócteles asignados. Edítala para agregar recetas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {coctelesAsignados.map((item) => {
              const c = item.cocteles;
              if (!c) return null;
              return (
                <div key={item.coctel_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between group hover:border-emerald-500/40 transition-all shadow-md">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 mb-2 group-hover:text-emerald-400 transition-colors">
                      {c.nombre}
                    </h4>
                    <div className="text-emerald-400 font-mono text-xs flex justify-between">
                      <span>Precio Sugerido:</span>
                      <span className="font-bold">${Number(c.precio_venta_sugerido || 0).toFixed(0)}</span>
                    </div>
                  </div>

                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      (window as any).navegacionSPA = {
                        origen: 'cartas',
                        cartaIdOculta: carta.id,
                        coctelDestinoId: c.id
                      };
                      const btnNav = document.querySelector('.btn-nav[data-view="cocteles"]') as HTMLButtonElement;
                      if (btnNav) btnNav.click();
                    }}
                    className="mt-4 w-full text-xs bg-slate-950 border-slate-800 hover:bg-emerald-950/40 hover:text-emerald-400 hover:border-emerald-900/50"
                  >
                    Ver Ficha Técnica
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default CartaDetailView;