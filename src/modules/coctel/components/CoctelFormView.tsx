import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import type { Coctel } from '@/types/coctel';
import type { Insumo } from '@/types/insumos';

// UI Kit
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface CoctelFormViewProps {
  coctelAEditar?: Coctel | null;
  onCerrar: () => void;
  onGuardar: (_datos: Partial<Coctel>, _ingredientes: any[], _pasos: any[]) => Promise<void>;
}

export function CoctelFormView({ coctelAEditar, onCerrar, onGuardar }: CoctelFormViewProps) {
  const [cargando, setCargando] = useState(false);
  const [insumosGlobales, setInsumosGlobales] = useState<Insumo[]>([]);
  const [catalogos, setCatalogos] = useState<any>({ categorias: [], familias: [], soportes: [], hielos: [], tecnicas: [] });
  
  const [formData, setFormData] = useState<Partial<Coctel>>(
    coctelAEditar || {
      nombre: '', slug: '', categoria_id: 0, familia_id: 0, soporte_id: 0, 
      hielo_id: 0, tecnica_id: 0, reseña_inspiracion: '', reseña_vista: '', 
      reseña_nariz: '', reseña_boca: ''
    }
  );

  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [pasos, setPasos] = useState<any[]>([]);

  // 1. CARGA DE CATÁLOGOS E INSUMOS (Equivalente a tu cargarMaestros)
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
      setInsumosGlobales(insRes.data || []);
      setCatalogos({
        categorias: catRes.data || [], familias: famRes.data || [],
        soportes: sopRes.data || [], hielos: hieRes.data || [], tecnicas: tecRes.data || []
      });

      // Si editamos, cargar puente de ingredientes y pasos
      if (coctelAEditar) {
        const { data: ings } = await supabase.from('coctel_ingredientes').select('*').eq('coctel_id', coctelAEditar.id);
        const { data: steps } = await supabase.from('coctel_pasos_preparacion').select('*').eq('coctel_id', coctelAEditar.id).order('numero_paso');
        setIngredientes(ings || []);
        setPasos(steps || []);
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

    const tecObj = catalogos.tecnicas.find((t: any) => t.id === formData.tecnica_id);
    const dilucion = tecObj ? (Number(tecObj.dilucion_estimada_porcentaje) || 0) : 0;
    
    const volConDilucion = volLiquidoTotal * (1 + dilucion);
    const abvFinal = volConDilucion > 0 ? (alcPuroTotal / volConDilucion) * 100 : 0;

    return {
      costo: costoTotal,
      precioSugerido: costoTotal * 8.0,
      abv: abvFinal
    };
  }, [ingredientes, formData.tecnica_id, insumosGlobales, catalogos]);

  // ... (Aquí va la lógica de los manejadores handleChange y handleSubmit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    
    // Inyectamos los cálculos dinámicos al payload antes de guardar
    const payloadCompleto = {
      ...formData,
      costo_produccion: fisicos.costo,
      precio_venta_sugerido: fisicos.precioSugerido,
      grado_alcohol: fisicos.abv,
      porcentaje_azucar: 12.5 // Fijo según tu código
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
    <div className="flex flex-col h-full bg-slate-950 p-4 md:p-6 animate-fade-in overflow-y-auto custom-scrollbar">
      {/* ... (Header del formulario) ... */}
      
      {/* SECCIÓN KPIs CALCULADOS EN TIEMPO REAL */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mt-4 mb-8">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">COGS / Costo</span>
          <div className="text-2xl font-bold font-mono text-purple-400">${fisicos.costo.toFixed(0)}</div>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">Precio (8.0x)</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">${fisicos.precioSugerido.toFixed(0)}</div>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">Alcohol (% ABV)</span>
          <div className="text-2xl font-bold font-mono text-slate-100">{fisicos.abv.toFixed(1)}%</div>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">Azúcar (w/v)</span>
          <div className="text-2xl font-bold font-mono text-amber-400">12.5%</div>
        </div>
      </div>
      
      {/* ... (Resto del formulario: Inputs y lógica visual) ... */}
    </div>
  );
}