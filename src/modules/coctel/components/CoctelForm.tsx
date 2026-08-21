// src/modules/coctel/components/CoctelForm.tsx
import { useState, useMemo, useEffect, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Plus, Martini } from 'lucide-react';
import type { Coctel } from '@/types/coctel';
import type { Insumo } from '@/types/insumos';

// UI Kit Maestro
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { DynamicRow } from '@/components/ui/DynamicRow';
import { DynamicIngredientRow } from '@/components/ui/DynamicIngredientRow';

export interface CatalogItem {
  id: number;
  nombre: string;
  dilucion_estimada_porcentaje?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface CatalogosState {
  categorias: CatalogItem[];
  familias: CatalogItem[];
  soportes: CatalogItem[];
  hielos: CatalogItem[];
  tecnicas: CatalogItem[];
}

export interface IngredienteRow {
  insumo_id: number;
  cantidad: number;
  unidad_medida: string;
}

export interface PasoRow {
  id?: number;
  numero_paso?: number;
  descripcion: string;
  es_critico?: boolean;
}

interface CoctelFormProps {
  coctelAEditar?: Coctel | null;
  onCerrar: () => void;
  onGuardar: (_datos: Partial<Coctel>, _ingredientes: IngredienteRow[], _pasos: PasoRow[]) => Promise<void>;
}

export function CoctelForm({ coctelAEditar, onCerrar, onGuardar }: CoctelFormProps) {
  const [cargando, setCargando] = useState(false);
  const [insumosGlobales, setInsumosGlobales] = useState<Insumo[]>([]);
  const [catalogos, setCatalogos] = useState<CatalogosState>({ 
    categorias: [], 
    familias: [], 
    soportes: [], 
    hielos: [], 
    tecnicas: [] 
  });
  
  const [formData, setFormData] = useState<Partial<Coctel>>(
    coctelAEditar || {
      nombre: '', 
      slug: '', 
      categoria_id: 0, 
      familia_id: 0, 
      soporte_id: 0, 
      hielo_id: 0, 
      tecnica_id: 0, 
      reseña_inspiracion: '', 
      reseña_vista: '', 
      reseña_nariz: '', 
      reseña_boca: '',
      maridaje_propuesta: '',
      maridaje_justificacion: '',
      maridaje_alternativa: '',
      tips: ''
    }
  );

  const [ingredientes, setIngredientes] = useState<IngredienteRow[]>([]);
  const [pasos, setPasos] = useState<PasoRow[]>([]);

  // 1. CARGA DE CATÁLOGOS E INSUMOS
  useEffect(() => {
    async function cargarDependencias() {
      const [insRes, catRes, famRes, sopRes, hieRes, tecRes] = await Promise.all([
        supabase.from('insumos').select('*'),
        supabase.from('categorias').select('*'),
        supabase.from('familias').select('*'),
        supabase.from('soportes').select('*'),
        supabase.from('hielos').select('*'),
        supabase.from('tecnicas').select('*')
      ]);
      setInsumosGlobales((insRes.data as Insumo[]) || []);
      setCatalogos({
        categorias: (catRes.data as CatalogItem[]) || [], 
        familias: (famRes.data as CatalogItem[]) || [],
        soportes: (sopRes.data as CatalogItem[]) || [], 
        hielos: (hieRes.data as CatalogItem[]) || [], 
        tecnicas: (tecRes.data as CatalogItem[]) || []
      });

      if (coctelAEditar) {
        const { data: ings } = await supabase.from('coctel_ingredientes').select('*').eq('coctel_id', coctelAEditar.id);
        const { data: steps } = await supabase.from('coctel_pasos_preparacion').select('*').eq('coctel_id', coctelAEditar.id).order('numero_paso');
        setIngredientes((ings as IngredienteRow[]) || []);
        setPasos((steps as PasoRow[]) || []);
      }
    }
    cargarDependencias();
  }, [coctelAEditar]);

  // 2. EL MOTOR DE CÁLCULO FÍSICO (Reactivo en tiempo real)
  const fisicos = useMemo(() => {
    let costoTotal = 0;
    let volLiquidoTotal = 0;
    let alcPuroTotal = 0;

    ingredientes.forEach(item => {
      const ins = insumosGlobales.find(x => x.id === item.insumo_id);
      if (!ins) return;

      const cant = Number(item.cantidad) || 0;
      const cu = Number(ins.costo_unitario) || 0;
      const abv = Number(ins.graduacion_alcohol_base) || 0;

      costoTotal += cant * cu;
      if (item.unidad_medida === 'ml') {
        volLiquidoTotal += cant;
        alcPuroTotal += cant * (abv / 100);
      }
    });

    const tecObj = catalogos.tecnicas.find(t => t.id === Number(formData.tecnica_id));
    const dilucion = tecObj ? (Number(tecObj.dilucion_estimada_porcentaje) || 0) : 0;
    
    const volConDilucion = volLiquidoTotal * (1 + dilucion);
    const abvFinal = volConDilucion > 0 ? (alcPuroTotal / volConDilucion) * 100 : 0;

    return {
      costo: costoTotal,
      precioSugerido: costoTotal * 8.0,
      abv: abvFinal
    };
  }, [ingredientes, formData.tecnica_id, insumosGlobales, catalogos]);

  const handleInputChange = (field: keyof Coctel, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateIngrediente = (index: number, field: keyof IngredienteRow, value: any) => {
    const newIngs = [...ingredientes];
    if (field === 'insumo_id') {
      const valNum = Number(value);
      newIngs[index].insumo_id = valNum;
      const ref = insumosGlobales.find(i => i.id === valNum);
      if (ref) newIngs[index].unidad_medida = ref.unidad_medida;
    } else if (field === 'cantidad') {
      newIngs[index].cantidad = value === '' ? 0 : Number(value);
    }
    setIngredientes(newIngs);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    
    const slugGenerado = (formData.nombre || '')
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, '-');

    const payloadCompleto: Partial<Coctel> = {
      ...formData,
      slug: slugGenerado,
      costo_produccion: fisicos.costo,
      precio_venta_sugerido: fisicos.precioSugerido,
      grado_alcohol: fisicos.abv,
      porcentaje_azucar: 12.5 
    };

    try {
      await onGuardar(payloadCompleto, ingredientes, pasos);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full w-full space-y-4 p-4 md:p-6 bg-background text-foreground animate-fade-in overflow-hidden">
      
      {/* MODULE HEADER */}
      <ModuleHeader 
        icon={<Martini size={20} />}
        title={coctelAEditar ? 'Editar Cóctel' : 'Nuevo Cóctel'}
        // subtitle="Configuración de parámetros, balance químico, escandallo y notas sensoriales." // Comentado para mayor limpieza
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
        
        {/* SECCIÓN 1: IDENTIFICACIÓN Y TAXONOMÍA */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-primary font-mono uppercase tracking-wider border-b border-border pb-2">1. Taxonomía y Datos Generales</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <label className="block text-xs font-mono uppercase text-muted mb-1">Nombre del Cóctel</label>
              <Input 
                value={formData.nombre || ''} 
                onChange={e => handleInputChange('nombre', e.target.value)} 
                placeholder="Ej. Negroni Botánico..." 
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">Categoría</label>
              <Select value={formData.categoria_id || ''} onChange={e => handleInputChange('categoria_id', Number(e.target.value))}>
                <option value="">Seleccione categoría...</option>
                {catalogos.categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">Familia de Sabor</label>
              <Select value={formData.familia_id || ''} onChange={e => handleInputChange('familia_id', Number(e.target.value))}>
                <option value="">Seleccione familia...</option>
                {catalogos.familias.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">Soporte (Vaso / Copa)</label>
              <Select value={formData.soporte_id || ''} onChange={e => handleInputChange('soporte_id', Number(e.target.value))}>
                <option value="">Seleccione soporte...</option>
                {catalogos.soportes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">Tipo de Hielo</label>
              <Select value={formData.hielo_id || ''} onChange={e => handleInputChange('hielo_id', Number(e.target.value))}>
                <option value="">Seleccione hielo...</option>
                {catalogos.hielos.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">Técnica de Elaboración</label>
              <Select value={formData.tecnica_id || ''} onChange={e => handleInputChange('tecnica_id', Number(e.target.value))}>
                <option value="">Seleccione técnica...</option>
                {catalogos.tecnicas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </Select>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: BALANCE LÍQUIDO (BOM) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h3 className="text-sm font-bold text-primary font-mono uppercase tracking-wider">2. Balance Líquido (Ingredientes)</h3>
            <Button variant="secondary" size="sm" icon={<Plus size={14}/>} onClick={() => setIngredientes([...ingredientes, { insumo_id: 0, cantidad: 0, unidad_medida: 'ml' }])}>
              Agregar Ingrediente
            </Button>
          </div>

          <div className="space-y-2">
            {ingredientes.length === 0 ? (
              <p className="text-xs text-muted font-mono py-4 text-center border border-dashed border-border rounded-lg">
                No hay ingredientes asignados. Presiona "Agregar Ingrediente" para configurar la receta.
              </p>
            ) : (
              ingredientes.map((ing, idx) => (
                <DynamicIngredientRow key={idx} onRemove={() => setIngredientes(ingredientes.filter((_, i) => i !== idx))}>
                  <div className="sm:col-span-8">
                    <Select value={ing.insumo_id || ''} onChange={e => updateIngrediente(idx, 'insumo_id', e.target.value)}>
                      <option value="">Seleccione insumo o sub-receta...</option>
                      {insumosGlobales.map(i => (
                        <option key={i.id} value={i.id}>{i.nombre} (${i.costo_unitario}/{i.unidad_medida})</option>
                      ))}
                    </Select>
                  </div>
                  <div className="sm:col-span-4 flex items-center gap-2">
                    <div className="flex-1">
                      <Input type="number" value={ing.cantidad === 0 ? '' : ing.cantidad} onChange={e => updateIngrediente(idx, 'cantidad', e.target.value)} placeholder="Cant." />
                    </div>
                    <span className="text-xs text-muted font-mono w-10 text-right">{ing.unidad_medida || '-'}</span>
                  </div>
                </DynamicIngredientRow>
              ))
            )}
          </div>
        </section>

        {/* SECCIÓN 2.5: KPIs CALCULADOS EN TIEMPO REAL (Ubicados directamente después de los ingredientes) */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard label="COGS / Costo Producción" value={`$${fisicos.costo.toFixed(0)}`} valueClassName="text-foreground/80 font-mono" />
            <SummaryCard label="Precio Sugerido (8.0x)" value={`$${fisicos.precioSugerido.toFixed(0)}`} valueClassName="text-primary font-bold font-mono" />
            <SummaryCard label="Alcohol (ABV Final)" value={`${fisicos.abv.toFixed(1)}%`} valueClassName="text-info font-mono" />
            <SummaryCard label="Azúcar Estimada (w/v)" value="12.5%" valueClassName="text-warning font-mono" />
          </div>
        </section>

        {/* SECCIÓN 3: SECUENCIA OPERATIVA */}
        <section className="space-y-4 pt-2">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h3 className="text-sm font-bold text-primary font-mono uppercase tracking-wider">3. Secuencia Operativa</h3>
            <Button variant="secondary" size="sm" icon={<Plus size={14}/>} onClick={() => setPasos([...pasos, { descripcion: '', es_critico: false }])}>
              Agregar Paso
            </Button>
          </div>

          <div className="space-y-2">
            {pasos.length === 0 ? (
              <p className="text-xs text-muted font-mono py-4 text-center border border-dashed border-border rounded-lg">
                Sin pasos operativos definidos.
              </p>
            ) : (
              pasos.map((paso, idx) => (
                <DynamicRow key={idx} onRemove={() => setPasos(pasos.filter((_, i) => i !== idx))}>
                  <span className="font-mono text-primary font-bold text-sm w-6 shrink-0">{idx + 1}.</span>
                  <div className="flex-1">
                    <Textarea 
                      rows={2}
                      value={paso.descripcion} 
                      onChange={e => setPasos(pasos.map((p, i) => i === idx ? { ...p, descripcion: e.target.value } : p))}
                      placeholder="Describa la instrucción del paso..."
                    />
                  </div>
                  <div className="flex items-center gap-2 px-2 shrink-0">
                    <label className="text-[10px] font-mono text-muted uppercase cursor-pointer flex items-center gap-1">
                      <input 
                        type="checkbox" 
                        checked={paso.es_critico || false} 
                        onChange={e => setPasos(pasos.map((p, i) => i === idx ? { ...p, es_critico: e.target.checked } : p))}
                        className="rounded border-border bg-background text-primary"
                      />
                      Crítico
                    </label>
                  </div>
                </DynamicRow>
              ))
            )}
          </div>
          
          {/* Tips de Barra ubicados como Textarea post-elaboración */}
          <div className="pt-2">
            <label className="block text-xs font-mono uppercase text-muted mb-1">Tips de Barra / Sugerencias de Servicio</label>
            <Textarea 
              value={formData.tips || ''} 
              onChange={e => handleInputChange('tips', e.target.value)} 
              rows={2}
              placeholder="Ej: Servir con vaso pre-enfriado o decorar antes de verter..." 
            />
          </div>
        </section>

        {/* SECCIÓN 4: CATA Y SENSORIAL */}
        <section className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-info font-mono uppercase tracking-wider border-b border-border pb-2">4. Storytelling, Cata y Maridaje</h3>
          <div className="space-y-4">
            
            {/* Storytelling */}
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">Storytelling & Inspiración</label>
              <Textarea 
                value={formData.reseña_inspiracion || ''} 
                onChange={e => handleInputChange('reseña_inspiracion', e.target.value)} 
                rows={3}
                placeholder="Historia, concepto o inspiración detrás del trago..."
              />
            </div>

            {/* Cata visual en 1 línea */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-success mb-1">👁️ Vista (Aspecto)</label>
                <Textarea value={formData.reseña_vista || ''} onChange={e => handleInputChange('reseña_vista', e.target.value)} rows={2} placeholder="Ej: Brillante, tono ámbar..." />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-warning mb-1">👃 Nariz (Aromas)</label>
                <Textarea value={formData.reseña_nariz || ''} onChange={e => handleInputChange('reseña_nariz', e.target.value)} rows={2} placeholder="Ej: Notas cítricas y vainilla..." />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-info mb-1">👄 Boca (Paladar)</label>
                <Textarea value={formData.reseña_boca || ''} onChange={e => handleInputChange('reseña_boca', e.target.value)} rows={2} placeholder="Ej: Sedoso, final seco..." />
              </div>
            </div>

            {/* Maridaje en 1 línea */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">Propuesta de Maridaje</label>
                <Textarea value={formData.maridaje_propuesta || ''} onChange={e => handleInputChange('maridaje_propuesta', e.target.value)} rows={2} placeholder="Ej: Ceviche clásico..." />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">Justificación del Maridaje</label>
                <Textarea value={formData.maridaje_justificacion || ''} onChange={e => handleInputChange('maridaje_justificacion', e.target.value)} rows={2} placeholder="Ej: Contraste de acidez..." />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">Alternativa</label>
                <Textarea value={formData.maridaje_alternativa || ''} onChange={e => handleInputChange('maridaje_alternativa', e.target.value)} rows={2} placeholder="Ej: Quesos maduros..." />
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}