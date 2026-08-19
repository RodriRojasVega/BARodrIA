import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import type { Carta } from '@/types/carta';

// UI Kit Maestro 2.0
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DualAsignador } from '@/components/ui/DualAsignador';

interface CartaFormViewProps {
  cartaAEditar?: Carta | null;
  onCerrar: () => void;
  onGuardar: (_cartaData: Partial<Carta>, _coctelIds: number[]) => Promise<void>;
}

export function CartaFormView({ cartaAEditar, onCerrar, onGuardar }: CartaFormViewProps) {
  const [cargando, setCargando] = useState(false);
  const [coctelesGlobales, setCoctelesGlobales] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<Partial<Carta>>(
    cartaAEditar || {
      nombre: '',
      cliente_institucion: '',
      tematica: '',
      estado: 'borrador',
      descripcion: ''
    }
  );

  const [asignadosTempo, setAsignadosTempo] = useState<number[]>([]);
  const [filtroDisp, setFiltroDisp] = useState('');
  const [filtroAsig, setFiltroAsig] = useState('');

  useEffect(() => {
    cargarCatalogoCocteles();
    if (cartaAEditar) {
      cargarRelacionesCarta(cartaAEditar.id);
    }
  }, [cartaAEditar]);

  async function cargarCatalogoCocteles() {
    try {
      const { data, error } = await supabase
        .from('cocteles')
        .select('id, nombre, precio_venta_sugerido')
        .order('nombre');
      if (error) throw error;
      setCoctelesGlobales(data || []);
    } catch (e: any) {
      console.error('Error cargando cócteles:', e.message);
    }
  }

  async function cargarRelacionesCarta(cartaId: number) {
    try {
      const { data, error } = await supabase
        .from('carta_cocteles')
        .select('coctel_id')
        .eq('carta_id', cartaId);
      if (error) throw error;
      setAsignadosTempo(data ? data.map(d => d.coctel_id) : []);
    } catch (e: any) {
      console.error('Error cargando cócteles de la carta:', e.message);
    }
  }

  const handleChange = (campo: keyof Carta, valor: any) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const slugBase = (formData.nombre || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload: Partial<Carta> = {
        ...formData,
        slug: cartaAEditar ? cartaAEditar.slug : `${slugBase}-${Date.now()}`
      };
      await onGuardar(payload, asignadosTempo);
      onCerrar();
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const moverCoctel = (id: number, accion: 'asignar' | 'quitar') => {
    if (accion === 'asignar') {
      if (!asignadosTempo.includes(id)) {
        setAsignadosTempo([...asignadosTempo, id]);
      }
    } else {
      setAsignadosTempo(asignadosTempo.filter(cid => cid !== id));
    }
  };

  const dispFiltrados = coctelesGlobales
    .filter(c => !asignadosTempo.includes(c.id))
    .filter(c => c.nombre.toLowerCase().includes(filtroDisp.toLowerCase()));

  const asigFiltrados = asignadosTempo
    .map(id => coctelesGlobales.find(c => c.id === id))
    .filter(Boolean)
    .filter(c => c?.nombre.toLowerCase().includes(filtroAsig.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-slate-950 p-4 md:p-6 animate-fade-in overflow-y-auto custom-scrollbar text-slate-100">
      
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6 shrink-0">
        <div>
          <button 
            type="button" 
            onClick={onCerrar}
            className="text-xs font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={14} /> Volver
          </button>
          <h2 className="text-2xl font-bold tracking-wide">
            {cartaAEditar ? 'Editar Carta' : 'Crear Nueva Carta'}
          </h2>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
          <Button variant="primary" icon={<Save size={16} />} onClick={handleSubmit} disabled={cargando}>
            {cargando ? 'Guardando...' : 'Guardar Carta'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto w-full pb-10">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Nombre de la Carta *" 
              value={formData.nombre || ''} 
              onChange={e => handleChange('nombre', e.target.value)} 
              required 
            />
            <Input 
              label="Cliente / Institución" 
              value={formData.cliente_institucion || ''} 
              onChange={e => handleChange('cliente_institucion', e.target.value)} 
            />
            <Input 
              label="Temática" 
              value={formData.tematica || ''} 
              onChange={e => handleChange('tematica', e.target.value)} 
            />
            <Select 
              label="Estado" 
              value={formData.estado || 'borrador'} 
              onChange={e => handleChange('estado', e.target.value)}
            >
              <option value="activa">Activa</option>
              <option value="borrador">Borrador</option>
              <option value="archivada">Archivada</option>
            </Select>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono block">Descripción</label>
              <textarea 
                value={formData.descripcion || ''} 
                onChange={e => handleChange('descripcion', e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition shadow-inner resize-y"
                placeholder="Descripción conceptual de la carta..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
            Asignación de Cócteles al Menú
          </h3>
          
          <DualAsignador
            tituloIzq="Asignados a la Carta"
            contadorIzq={asignadosTempo.length}
            iconoIzq="✅"
            placeholderBusquedaIzq="Filtrar asignados..."
            valorBusquedaIzq={filtroAsig}
            onChangeBusquedaIzq={e => setFiltroAsig(e.target.value)}
            childrenIzq={
              asigFiltrados.length === 0 ? (
                <div className="text-xs text-slate-600 text-center py-10 font-mono">Sin cócteles asignados.</div>
              ) : (
                asigFiltrados.map(c => c && (
                  <div key={c.id} className="flex items-center justify-between bg-emerald-950/20 p-2 rounded-xl border border-emerald-900/30">
                    <span className="text-xs text-emerald-400 font-bold truncate pr-2">{c.nombre}</span>
                    <Button 
                      type="button" 
                      variant="inline-danger" 
                      size="sm" 
                      onClick={() => moverCoctel(c.id, 'quitar')}
                      className="h-7 px-2 text-[10px]"
                    >
                      <X size={12} /> Quitar
                    </Button>
                  </div>
                ))
              )
            }

            tituloDer="Catálogo General"
            iconoDer="📋"
            placeholderBusquedaDer="Buscar cóctel..."
            valorBusquedaDer={filtroDisp}
            onChangeBusquedaDer={e => setFiltroDisp(e.target.value)}
            childrenDer={
              dispFiltrados.length === 0 ? (
                <div className="text-xs text-slate-600 text-center py-10 font-mono">No hay resultados.</div>
              ) : (
                dispFiltrados.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition">
                    <span className="text-xs text-slate-300 truncate pr-2">{c.nombre}</span>
                    <Button 
                      type="button" 
                      variant="inline" 
                      size="sm" 
                      onClick={() => moverCoctel(c.id, 'asignar')}
                      className="h-7 px-2 text-[10px]"
                    >
                      <Plus size={12} /> Agregar
                    </Button>
                  </div>
                ))
              )
            }
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
          <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
          <Button variant="primary" icon={<Save size={16} />} onClick={handleSubmit}>
            Guardar Carta y Cócteles
          </Button>
        </div>

      </form>
    </div>
  );
}

export default CartaFormView;