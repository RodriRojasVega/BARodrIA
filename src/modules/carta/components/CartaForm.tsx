// src/modules/carta/components/CartaForm.tsx
import { useState, useEffect, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Plus, X, ScrollText } from 'lucide-react';
import type { Carta, CartaEstado } from '@/types/carta';
import type { CoctelCatalogoItem } from '../hooks/useCartas';

// UI Kit Maestro 2.0
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { DualAsignador } from '@/components/ui/DualAsignador';
import { ModuleHeader } from '@/components/ui/ModuleHeader';

interface CartaFormProps {
  cartaAEditar?: Carta | null;
  coctelesDisponibles: CoctelCatalogoItem[];
  onCargarCocteles: () => Promise<void>;
  onCerrar: () => void;
  onGuardar: (_cartaData: Partial<Carta>, _coctelIds: number[]) => Promise<void>;
}

export function CartaForm({ cartaAEditar, coctelesDisponibles, onCargarCocteles, onCerrar, onGuardar }: CartaFormProps) {
  const [cargando, setCargando] = useState(false);
  
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

  // Carga inicial
  useEffect(() => {
    onCargarCocteles();
    
    // Si estamos editando, cargar relaciones existentes desde Supabase
    if (cartaAEditar) {
      const cargarRelacionesCarta = async () => {
        try {
          const { data, error } = await supabase
            .from('carta_cocteles')
            .select('coctel_id')
            .eq('carta_id', cartaAEditar.id);
          if (error) throw error;
          setAsignadosTempo(data ? data.map(d => d.coctel_id) : []);
        } catch (error: unknown) {
          console.error('Error cargando cócteles de la carta:', (error as Error).message);
        }
      };
      cargarRelacionesCarta();
    }
  }, [cartaAEditar, onCargarCocteles]);

  const handleChange = (campo: keyof Carta, valor: string) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const slugBase = (formData.nombre || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload: Partial<Carta> = {
        ...formData,
        slug: cartaAEditar ? cartaAEditar.slug : `${slugBase}-${Date.now()}`
      };
      await onGuardar(payload, asignadosTempo);
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

  // Filtrado de Dual Asignador
  const dispFiltrados = coctelesDisponibles
    .filter(c => !asignadosTempo.includes(c.id))
    .filter(c => c.nombre.toLowerCase().includes(filtroDisp.toLowerCase()));

  const asigFiltrados = asignadosTempo
    .map(id => coctelesDisponibles.find(c => c.id === id))
    .filter((c): c is CoctelCatalogoItem => c !== undefined)
    .filter(c => c.nombre.toLowerCase().includes(filtroAsig.toLowerCase()));

  return (
    <div className="flex flex-col min-h-full w-full space-y-4 p-4 md:p-6 bg-background text-foreground animate-fade-in overflow-hidden">
      
      <ModuleHeader 
        icon={<ScrollText size={20} />}
        title={cartaAEditar ? 'Editar Carta' : 'Crear Nueva Carta'}
        primaryAction={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={onCerrar}>
              Volver
            </Button>
            <Button variant="primary" size="sm" icon={<Save size={14} />} onClick={handleSubmit} disabled={cargando}>
              {cargando ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pr-2 pb-6">
        
        {/* SECCIÓN 1: DATOS GENERALES */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-primary font-mono uppercase tracking-wider border-b border-border pb-2">1. Datos Generales de la Carta</h3>
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
              onChange={e => handleChange('estado', e.target.value as CartaEstado)}
            >
              <option value="activa">Activa</option>
              <option value="borrador">Borrador</option>
              <option value="archivada">Archivada</option>
            </Select>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono uppercase text-muted mb-1">Descripción Concepto</label>
              <Textarea 
                value={formData.descripcion || ''} 
                onChange={e => handleChange('descripcion', e.target.value)}
                rows={2}
                placeholder="Descripción conceptual de la carta..."
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: DUAL ASIGNADOR */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-primary font-mono uppercase tracking-wider border-b border-border pb-2">
            2. Asignación de Cócteles al Menú
          </h3>
          
          <DualAsignador
            tituloIzq="Asignados a la Carta"
            contadorIzq={asignadosTempo.length}
            iconoIzq="✅"
            placeholderBusquedaIzq="Filtrar asignados..."
            valorBusquedaIzq={filtroAsig}
            onChangeBusquedaIzq={val => setFiltroAsig(val)}
            childrenIzq={
              asigFiltrados.length === 0 ? (
                <div className="text-xs text-muted text-center py-10 font-mono">Sin cócteles asignados.</div>
              ) : (
                asigFiltrados.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-surface border border-border p-2 rounded-xl mb-2">
                    <span className="text-xs text-primary font-bold truncate pr-2">{c.nombre}</span>
                    <Button 
                      type="button" variant="inline-danger" size="sm" 
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
            onChangeBusquedaDer={val => setFiltroAsig(val)}
            childrenDer={
              dispFiltrados.length === 0 ? (
                <div className="text-xs text-muted text-center py-10 font-mono">No hay resultados.</div>
              ) : (
                dispFiltrados.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-surface border border-border p-2 rounded-xl mb-2 hover:border-primary/30 transition">
                    <span className="text-xs text-foreground truncate pr-2">{c.nombre}</span>
                    <Button 
                      type="button" variant="inline" size="sm" 
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
        </section>
      </div>
    </div>
  );
}