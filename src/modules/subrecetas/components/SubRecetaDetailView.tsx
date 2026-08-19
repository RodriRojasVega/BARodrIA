// src/modules/subrecetas/SubRecetaDetailView.tsx
import { useState } from 'react';
import { ArrowLeft, Edit3, Trash2, Beaker, Layers, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { Tabs, TabPanel, type TabItem } from '@/components/ui/Tabs';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';

import type { SubRecetaViewItem } from './SubRecetasListView';

interface Props {
  subReceta: SubRecetaViewItem;
  insumosDisponibles: any[];
  ingredientesBase: any[];
  pasosBase: any[];
  onVolver: () => void;
  onEditar: (s: SubRecetaViewItem) => void;
  onEliminar: () => void;
}

const DETAIL_TABS: TabItem[] = [
  { id: 'ingenieria', label: 'Escandallo & BOM', icon: <Beaker size={14} />, activeColor: 'border-emerald-500 text-emerald-400' },
  { id: 'operacion', label: 'Procesos & Mermas', icon: <Layers size={14} />, activeColor: 'border-purple-500 text-purple-400' },
  { id: 'uso', label: 'Uso en Cócteles', icon: <LinkIcon size={14} />, activeColor: 'border-sky-500 text-sky-400' },
];

export function SubRecetaDetailView({ 
  subReceta, 
  insumosDisponibles, 
  ingredientesBase, 
  pasosBase, 
  onVolver, 
  onEditar, 
  onEliminar 
}: Props) {
  const [activeTab, setActiveTab] = useState('ingenieria');

  return (
    <div className="flex flex-col h-full animate-fade-in bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* 1. HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 p-6 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button 
            onClick={onVolver} 
            className="text-xs font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={14} /> Volver a la Grilla
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">{subReceta.nombre}</h2>
            <Badge variant="purple" className="font-mono">{subReceta.categoria_nombre || 'S/T'}</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
            <LinkIcon size={14} className="text-slate-500"/>
            <span>Insumo Espejo Asignado ID:</span> 
            <span className="text-slate-200 font-mono text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {subReceta.insumo_asociado_id || 'Ninguno'}
            </span>
          </p>
        </div>
        
        <div className="flex gap-3 shrink-0">
          <Button variant="secondary" icon={<Edit3 size={14}/>} onClick={() => onEditar(subReceta)}>
            Editar
          </Button>
          <Button variant="danger" icon={<Trash2 size={14}/>} onClick={onEliminar}>
            Eliminar
          </Button>
        </div>
      </div>

      {/* 2. PESTAÑAS (TABS) */}
      <div className="shrink-0 pt-2 px-4 border-b border-slate-800 bg-slate-900">
        <Tabs tabs={DETAIL_TABS} activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      {/* 3. CONTENIDO DE PESTAÑAS */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-950">
        
        {/* PESTAÑA: ESCANDALLO Y BOM */}
        <TabPanel id="ingenieria" activeTab={activeTab}>
          <div className="space-y-6">
            
            {/* KPIs con SummaryCard del UI Kit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryCard 
                label="Rendimiento (Batch)" 
                value={`${Number(subReceta.rendimiento_batch).toLocaleString('es-CL')} ${subReceta.unidad_rendimiento}`} 
              />
              <SummaryCard 
                label="Costo Producción Lote" 
                value={`$${subReceta.costo_lote_clp?.toLocaleString('es-CL') || 0}`}
                valueClassName="text-pink-400"
              />
              <SummaryCard 
                label="Costo Unitario Real" 
                value={`$${subReceta.costo_unitario_clp?.toLocaleString('es-CL', {minimumFractionDigits:2, maximumFractionDigits:2}) || 0}`}
                valueClassName="text-emerald-400"
              />
            </div>

            {/* Tabla BOM */}
            <div>
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-3">🧪 Composición (Ingredientes)</h4>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeaderCell>Insumo</TableHeaderCell>
                    <TableHeaderCell align="right">Cantidad</TableHeaderCell>
                    <TableHeaderCell align="right">Costo Parcial</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {ingredientesBase.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" className="py-8 text-slate-500 font-mono text-xs">
                        No hay ingredientes registrados para esta preparación.
                      </TableCell>
                    </TableRow>
                  ) : (
                    ingredientesBase.map((ing, idx) => {
                      const insRef = insumosDisponibles.find(i => i.id === ing.insumo_id);
                      const parcial = (insRef?.costo_unitario || 0) * ing.cantidad;
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-slate-200 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div> {insRef?.nombre || 'Insumo Desconocido'}
                          </TableCell>
                          <TableCell align="right" className="font-mono text-slate-400">
                            {ing.cantidad} {ing.unidad_medida}
                          </TableCell>
                          <TableCell align="right" className="font-mono text-emerald-400">
                            ${parcial.toLocaleString('es-CL', {maximumFractionDigits: 2})}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabPanel>

        {/* PESTAÑA: OPERACIÓN Y MERMAS */}
        <TabPanel id="operacion" activeTab={activeTab}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Secuencia */}
            <div>
              <h4 className="font-bold text-xs text-purple-400 uppercase tracking-widest mb-3">Secuencia de Preparación</h4>
              <div className="space-y-3">
                {pasosBase.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-900 p-4 rounded-xl border border-slate-800">Sin pasos registrados.</p>
                ) : (
                  pasosBase.map((p, idx) => (
                    <div key={idx} className="flex gap-3 text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="font-mono font-bold text-purple-400">{idx + 1}.</span>
                      <p className="leading-relaxed">{p.descripcion}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Almacenamiento y Mermas (Datos recién integrados) */}
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-xs text-amber-400 uppercase tracking-widest mb-2">Almacenamiento & Vida Útil</h4>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                  <p><strong className="text-slate-500 uppercase font-mono">Instrucciones:</strong> {subReceta.indicaciones_almacenamiento || 'No especificadas.'}</p>
                  <p><strong className="text-slate-500 uppercase font-mono">Duración Estimada:</strong> <span className="text-amber-400 font-bold">{subReceta.vida_util || 'No especificada.'}</span></p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-xs text-cyan-400 uppercase tracking-widest mb-2">Economía Circular / Mermas</h4>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {subReceta.control_mermas_economia_circular ? (
                    <span className="text-cyan-400">{subReceta.control_mermas_economia_circular}</span>
                  ) : (
                    <span className="text-slate-500 italic">Sin registro de manejo de mermas.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        {/* PESTAÑA: USO EN CÓCTELES */}
        <TabPanel id="uso" activeTab={activeTab}>
          <div className="space-y-4 max-w-2xl">
            <h4 className="font-bold text-xs text-sky-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              🍸 Cócteles que utilizan esta preparación
            </h4>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-400 italic font-mono">
                Módulo de relación con cartas y escandallo de cócteles activo en el siguiente módulo de migración.
              </p>
            </div>
          </div>
        </TabPanel>

      </div>
    </div>
  );
}