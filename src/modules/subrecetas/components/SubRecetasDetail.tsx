// src/modules/subrecetas/components/SubRecetasDetail.tsx
import { useState } from 'react';
import { ArrowLeft, Edit3, Trash2, Info, Truck, History, Beaker, Layers, Link as LinkIcon } from 'lucide-react';

// Tipos
import type { SubRecetaItem } from './SubRecetasList';
import type { IngredienteBOM, PasoPreparacion } from '@/types/subrecetas';
import type { Insumo } from '@/types/insumos';

// Componentes del UI Kit
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Tabs, TabPanel, type TabItem } from '@/components/ui/Tabs';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { InfoCard } from '@/components/ui/InfoCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { StepList } from '@/components/ui/StepList';

export interface InsumoHistorico {
  id: string | number;
  fecha: string;
  proveedor_nombre?: string;
  precio_compra: number;
  costo_unitario: number;
  motivo?: string;
}

interface Props {
  subReceta: SubRecetaItem;
  insumosDisponibles: Insumo[];
  ingredientesBase: IngredienteBOM[];
  pasosBase: PasoPreparacion[];
  onVolver: () => void;
  onEditar: (s: SubRecetaItem) => void;
  onEliminar: () => void;
}

const DETAIL_TABS: TabItem[] = [
  { id: 'ingenieria', label: 'Escandallo & BOM', icon: <Beaker size={14} /> },
  { id: 'operacion', label: 'Procesos & Mermas', icon: <Layers size={14} /> },
  { id: 'uso', label: 'Uso en Cócteles', icon: <LinkIcon size={14} /> },
];

export function SubRecetasDetail({ 
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
    <div className="flex flex-col min-h-full w-full space-y-4 p-4 md:p-6 bg-background text-foreground animate-fade-in overflow-hidden">
      
      <ModuleHeader 
        icon={<Beaker size={20} />}
        title={
          <div className="flex items-center gap-3">
            <span>{subReceta.nombre}</span>
            <Badge variant="info" size="sm">{subReceta.categoria_nombre || 'S/T'}</Badge>
          </div>
        }
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={onVolver}>Volver</Button>
            <Button variant="secondary" size="sm" icon={<Edit3 size={14}/>} onClick={() => onEditar(subReceta)}>Editar</Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={14}/>} onClick={onEliminar}>Eliminar</Button>
          </div>
        }
      />

      <div className="shrink-0 border-b border-border">
        <Tabs tabs={DETAIL_TABS} activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
        
        <TabPanel id="ingenieria" activeTab={activeTab}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard label="Insumo Espejo (ID)" value={subReceta.insumo_asociado_id ? `#${subReceta.insumo_asociado_id}` : 'Ninguno'} />
              <SummaryCard label="Rendimiento" value={`${Number(subReceta.rendimiento_batch).toLocaleString('es-CL')} ${subReceta.unidad_rendimiento}`} />
              <SummaryCard label="Costo Lote" value={`$${subReceta.costo_lote_clp?.toLocaleString('es-CL') || 0}`} />
              <SummaryCard label="Costo Unitario" value={`$${subReceta.costo_unitario_clp?.toFixed(2) || 0}`} valueClassName="text-primary font-bold" />
            </div>

            <div className="pt-2">
              <h4 className="font-bold text-xs text-muted uppercase tracking-widest mb-3">Composición (Ingredientes)</h4>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeaderCell>Insumo</TableHeaderCell>
                    <TableHeaderCell align="right">Cantidad</TableHeaderCell>
                    <TableHeaderCell align="right">Costo Parcial</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {ingredientesBase.map((ing, idx) => {
                    const insRef = insumosDisponibles.find(i => i.id === ing.insumo_id);
                    const parcial = (insRef?.costo_unitario || 0) * ing.cantidad;
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{insRef?.nombre || 'Insumo Desconocido'}</TableCell>
                        <TableCell align="right" className="font-mono">{ing.cantidad} {ing.unidad_medida}</TableCell>
                        <TableCell align="right" className="font-mono text-primary">${parcial.toLocaleString('es-CL', {maximumFractionDigits: 2})}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabPanel>

        <TabPanel id="operacion" activeTab={activeTab}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-xs text-primary uppercase tracking-widest mb-3">Secuencia de Preparación</h4>
              <StepList steps={pasosBase.map((p, idx) => ({ id: idx, descripcion: p.descripcion }))} />         
            </div>
            <div className="grid grid-cols-1 gap-4">
              <InfoCard title="Almacenamiento" value={subReceta.indicaciones_almacenamiento || 'No especificado.'} variant="info" />
              <InfoCard title="Vida Útil" value={subReceta.vida_util || 'No especificado.'} variant="warning" />
              <InfoCard title="Economía Circular" value={subReceta.control_mermas_economia_circular || 'Sin registro.'} variant="success" />
            </div>
          </div>
        </TabPanel>
      </div>
    </div>
  );
}