// src/modules/uikit/sections/InputsSection.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DynamicRow } from '@/components/ui/DynamicRow';
import { DynamicIngredientRow } from '@/components/ui/DynamicIngredientRow'; // <--- NUEVO COMPONENTE
import { Button } from '@/components/ui/Button';
import { Search, Plus } from 'lucide-react';

export function InputsSection() {
  // Estado para la prueba de pasos simples
  const [pasos, setPasos] = useState([
    "Hervir el agua e infusionar las especias durante 10 minutos.",
    "Filtrar en caliente con malla fina y agregar el azúcar."
  ]);

  // Estado para la prueba de la grilla de ingredientes (Texto, Selector, Texto)
  const [ingredientesBOM, setIngredientesBOM] = useState([
    { insumoId: '1', cantidad: 500, unidad: 'ml' }
  ]);

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in py-2">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-white tracking-wide">Controles de Entrada y Filas Dinámicas</h1>
        <p className="text-xs text-slate-400 mt-0.5">Elementos de formulario optimizados para ingreso estructurado.</p>
      </div>

      <div className="space-y-6">
        
        {/* Grupo 1: Campos básicos */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono block">
            1. Inputs de Texto, Números y Prefijos
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input label="Nombre de Preparación" placeholder="Ej: Almíbar de Jengibre" icon={<Search size={14}/>} />
            <Input label="Costo Lote (COGS)" type="number" prefix="$" defaultValue={3500} />
          </div>
        </div>

        {/* Grupo 2: Selects */}
        <div className="space-y-4 pt-4 border-t border-slate-900">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono block">
            2. Selectores Estilizados (Combobox)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Select label="Tipo de Sub-receta">
              <option value="">Seleccione categoría...</option>
              <option value="1">Jarabe / Almíbar</option>
              <option value="2">Infusión / Cordial</option>
            </Select>
            <Select label="Unidad de Rendimiento">
              <option value="ml">Mililitros (ml)</option>
              <option value="g">Gramos (g)</option>
            </Select>
          </div>
        </div>

        {/* Grupo 3: Filas Dinámicas de Pasos (Texto simple) */}
        <div className="space-y-4 pt-4 border-t border-slate-900">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono block">
              3. Filas Dinámicas de Texto (Pasos de Preparación)
            </span>
            <Button 
              variant="secondary" 
              size="sm" 
              icon={<Plus size={12}/>}
              onClick={() => setPasos([...pasos, ""])}
            >
              Añadir Paso
            </Button>
          </div>
          
          <div className="space-y-2">
            {pasos.map((paso, idx) => (
              <DynamicRow 
                key={idx} 
                onRemove={() => setPasos(pasos.filter((_, i) => i !== idx))}
              >
                <span className="font-mono text-emerald-400 font-bold w-6 text-center text-xs">
                  {idx + 1}.
                </span>
                <Input 
                  value={paso} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setPasos(pasos.map((p, i) => i === idx ? val : p));
                  }} 
                  placeholder="Describa el paso operativo..." 
                  className="border-none py-1 text-xs"
                />
              </DynamicRow>
            ))}
          </div>
        </div>

        {/* Grupo 4: NUEVO COMPONENTE - Fila Dinámica de Ingredientes (Selector, Input numérico, Unidad) */}
        <div className="space-y-4 pt-4 border-t border-slate-900">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono block">
              4. Filas Dinámicas de Ingredientes (Selector | Cantidad | Unidad)
            </span>
            <Button 
              variant="primary" 
              size="sm" 
              icon={<Plus size={12}/>}
              onClick={() => setIngredientesBOM([...ingredientesBOM, { insumoId: '', cantidad: 0, unidad: 'ml' }])}
            >
              Añadir Ingrediente BOM
            </Button>
          </div>

          <div className="space-y-2">
            {ingredientesBOM.map((ing, idx) => (
              <DynamicIngredientRow 
                key={idx} 
                onRemove={() => setIngredientesBOM(ingredientesBOM.filter((_, i) => i !== idx))}
              >
                {/* 1. Selector de Insumo (6 columnas) */}
                <div className="sm:col-span-6">
                  <Select 
                    value={ing.insumoId} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setIngredientesBOM(ingredientesBOM.map((item, i) => i === idx ? { ...item, insumoId: val } : item));
                    }}
                  >
                    <option value="">Seleccione insumo del catálogo...</option>
                    <option value="1">Agua Gasificada</option>
                    <option value="2">Azúcar Blanca Refinada</option>
                    <option value="3">Jugo de Limón Sutil</option>
                  </Select>
                </div>

                {/* 2. Input de Cantidad Numérica (4 columnas) */}
                <div className="sm:col-span-4">
                  <Input 
                    type="number" 
                    step="any" 
                    placeholder="Cantidad" 
                    value={ing.cantidad} 
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setIngredientesBOM(ingredientesBOM.map((item, i) => i === idx ? { ...item, cantidad: val } : item));
                    }}
                    className="text-right font-mono text-xs py-1"
                  />
                </div>

                {/* 3. Unidad estática (2 columnas) */}
                <div className="sm:col-span-2 flex items-center">
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
                    {ing.unidad || 'ml'}
                  </span>
                </div>
              </DynamicIngredientRow>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}