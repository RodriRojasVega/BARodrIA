// src/modules/uikit/sections/AsignadorSection.tsx
import { useState } from 'react';
import { DualAsignador } from '@/components/ui/DualAsignador';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { MOCK_INVENTARIO_DISPONIBLE } from '../uiKitMockData';

export function AsignadorSection() {
  const [buscadorAsig, setBuscadorAsig] = useState('');
  const [buscadorDisp, setBuscadorDisp] = useState('');
  
  const [asignados, setAsignados] = useState([
    { id: 101, nombre: 'Agua Gasificada', cantidad: 7000, unidad: 'ml' },
    { id: 102, nombre: 'Amargo de Angostura', cantidad: 2000, unidad: 'ml' }
  ]);

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in py-2">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-white tracking-wide">Componente: Asignador Dual (BOM / Proveedores)</h1>
        <p className="text-xs text-slate-400 mt-0.5">Estructura interactiva de doble columna para la distribución y control de insumos.</p>
      </div>

      <DualAsignador
        tituloIzq="Insumos del Lote / Distribuidos"
        contadorIzq={asignados.length}
        valorBusquedaIzq={buscadorAsig}
        onChangeBusquedaIzq={e => setBuscadorAsig(e.target.value)}
        
        tituloDer="Inventario General Disponible"
        valorBusquedaDer={buscadorDisp}
        onChangeBusquedaDer={e => setBuscadorDisp(e.target.value)}

        childrenIzq={
          asignados.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-16 font-mono">Sin elementos asignados.</div>
          ) : (
            asignados.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between gap-2 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-900/30">
                <span className="text-xs font-bold text-emerald-400 truncate flex-1">{item.nombre}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Input 
                    type="number" 
                    value={item.cantidad} 
                    onChange={e => {
                      const val = Number(e.target.value) || 0;
                      setAsignados(prev => prev.map((x, idx) => idx === index ? { ...x, cantidad: val } : x));
                    }} 
                    className="w-20 h-7 text-right text-xs font-mono py-0" 
                  />
                  <span className="text-[10px] text-slate-400 font-mono">{item.unidad}</span>
                </div>
                <Button 
                  variant="inline-danger" 
                  onClick={() => setAsignados(prev => prev.filter((_, idx) => idx !== index))}
                >
                  ✕
                </Button>
              </div>
            ))
          )
        }

        childrenDer={
          MOCK_INVENTARIO_DISPONIBLE.map(ins => (
            <div key={ins.id} className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition">
              <div>
                <p className="text-xs text-slate-200 font-medium">{ins.nombre}</p>
                <p className="text-[10px] text-slate-500 font-mono">Ref: ${ins.ref.toLocaleString('es-CL')} / {ins.unidad}</p>
              </div>
              <Button 
                variant="inline" 
                icon={<Plus size={12}/>}
                onClick={() => setAsignados(prev => [...prev, { id: ins.id, nombre: ins.nombre, cantidad: 100, unidad: ins.unidad }])}
              >
                Agregar
              </Button>
            </div>
          ))
        }
      />
    </div>
  );
}