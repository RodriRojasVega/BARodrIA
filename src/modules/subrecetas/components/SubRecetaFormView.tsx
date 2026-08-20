// src/modules/subrecetas/components/SubRecetaFormView.tsx
import { useState, useMemo } from 'react';
import { ArrowLeft, Save, Plus, TestTube } from 'lucide-react';

// Componentes del UI Kit
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { DynamicRow } from '@/components/ui/DynamicRow';
import { DynamicIngredientRow } from '@/components/ui/DynamicIngredientRow';

import type { SubRecetaViewItem } from './SubRecetasListView';
import type { TipoSubReceta } from '@/types/subrecetas';

interface Props {
  subRecetaBase?: SubRecetaViewItem | null;
  insumosDisponibles: any[];
  ingredientesBase: any[];
  pasosBase: any[];
  tipos: TipoSubReceta[];
  onGuardar: (payload: any, ingredientes: any[], pasos: any[]) => void;
  onCancelar: () => void;
}

export function SubRecetaFormView({ 
  subRecetaBase, 
  insumosDisponibles, 
  ingredientesBase, 
  pasosBase, 
  tipos,
  onGuardar, 
  onCancelar 
}: Props) {
  
  // 1. Datos Generales
  const [nombre, setNombre] = useState(subRecetaBase?.nombre || '');
  const [tipoId, setTipoId] = useState(subRecetaBase?.tipo_id?.toString() || '');
  const [rendimiento, setRendimiento] = useState(subRecetaBase?.rendimiento_batch?.toString() || '1000');
  const [unidadRendimiento, setUnidadRendimiento] = useState(subRecetaBase?.unidad_rendimiento || 'ml');
  const [insumoEspejo, setInsumoEspejo] = useState(subRecetaBase?.insumo_asociado_id?.toString() || '');
  
  // 2. Almacenamiento y Detalles
  const [instrucciones, setInstrucciones] = useState(subRecetaBase?.indicaciones_almacenamiento || '');
  const [mermas, setMermas] = useState(subRecetaBase?.control_mermas_economia_circular || '');
  const [vidaUtil, setVidaUtil] = useState(subRecetaBase?.vida_util || '');

  // 3. Arreglos Dinámicos (BOM y Pasos)
  const [ingredientes, setIngredientes] = useState<any[]>(ingredientesBase);
  const [pasos, setPasos] = useState<any[]>(pasosBase);

  // Manejador del BOM (Ingredientes)
  const updateIngrediente = (index: number, field: string, value: any) => {
    const newIngs = [...ingredientes];
    if (field === 'insumo_id') {
      const valNum = Number(value);
      newIngs[index].insumo_id = valNum;
      const ref = insumosDisponibles.find(i => i.id === valNum);
      if (ref) newIngs[index].unidad_medida = ref.unidad_medida;
    } else if (field === 'cantidad') {
      newIngs[index].cantidad = value === '' ? 0 : Number(value);
    }
    setIngredientes(newIngs);
  };

  // Cálculos reactivos de costos
  const { costoLote, costoUnitario } = useMemo(() => {
    let totalLote = 0;
    ingredientes.forEach(ing => {
      const insRef = insumosDisponibles.find(i => i.id === ing.insumo_id);
      if (insRef) totalLote += (ing.cantidad * insRef.costo_unitario);
    });
    const r = parseFloat(rendimiento) || 0;
    return { costoLote: totalLote, costoUnitario: r > 0 ? (totalLote / r) : 0 };
  }, [ingredientes, rendimiento, insumosDisponibles]);

  // Submit
  const handleGuardarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const payload: any = {
      nombre: nombre.trim(),
      slug: nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").trim().replace(/\s+/g, '-'),
      tipo_id: parseInt(tipoId) || null,
      rendimiento_batch: parseFloat(rendimiento) || 0,
      unidad_rendimiento: unidadRendimiento,
      insumo_asociado_id: parseInt(insumoEspejo) || null,
      elaboracion_instrucciones: 'Ver pasos',
      indicaciones_almacenamiento: instrucciones,
      vida_util: vidaUtil,
      control_mermas_economia_circular: mermas.trim() === '' ? null : mermas,
      garnish_relacionado_id: null
    };
    if (subRecetaBase?.id) payload.id = subRecetaBase.id;
    
    const ingredientesLimpios = ingredientes.filter(i => i.insumo_id > 0 && i.cantidad > 0);
    onGuardar(payload, ingredientesLimpios, pasos);
  };

  return (
    // 1. APLICAMOS EL PADDING AL CONTENEDOR PRINCIPAL (Igual que en ListView)
    <div className="flex flex-col h-full w-full space-y-4 p-4 md:p-6 bg-background text-foreground animate-fade-in overflow-hidden">
      
      {/* HEADER DEL MÓDULO (Ahora respetará el margen de p-6) */}
      <ModuleHeader 
        icon={<TestTube size={20} />}
        title={subRecetaBase ? 'Editar Sub-receta' : 'Nueva Sub-receta'}
        //subtitle="Configuración de parámetros, receta (BOM) e instrucciones."
        primaryAction={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={onCancelar}>
              Volver
            </Button>
            <Button variant="primary" size="sm" icon={<Save size={14} />} onClick={handleGuardarClick}>
              Guardar Preparación
            </Button>
          </div>
        }
      />

      {/* CONTENEDOR SCROLLABLE (Le quitamos el p-4 md:p-6 para que se alinee perfectamente con el header) */}
      <div className="flex-1 overflow-y-auto space-y-10 custom-scrollbar pr-2 pb-6">
        
        {/* SECCIÓN 1: DATOS GENERALES */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-primary font-mono uppercase tracking-wider border-b border-border pb-2">1. Identificación y Parámetros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">Nombre de la Preparación</label>
              <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Jarabe Simple..." />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">Categoría</label>
              <Select value={tipoId} onChange={e => setTipoId(e.target.value)}>
                <option value="">Seleccione categoría...</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">Rendimiento Físico (Batch)</label>
              <div className="grid grid-cols-[2fr_1fr] gap-2">
                <div>
                  <Input type="number" value={rendimiento} onChange={e => setRendimiento(e.target.value)} />
                </div>
                <div>
                  <Select value={unidadRendimiento} onChange={e => setUnidadRendimiento(e.target.value as 'ml' | 'g' | 'unit')}>
                      <option value="ml">ml</option>
                      <option value="g">g</option>
                      <option value="unit">unit</option>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">Insumo Espejo (Virtual)</label>
              <Select value={insumoEspejo} onChange={e => setInsumoEspejo(e.target.value)}>
                <option value="">No vincular a inventario...</option>
                {insumosDisponibles.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
              </Select>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: RECETA / BOM */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h3 className="text-sm font-bold text-primary font-mono uppercase tracking-wider">2. Ingredientes (BOM)</h3>
            <Button 
              variant="secondary" 
              size="sm" 
              icon={<Plus size={14}/>} 
              onClick={() => setIngredientes([...ingredientes, { insumo_id: 0, cantidad: 0, unidad_medida: '' }])}
            >
              Agregar Insumo
            </Button>
          </div>
          
          <div className="space-y-2">
            {ingredientes.length === 0 ? (
              <p className="text-xs text-muted font-mono py-4 text-center border border-dashed border-border rounded-lg">
                No hay insumos agregados. Presiona "Agregar Insumo" para comenzar el escandallo.
              </p>
            ) : (
              ingredientes.map((ing, idx) => (
                <DynamicIngredientRow 
                  key={idx} 
                  onRemove={() => setIngredientes(ingredientes.filter((_, i) => i !== idx))}
                >
                  <div className="sm:col-span-8">
                    <Select 
                      value={ing.insumo_id || ''} 
                      onChange={e => updateIngrediente(idx, 'insumo_id', e.target.value)}
                    >
                      <option value="">Seleccione insumo...</option>
                      {insumosDisponibles.map(i => (
                        <option key={i.id} value={i.id}>{i.nombre} ({i.unidad_medida})</option>
                      ))}
                    </Select>
                  </div>
                  <div className="sm:col-span-4 flex items-center gap-2">
                    <div className="flex-1">
                      <Input 
                        type="number" 
                        value={ing.cantidad === 0 ? '' : ing.cantidad} 
                        onChange={e => updateIngrediente(idx, 'cantidad', e.target.value)} 
                        placeholder="Cant."
                      />
                    </div>
                    <span className="text-xs text-muted font-mono w-10 text-right">{ing.unidad_medida || '-'}</span>
                  </div>
                </DynamicIngredientRow>
              ))
            )}
          </div>
        </section>

        {/* SECCIÓN 3: PASOS */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h3 className="text-sm font-bold text-primary font-mono uppercase tracking-wider">3. Pasos de Preparación</h3>
            <Button 
              variant="secondary" 
              size="sm" 
              icon={<Plus size={14}/>} 
              onClick={() => setPasos([...pasos, { descripcion: '' }])}
            >
              Agregar Paso
            </Button>
          </div>
          
          <div className="space-y-2">
            {pasos.map((paso, idx) => (
              <DynamicRow key={idx} onRemove={() => setPasos(pasos.filter((_, i) => i !== idx))}>
                <span className="font-mono text-primary font-bold text-sm w-6 shrink-0">{idx + 1}.</span>
                <Textarea 
                  rows={2}
                  value={paso.descripcion} 
                  onChange={e => setPasos(pasos.map((p, i) => i === idx ? { descripcion: e.target.value } : p))}
                  placeholder="Describa la instrucción detallada..."
                />
              </DynamicRow>
            ))}
          </div>
        </section>

        {/* SECCIÓN 4: ALMACENAMIENTO */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-info font-mono uppercase tracking-wider border-b border-border pb-2">4. Almacenamiento & Economía Circular</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">Instrucciones de Guardado</label>
              <Textarea 
                value={instrucciones} 
                onChange={e => setInstrucciones(e.target.value)} 
                rows={3}
                placeholder="Ej: Refrigerar a 4°C, rotular con fecha..."
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">Manejo de Mermas</label>
              <Textarea 
                value={mermas} 
                onChange={e => setMermas(e.target.value)} 
                rows={3}
                placeholder="Ej: Usar cáscaras para oleo saccharum..."
              />
            </div>
            <div className="md:col-span-2 md:w-1/2">
              <label className="block text-xs font-mono uppercase text-muted mb-1">Vida Útil</label>
              <Input 
                value={vidaUtil} 
                onChange={e => setVidaUtil(e.target.value)} 
                placeholder="Ej: 15 días" 
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN 5: COSTOS */}
        <section className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryCard 
              label={`Costo Total del Lote (${rendimiento} ${unidadRendimiento})`} 
              value={`$${costoLote.toLocaleString('es-CL')}`} 
            />
            <SummaryCard 
              label={`Costo Unitario (por 1 ${unidadRendimiento})`} 
              value={`$${costoUnitario.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              valueClassName="text-primary"
            />
          </div>
        </section>

      </div>
    </div>
  );
}