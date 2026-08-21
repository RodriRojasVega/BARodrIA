// src/modules/subrecetas/components/SubRecetasForm.tsx
import { useState, useMemo } from 'react';
import { Save, Plus, TestTube } from 'lucide-react';

// Componentes del UI Kit
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { DynamicIngredientRow } from '@/components/ui/DynamicIngredientRow';

// Tipos
import type { SubRecetaItem } from './SubRecetasList';
import type { TipoSubReceta, IngredienteBOM, PasoPreparacion } from '@/types/subrecetas';
import type { Insumo } from '@/types/insumos';

interface Props {
  subRecetaBase?: SubRecetaItem | null;
  insumosDisponibles: Insumo[];
  ingredientesBase: IngredienteBOM[];
  pasosBase: PasoPreparacion[];
  tipos: TipoSubReceta[];
  onGuardar: (payload: any, ingredientes: IngredienteBOM[], pasos: PasoPreparacion[]) => void;
  onCancelar: () => void;
}

export function SubRecetasForm({ 
  subRecetaBase, 
  insumosDisponibles, 
  ingredientesBase, 
  pasosBase, 
  tipos,
  onGuardar, 
  onCancelar 
}: Props) {
  
  const [nombre, setNombre] = useState(subRecetaBase?.nombre || '');
  const [tipoId, setTipoId] = useState(subRecetaBase?.tipo_id?.toString() || '');
  const [rendimiento] = useState(subRecetaBase?.rendimiento_batch?.toString() || '1000');
  const [unidadRendimiento] = useState<'ml'|'g'|'unit'>(subRecetaBase?.unidad_rendimiento || 'ml');
  const [insumoEspejo] = useState(subRecetaBase?.insumo_asociado_id?.toString() || '');
  
  const [instrucciones] = useState(subRecetaBase?.indicaciones_almacenamiento || '');
  const [mermas] = useState(subRecetaBase?.control_mermas_economia_circular || '');
  const [vidaUtil] = useState(subRecetaBase?.vida_util || '');

  const [ingredientes, setIngredientes] = useState<IngredienteBOM[]>(ingredientesBase);
  const [pasos] = useState<PasoPreparacion[]>(pasosBase);

  const updateIngrediente = (index: number, field: string, value: any) => {
    setIngredientes(prev => prev.map((ing, i) => {
      if (i !== index) return ing;
      const updated = { ...ing, [field]: value };
      if (field === 'insumo_id') {
        const ref = insumosDisponibles.find(item => item.id === Number(value));
        if (ref) updated.unidad_medida = ref.unidad_medida;
      }
      return updated;
    }));
  };

  const { costoLote, costoUnitario } = useMemo(() => {
    let totalLote = 0;
    ingredientes.forEach(ing => {
      const insRef = insumosDisponibles.find(i => i.id === ing.insumo_id);
      if (insRef) totalLote += (ing.cantidad * insRef.costo_unitario);
    });
    const r = parseFloat(rendimiento) || 0;
    return { costoLote: totalLote, costoUnitario: r > 0 ? (totalLote / r) : 0 };
  }, [ingredientes, rendimiento, insumosDisponibles]);

  const handleGuardarClick = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre: nombre.trim(),
      tipo_id: parseInt(tipoId) || null,
      rendimiento_batch: parseFloat(rendimiento) || 0,
      unidad_rendimiento: unidadRendimiento,
      insumo_asociado_id: parseInt(insumoEspejo) || null,
      indicaciones_almacenamiento: instrucciones,
      vida_util: vidaUtil,
      control_mermas_economia_circular: mermas.trim() === '' ? null : mermas
    };
    
    const ingredientesLimpios = ingredientes.filter(i => i.insumo_id > 0 && i.cantidad > 0);
    onGuardar(payload, ingredientesLimpios, pasos);
  };

  return (
    <form onSubmit={handleGuardarClick} className="flex flex-col h-full w-full space-y-6 p-6 bg-background">
      <ModuleHeader 
        icon={<TestTube size={20} />}
        title={subRecetaBase ? 'Editar Sub-receta' : 'Nueva Sub-receta'}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onCancelar}>Volver</Button>
            <Button type="submit" variant="primary" size="sm" icon={<Save size={14} />}>Guardar</Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto space-y-10 pr-2">
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border pb-2">Identificación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
            <Select label="Categoría" value={tipoId} onChange={e => setTipoId(e.target.value)}>
              <option value="">Seleccione...</option>
              {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </Select>
          </div>
        </section>

        <section className="space-y-4">
           <div className="flex justify-between items-center border-b border-border pb-2">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Ingredientes (BOM)</h3>
            <Button variant="secondary" size="sm" icon={<Plus size={14}/>} onClick={() => setIngredientes([...ingredientes, { insumo_id: 0, cantidad: 0, unidad_medida: '' }])}>Agregar</Button>
          </div>
          {ingredientes.map((ing, idx) => (
             <DynamicIngredientRow key={idx} onRemove={() => setIngredientes(ingredientes.filter((_, i) => i !== idx))}>
               <div className="sm:col-span-8">
                 <Select value={ing.insumo_id.toString()} onChange={v => updateIngrediente(idx, 'insumo_id', v)}>
                    <option value="0">Seleccione insumo...</option>
                    {insumosDisponibles.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                 </Select>
               </div>
               <div className="sm:col-span-4 flex items-center gap-2">
                 <Input type="number" value={ing.cantidad} onChange={v => updateIngrediente(idx, 'cantidad', v)} />
                 <span className="text-xs text-muted w-10">{ing.unidad_medida}</span>
               </div>
             </DynamicIngredientRow>
          ))}
        </section>

        <section className="grid grid-cols-2 gap-4">
           <SummaryCard label="Costo Lote" value={`$${costoLote.toFixed(2)}`} />
           <SummaryCard label="Costo Unitario" value={`$${costoUnitario.toFixed(4)}`} valueClassName="text-primary" />
        </section>
      </div>
    </form>
  );
}