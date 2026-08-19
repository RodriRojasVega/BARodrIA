import { useState, useMemo } from 'react';
import { ArrowLeft, Save, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { SubRecetaViewItem } from './SubRecetasListView';

interface Props {
  subRecetaBase?: SubRecetaViewItem | null;
  insumosDisponibles: any[];
  ingredientesBase: any[];
  pasosBase: any[];
  onGuardar: (payload: any, ingredientes: any[], pasos: any[]) => void;
  onCancelar: () => void;
}

export function SubRecetaFormView({ subRecetaBase, insumosDisponibles, ingredientesBase, pasosBase, onGuardar, onCancelar }: Props) {
  const [nombre, setNombre] = useState(subRecetaBase?.nombre || '');
  const [tipoId, setTipoId] = useState(subRecetaBase?.tipo_id?.toString() || '');
  const [rendimiento, setRendimiento] = useState(subRecetaBase?.rendimiento_batch?.toString() || '1000');
  const [unidadRendimiento, setUnidadRendimiento] = useState(subRecetaBase?.unidad_rendimiento || 'ml');
  const [insumoEspejo, setInsumoEspejo] = useState(subRecetaBase?.insumo_asociado_id?.toString() || '');
  const [instrucciones, setInstrucciones] = useState(subRecetaBase?.indicaciones_almacenamiento || '');
  const [mermas, setMermas] = useState(subRecetaBase?.control_mermas_economia_circular || '');
  const [vidaUtil, setVidaUtil] = useState(subRecetaBase?.vida_util || '');

  const [busquedaInsumo, setBusquedaInsumo] = useState('');
  const [ingredientes, setIngredientes] = useState<any[]>(ingredientesBase);
  const [pasos, setPasos] = useState<any[]>(pasosBase);

  const insumosFiltrados = useMemo(() => {
    const idsAsignados = ingredientes.map(i => i.insumo_id);
    return insumosDisponibles.filter(ins => !idsAsignados.includes(ins.id) && ins.nombre.toLowerCase().includes(busquedaInsumo.toLowerCase()));
  }, [busquedaInsumo, ingredientes, insumosDisponibles]);

  const { costoLote, costoUnitario } = useMemo(() => {
    let totalLote = 0;
    ingredientes.forEach(ing => {
      const insRef = insumosDisponibles.find(i => i.id === ing.insumo_id);
      if (insRef) totalLote += (ing.cantidad * insRef.costo_unitario);
    });
    const r = parseFloat(rendimiento) || 0;
    return { costoLote: totalLote, costoUnitario: r > 0 ? (totalLote / r) : 0 };
  }, [ingredientes, rendimiento, insumosDisponibles]);

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
    if (subRecetaBase?.id) payload.id = subRecetaBase.id; // Evita mandar id: undefined al crear
    onGuardar(payload, ingredientes, pasos);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in bg-slate-950 text-slate-100 overflow-hidden">
      <div className="bg-slate-900 border-b border-slate-800 p-6 shrink-0 flex justify-between items-center">
        <div>
          <button onClick={onCancelar} className="text-xs font-bold text-emerald-500 hover:text-emerald-400 mb-2 flex items-center gap-1"><ArrowLeft size={14}/> Volver</button>
          <h2 className="text-2xl font-bold">{subRecetaBase ? 'Editar Sub-receta' : 'Nueva Sub-receta'}</h2>
        </div>
        <Button variant="primary" icon={<Save size={14} />} onClick={handleGuardarClick}>Guardar Preparación</Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* IDENTIFICACIÓN */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2"><label className="block text-xs text-slate-400 mb-1">Nombre</label><Input value={nombre} onChange={e=>setNombre(e.target.value)} /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Tipo ID (Categoría)</label><Input type="number" value={tipoId} onChange={e=>setTipoId(e.target.value)} /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Rendimiento</label><Input type="number" value={rendimiento} onChange={e=>setRendimiento(e.target.value)} /></div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Unidad</label>
            <Select value={unidadRendimiento} onChange={e => setUnidadRendimiento(e.target.value as 'ml' | 'g' | 'unit')}>
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="unit">unit</option>
            </Select>
          </div>          
        <div>
            <label className="block text-xs text-slate-400 mb-1">Insumo Espejo</label>
            <Select value={insumoEspejo} onChange={e=>setInsumoEspejo(e.target.value)}>
              <option value="">Seleccione insumo destino...</option>
              {insumosDisponibles.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
            </Select>
          </div>
        </section>

        {/* ASIGNADOR DUAL */}
        <section className="grid grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-[350px] flex flex-col">
             <Input icon={<Search size={14}/>} placeholder="Buscar insumo..." value={busquedaInsumo} onChange={e=>setBusquedaInsumo(e.target.value)} className="mb-3"/>
             <div className="flex-1 overflow-y-auto">
               {insumosFiltrados.map(ins => (
                 <div key={ins.id} className="flex justify-between items-center bg-slate-950 p-2 mb-2 rounded border border-slate-800">
                    <div><p className="text-xs">{ins.nombre}</p><p className="text-[10px] text-slate-500">${ins.costo_unitario}/{ins.unidad_medida}</p></div>
                    <button onClick={() => setIngredientes([...ingredientes, {insumo_id: ins.id, cantidad: 100, unidad_medida: ins.unidad_medida}])} className="text-emerald-500 px-2 py-1">+</button>
                 </div>
               ))}
             </div>
          </div>
          <div className="bg-slate-900 border border-emerald-900/50 rounded-xl p-4 h-[350px] flex flex-col">
             <h4 className="text-xs text-emerald-400 mb-3">Insumos del Lote</h4>
             <div className="flex-1 overflow-y-auto">
               {ingredientes.map(ing => {
                  const ref = insumosDisponibles.find(i => i.id === ing.insumo_id);
                  return (
                    <div key={ing.insumo_id} className="flex items-center gap-2 bg-emerald-950/20 p-2 mb-2 rounded border border-emerald-900/30">
                      <p className="flex-1 text-xs text-emerald-400 truncate">{ref?.nombre}</p>
                      <input type="number" value={ing.cantidad} onChange={e => setIngredientes(ingredientes.map(i => i.insumo_id === ing.insumo_id ? {...i, cantidad: Number(e.target.value)} : i))} className="w-16 bg-slate-950 text-white rounded p-1 text-xs text-right"/>
                      <span className="text-xs text-slate-500">{ing.unidad_medida}</span>
                      <button onClick={() => setIngredientes(ingredientes.filter(i => i.insumo_id !== ing.insumo_id))} className="text-red-400"><X size={14}/></button>
                    </div>
                  )
               })}
             </div>
          </div>
        </section>

        {/* PASOS */}
        <section className="space-y-2">
          <div className="flex justify-between"><h3 className="text-xs text-purple-400 uppercase">Pasos</h3><button onClick={()=>setPasos([...pasos, {descripcion:''}])} className="text-xs text-purple-400">+ Agregar</button></div>
          {pasos.map((paso, i) => (
             <div key={i} className="flex items-center gap-2"><span className="text-purple-400">{i+1}.</span><Input value={paso.descripcion} onChange={e => setPasos(pasos.map((p, idx)=> idx===i ? {descripcion: e.target.value} : p))} className="flex-1" /><button onClick={()=>setPasos(pasos.filter((_, idx)=>idx!==i))} className="text-red-400"><X size={14}/></button></div>
          ))}
        </section>

        {/* 👇 INSERTA ESTE NUEVO BLOQUE 👇 */}
        {/* SECCIÓN 4: ALMACENAMIENTO & MERMAS */}
        <section className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">4. Almacenamiento & Mermas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Instrucciones de Guardado</label>
              <textarea 
                value={instrucciones} 
                onChange={e => setInstrucciones(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-100 outline-none focus:border-amber-500 transition-colors"
                rows={2}
                placeholder="Ej: Refrigerar a 4°C..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Manejo de Mermas (Eco Circular)</label>
              <textarea 
                value={mermas} 
                onChange={e => setMermas(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-100 outline-none focus:border-amber-500 transition-colors"
                rows={2}
                placeholder="Ej: Usar cáscaras para oleo saccharum..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Vida Útil</label>
              <Input 
                value={vidaUtil} 
                onChange={e => setVidaUtil(e.target.value)} 
                placeholder="Ej: 15 días" 
              />
            </div>
          </div>
        </section>
        {/* 👆 FIN DEL NUEVO BLOQUE 👆 */}

        {/* COSTOS FINALES */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 grid grid-cols-2 text-center">
          <div><span className="text-[10px] text-slate-500 uppercase">Costo Lote</span><div className="text-xl text-pink-400">${costoLote.toLocaleString('es-CL')}</div></div>
          <div><span className="text-[10px] text-slate-500 uppercase">Costo / {unidadRendimiento}</span><div className="text-xl text-emerald-400">${costoUnitario.toLocaleString('es-CL',{minimumFractionDigits:2})}</div></div>
        </div>
      </div>
    </div>
  );
}