// src/modules/subrecetas/components/SubRecetaDetailView.tsx
import { useState } from 'react';
import { ArrowLeft, Edit3, Trash2, Beaker, Layers, Link as LinkIcon } from 'lucide-react';

// Componentes del UI Kit
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { InfoCard } from '@/components/ui/InfoCard';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Tabs, TabPanel, type TabItem } from '@/components/ui/Tabs';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { StepList } from '@/components/ui/StepList'; // <-- Nuevo import

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
  { id: 'ingenieria', label: 'Escandallo & BOM', icon: <Beaker size={14} />, activeColor: 'border-primary text-primary' },
  { id: 'operacion', label: 'Procesos & Mermas', icon: <Layers size={14} />, activeColor: 'border-info text-info' },
  { id: 'uso', label: 'Uso en Cócteles', icon: <LinkIcon size={14} />, activeColor: 'border-success text-success' },
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
    <div className="flex flex-col min-h-full w-full space-y-4 p-4 md:p-6 bg-background text-foreground animate-fade-in overflow-hidden">
      
      {/* 1. MODULE HEADER (Con Badge inyectado en el título) */}
      <ModuleHeader 
        icon={<Beaker size={20} />}
        title={
          <div className="flex items-center gap-3">
            <span>{subReceta.nombre}</span>
            <Badge variant="info" size="sm">{subReceta.categoria_nombre || 'S/T'}</Badge>
          </div>
        }
        //subtitle="Ficha técnica, composición de ingredientes y especificaciones de la preparación."
        primaryAction={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={onVolver}>
              Volver
            </Button>
            <Button variant="secondary" size="sm" icon={<Edit3 size={14}/>} onClick={() => onEditar(subReceta)}>
              Editar
            </Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={14}/>} onClick={onEliminar}>
              Eliminar
            </Button>
          </div>
        }
      />

      {/* 2. NAVEGACIÓN DE PESTAÑAS */}
      <div className="shrink-0 border-b border-border">
        <Tabs tabs={DETAIL_TABS} activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      {/* 3. CONTENIDO DE PESTAÑAS */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
        
        {/* PESTAÑA 1: ESCANDALLO Y BOM */}
        <TabPanel id="ingenieria" activeTab={activeTab}>
          <div className="space-y-6">
            
            {/* KPIs / Resumen (Ahora son 4 en una misma línea) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard 
                label="Insumo Espejo (ID)" 
                value={subReceta.insumo_asociado_id ? `#${subReceta.insumo_asociado_id}` : 'Ninguno'} 
                valueClassName="text-info font-mono"
              />
              <SummaryCard 
                label="Rendimiento (Batch)" 
                value={`${Number(subReceta.rendimiento_batch).toLocaleString('es-CL')} ${subReceta.unidad_rendimiento}`} 
              />
              <SummaryCard 
                label="Costo Producción Lote" 
                value={`$${subReceta.costo_lote_clp?.toLocaleString('es-CL') || 0}`}
                valueClassName="text-foreground/80"
              />
              <SummaryCard 
                label="Costo Unitario Real" 
                value={`$${subReceta.costo_unitario_clp?.toLocaleString('es-CL', {minimumFractionDigits:2, maximumFractionDigits:2}) || 0}`}
                valueClassName="text-primary font-bold"
              />
            </div>

            {/* Tabla BOM */}
            <div className="pt-2">
              <h4 className="font-bold text-xs text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                <Beaker size={14} /> Composición (Ingredientes)
              </h4>
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
                      <TableCell colSpan={3} align="center" className="py-8 text-muted font-mono text-xs">
                        No hay ingredientes registrados para esta preparación.
                      </TableCell>
                    </TableRow>
                  ) : (
                    ingredientesBase.map((ing, idx) => {
                      const insRef = insumosDisponibles.find(i => i.id === ing.insumo_id);
                      const parcial = (insRef?.costo_unitario || 0) * ing.cantidad;
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-border"></div> {insRef?.nombre || 'Insumo Desconocido'}
                          </TableCell>
                          <TableCell align="right" className="font-mono text-muted">
                            {ing.cantidad} {ing.unidad_medida}
                          </TableCell>
                          <TableCell align="right" className="font-mono text-primary">
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

        {/* PESTAÑA 2: OPERACIÓN Y MERMAS */}
        <TabPanel id="operacion" activeTab={activeTab}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Secuencia (Usando el nuevo UI Kit component) */}
            <div>
              <h4 className="font-bold text-xs text-primary uppercase tracking-widest mb-3">Secuencia de Preparación</h4>
              <StepList steps={pasosBase} emptyMessage="Sin pasos registrados para esta preparación." />
            </div>
            
            {/* Almacenamiento y Mermas (Usando InfoCards) */}
            <div>
              <h4 className="font-bold text-xs text-info uppercase tracking-widest mb-3">Almacenamiento & Economía Circular</h4>
              <div className="grid grid-cols-1 gap-4">
                <InfoCard 
                  title="Instrucciones de Guardado" 
                  value={subReceta.indicaciones_almacenamiento || 'No especificadas.'} 
                  variant="info" 
                />
                <InfoCard 
                  title="Duración Estimada (Vida Útil)" 
                  value={subReceta.vida_util || 'No especificada.'} 
                  variant="warning" 
                />
                <InfoCard 
                  title="Control de Mermas / Eco Circular" 
                  value={subReceta.control_mermas_economia_circular || 'Sin registro de manejo de mermas.'} 
                  variant="success" 
                />
              </div>
            </div>

          </div>
        </TabPanel>

        {/* PESTAÑA 3: USO EN CÓCTELES */}
        <TabPanel id="uso" activeTab={activeTab}>
          <div className="space-y-4 max-w-2xl">
            <h4 className="font-bold text-xs text-info uppercase tracking-widest mb-2 flex items-center gap-2">
              <LinkIcon size={14} /> Cócteles que utilizan esta preparación
            </h4>
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <p className="text-sm text-muted italic">
                Módulo de relación con cartas y escandallo de cócteles activo en la próxima etapa de migración.
              </p>
            </div>
          </div>
        </TabPanel>

      </div>
    </div>
  );
}