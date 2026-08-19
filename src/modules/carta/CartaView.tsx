import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ScrollText, Plus, Search } from 'lucide-react';
import type { Carta } from '@/types/carta';

// UI Kit Maestro 2.0
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';

// Componentes del Módulo
import { CartaFormView } from './components/CartaFormView';
import { CartaDetailView } from './components/CartaDetailView';

type VistaActiva = 'grilla' | 'detalle' | 'formulario';

export function CartaView() {
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('grilla');
  const [cartaActiva, setCartaActiva] = useState<Carta | null>(null);
  
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [showKpis, setShowKpis] = useState<boolean>(false);

  // Filtros de listado
  const [buscador, setBuscador] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');

  useEffect(() => {
    cargarCartas();
  }, []);

  async function cargarCartas() {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('cartas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const lista = data || [];
      setCartas(lista);

      // Evaluar si hay boleto de retorno SPA
      const navSPA = (window as any).navegacionSPA;
      if (navSPA && navSPA.retornarACartaId) {
        const encontrada = lista.find((c: Carta) => c.id === navSPA.retornarACartaId);
        if (encontrada) {
          setCartaActiva(encontrada);
          setVistaActiva('detalle');
        }
        (window as any).navegacionSPA = null;
      }
    } catch (e: any) {
      console.error('Error cargando cartas:', e.message);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarCarta(id: number, nombre: string) {
    if (!confirm(`¿Estás seguro de eliminar la carta "${nombre}"?`)) return;

    try {
      const { error } = await supabase.from('cartas').delete().eq('id', id);
      if (error) throw error;
      await cargarCartas();
      setVistaActiva('grilla');
    } catch (e: any) {
      alert(`Error al eliminar: ${e.message}`);
    }
  }

  async function guardarCartaMultinivel(formData: Partial<Carta>, coctelIds: number[]) {
    try {
      let cartaGuardada: Carta;

      if (cartaActiva) {
        const { data, error } = await supabase
          .from('cartas')
          .update(formData)
          .eq('id', cartaActiva.id)
          .select()
          .single();
        if (error) throw error;
        cartaGuardada = data;
      } else {
        const { data, error } = await supabase
          .from('cartas')
          .insert([formData])
          .select()
          .single();
        if (error) throw error;
        cartaGuardada = data;
      }

      // Sincronizar puente carta_cocteles
      await supabase.from('carta_cocteles').delete().eq('carta_id', cartaGuardada.id);
      if (coctelIds.length > 0) {
        const relaciones = coctelIds.map((coctelId, idx) => ({
          carta_id: cartaGuardada.id,
          coctel_id: coctelId,
          orden_aparicion: idx + 1
        }));
        const { error: errRel } = await supabase.from('carta_cocteles').insert(relaciones);
        if (errRel) throw errRel;
      }

      await cargarCartas();
      setVistaActiva('grilla');
      setCartaActiva(null);
    } catch (e: any) {
      alert(`Error al guardar la carta: ${e.message}`);
      throw e;
    }
  }

  // --- CONTROLADOR DE VISTAS ---
  if (vistaActiva === 'formulario') {
    return (
      <CartaFormView 
        cartaAEditar={cartaActiva}
        onCerrar={() => setVistaActiva(cartaActiva ? 'detalle' : 'grilla')}
        onGuardar={guardarCartaMultinivel}
      />
    );
  }

  if (vistaActiva === 'detalle' && cartaActiva) {
    return (
      <CartaDetailView 
        carta={cartaActiva}
        onVolver={() => setVistaActiva('grilla')}
        onEditar={() => setVistaActiva('formulario')}
        onEliminar={() => eliminarCarta(cartaActiva.id, cartaActiva.nombre)}
      />
    );
  }

  // --- VISTA GRILLA ---
  const filtradas = cartas.filter(c => {
    const matchTxt = c.nombre.toLowerCase().includes(buscador.toLowerCase()) || 
                     (c.cliente_institucion && c.cliente_institucion.toLowerCase().includes(buscador.toLowerCase())) ||
                     (c.tematica && c.tematica.toLowerCase().includes(buscador.toLowerCase()));
    const matchEst = filtroEstado === 'todas' || c.estado === filtroEstado;
    return matchTxt && matchEst;
  });

  const totalActivas = cartas.filter(c => c.estado === 'activa').length;
  const totalBorradores = cartas.filter(c => c.estado === 'borrador').length;

  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'activa': return 'success';
      case 'borrador': return 'warning';
      case 'archivada': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in p-4 md:p-6 bg-slate-950 text-slate-100 overflow-hidden">
      
      <ModuleHeader 
        icon={<ScrollText size={20} />}
        title="Cartas de Cócteles"
        subtitle="Gestión de menús, temáticas y asignación para clientes."
        showKpis={showKpis}
        onToggleKpis={() => setShowKpis(!showKpis)}
        kpiButtonText="KPIs"
        primaryAction={
          <Button 
            variant="primary" 
            size="sm"
            icon={<Plus size={14} />} 
            onClick={() => {
              setCartaActiva(null);
              setVistaActiva('formulario');
            }}
          >
            Nueva Carta
          </Button>
        }
      />

      {showKpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 animate-fade-in">
          <SummaryCard 
            label="Total Menús" 
            value={cartas.length.toString()} 
          />
          <SummaryCard 
            label="Cartas Activas" 
            value={totalActivas.toString()} 
            valueClassName="text-emerald-400"
          />
          <SummaryCard 
            label="Borradores" 
            value={totalBorradores.toString()} 
            valueClassName="text-amber-400"
          />
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
          <Select 
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
          >
            <option value="todas">Todos los estados</option>
            <option value="activa">Activas</option>
            <option value="borrador">Borradores</option>
            <option value="archivada">Archivadas</option>
          </Select>
        </div>
      </div>

      {/* GRILLA DE TARJETAS */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pt-2 min-h-0">
        {cargando ? (
          <div className="text-center py-16 text-slate-500 font-mono text-xs animate-pulse">
            Cargando catálogos de cartas...
          </div>
        ) : filtradas.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-mono text-xs border border-slate-900 rounded-2xl bg-slate-900/30">
            No se encontraron cartas registradas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtradas.map(carta => (
              <div 
                key={carta.id}
                onClick={() => {
                  setCartaActiva(carta);
                  setVistaActiva('detalle');
                }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                      {carta.nombre}
                    </h3>
                    <Badge variant={getBadgeVariant(carta.estado)}>
                      {carta.estado}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <p className="truncate">📋 {carta.tematica || 'General'}</p>
                    <p className="truncate">🏢 {carta.cliente_institucion || 'Sin cliente'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default CartaView;