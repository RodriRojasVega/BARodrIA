// src/modules/coctel/components/CoctelDetail.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Trash2, Beaker, Eye, FileText, GlassWater, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Coctel } from '@/types/coctel';

// UI Kit Maestro
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { InfoCard } from '@/components/ui/InfoCard';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Tabs, TabPanel, type TabItem } from '@/components/ui/Tabs';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { StepList } from '@/components/ui/StepList';

interface CoctelDetailProps {
  coctel: Coctel;
  onVolver: () => void;
  onEditar: () => void;
  onEliminar: () => void;
}

interface NombresCatalogosState {
  categoria: string;
  familia: string;
  soporte: string;
  tecnica: string;
}

interface IngredienteJoin {
  cantidad: number;
  unidad_medida: string;
  insumos: {
    nombre: string;
    costo_unitario: number;
  } | null;
}

interface PasoPrep {
  id: number;
  numero_paso: number;
  descripcion: string;
  es_critico?: boolean;
}

interface CartaJoin {
  precio_venta_override: number | null;
  cartas: {
    nombre: string;
    cliente_institucion: string | null;
    tematica: string | null;
    estado: string;
  } | null;
}

// NUEVO: 4 TABS REORGANIZADOS
type TabType = 'info' | 'receta' | 'sensorial' | 'cartas';

const DETAIL_TABS: TabItem[] = [
  { id: 'info', label: 'Información', icon: <Info size={14} />, activeColor: 'border-primary text-primary' },
  { id: 'receta', label: 'Receta & Elaboración', icon: <Beaker size={14} />, activeColor: 'border-emerald-500 text-emerald-400' },
  { id: 'sensorial', label: 'StoryTelling & Cata', icon: <Eye size={14} />, activeColor: 'border-purple-500 text-purple-400' },
  { id: 'cartas', label: 'Presencia en Cartas', icon: <FileText size={14} />, activeColor: 'border-sky-500 text-sky-400' },
];

export function CoctelDetail({ coctel, onVolver, onEditar, onEliminar }: CoctelDetailProps) {
  const [tabActiva, setTabActiva] = useState<TabType>('info');
  const [cargando, setCargando] = useState(true);

  const [nombresCatalogos, setNombresCatalogos] = useState<NombresCatalogosState>({ 
    categoria: '-', familia: '-', soporte: '-', tecnica: '-' 
  });
  const [ingredientes, setIngredientes] = useState<IngredienteJoin[]>([]);
  const [pasos, setPasos] = useState<PasoPrep[]>([]);
  const [cartas, setCartas] = useState<CartaJoin[]>([]);

  useEffect(() => {
    async function cargarDatosRelacionales() {
      setCargando(true);
      try {
        const [resCat, resFam, resSop, resTec] = await Promise.all([
          supabase.from('categorias').select('nombre').eq('id', coctel.categoria_id).single(),
          supabase.from('familias').select('nombre').eq('id', coctel.familia_id).single(),
          supabase.from('soportes').select('nombre').eq('id', coctel.soporte_id).single(),
          supabase.from('tecnicas').select('nombre').eq('id', coctel.tecnica_id).single()
        ]);

        setNombresCatalogos({
          categoria: resCat.data?.nombre || '-',
          familia: resFam.data?.nombre || '-',
          soporte: resSop.data?.nombre || '-',
          tecnica: resTec.data?.nombre || '-'
        });

        const { data: ingsData } = await supabase.from('coctel_ingredientes')
          .select(`cantidad, unidad_medida, insumos (nombre, costo_unitario)`).eq('coctel_id', coctel.id);
        setIngredientes((ingsData as unknown as IngredienteJoin[]) || []);

        const { data: pasosData } = await supabase.from('coctel_pasos_preparacion')
          .select('*').eq('coctel_id', coctel.id).order('numero_paso', { ascending: true });
        setPasos((pasosData as PasoPrep[]) || []);

        const { data: cartasData } = await supabase.from('carta_cocteles')
          .select(`precio_venta_override, cartas (nombre, cliente_institucion, tematica, estado)`).eq('coctel_id', coctel.id);
        setCartas((cartasData as unknown as CartaJoin[]) || []);

      } catch (error: unknown) {
        console.error('Error cargando detalles del cóctel:', error);
      } finally {
        setCargando(false);
      }
    }
    cargarDatosRelacionales();
  }, [coctel.id]);

  // Cálculos para la fila de Totales en la tabla
  const totalCostoParcial = ingredientes.reduce((acc, ing) => acc + (Number(ing.cantidad) * Number(ing.insumos?.costo_unitario || 0)), 0);
  const totalCantidad = ingredientes.reduce((acc, ing) => acc + Number(ing.cantidad), 0);

  return (
    <div className="flex flex-col min-h-full w-full space-y-4 p-4 md:p-6 bg-background text-foreground animate-fade-in overflow-hidden">
      
      {/* MODULE HEADER */}
      <ModuleHeader 
        icon={<GlassWater size={20} />}
        title={
          <div className="flex items-center gap-3">
            <span>{coctel.nombre}</span>
            <Badge variant="info" size="sm">{Number(coctel.grado_alcohol || 0).toFixed(1)}% ABV</Badge>
          </div>
        }
        // Subtítulo comentado a petición para mayor limpieza visual
        // subtitle={`${nombresCatalogos.categoria} | ${nombresCatalogos.familia} | ${nombresCatalogos.soporte} | ${nombresCatalogos.tecnica}`}
        primaryAction={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={onVolver}>Volver</Button>
            <Button variant="secondary" size="sm" icon={<Edit3 size={14}/>} onClick={onEditar}>Editar</Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={14}/>} onClick={onEliminar}>Eliminar</Button>
          </div>
        }
      />

      <div className="shrink-0 border-b border-border">
        <Tabs tabs={DETAIL_TABS} activeTab={tabActiva} onChangeTab={(id) => setTabActiva(id as TabType)} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
        {cargando ? (
          <div className="text-center py-12 text-muted font-mono text-xs animate-pulse">Obteniendo ficha técnica relacional...</div>
        ) : (
          <>
            {/* TABS 1: INFORMACIÓN */}
            <TabPanel id="info" activeTab={tabActiva}>
              <div className="space-y-8">
                
                {/* Taxonomía Movida a InfoCards con colores */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-muted uppercase tracking-widest flex items-center gap-2">
                     Taxonomía y Clasificación
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <InfoCard title="Categoría" value={nombresCatalogos.categoria} variant="primary" />
                    <InfoCard title="Familia de Sabor" value={nombresCatalogos.familia} variant="info" />
                    <InfoCard title="Soporte (Vaso/Copa)" value={nombresCatalogos.soporte} variant="warning" />
                    <InfoCard title="Técnica Elaboración" value={nombresCatalogos.tecnica} variant="success" />
                  </div>
                </div>

                {/* KPIs Financieros y Químicos */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-muted uppercase tracking-widest flex items-center gap-2">
                     Auditoría Física y Financiera
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryCard label="% Alcohol (ABV)" value={`${Number(coctel.grado_alcohol || 0).toFixed(1)}%`} valueClassName="text-primary font-mono" />
                    <SummaryCard label="Azúcar Estimada" value={`${Number(coctel.porcentaje_azucar || 0).toFixed(1)}%`} valueClassName="text-warning font-mono" />
                    <SummaryCard label="COGS / Costo Copa" value={`$${Number(coctel.costo_produccion || 0).toFixed(0)}`} valueClassName="text-foreground/80 font-mono" />
                    <SummaryCard label="Precio Sugerido" value={`$${Number(coctel.precio_venta_sugerido || 0).toFixed(0)}`} valueClassName="text-primary font-bold font-mono" />
                  </div>
                </div>
              </div>
            </TabPanel>

            {/* TABS 2: RECETA & ELABORACIÓN */}
            <TabPanel id="receta" activeTab={tabActiva}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* BOM y Tabla con Fila de Totales */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-muted uppercase tracking-widest flex items-center gap-2">
                    <Beaker size={14} /> Balance Líquido (Receta)
                  </h4>
                  <Table>
                    <TableHead>
                      <tr>
                        {/* Tabla sin sort, totalmente estática */}
                        <TableHeaderCell>Insumo</TableHeaderCell>
                        <TableHeaderCell align="right">Cantidad</TableHeaderCell>
                        <TableHeaderCell align="right">Costo Parcial</TableHeaderCell>
                      </tr>
                    </TableHead>
                    <TableBody>
                      {ingredientes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" className="py-8 text-muted font-mono text-xs">Sin ingredientes asignados.</TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {ingredientes.map((ing, idx) => {
                            const costoUnit = ing.insumos?.costo_unitario || 0;
                            const parcial = Number(ing.cantidad) * Number(costoUnit);
                            return (
                              <TableRow key={idx}>
                                <TableCell className="font-medium text-foreground flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-border"></div> {ing.insumos?.nombre || 'Desconocido'}
                                </TableCell>
                                <TableCell align="right" className="font-mono text-muted">{ing.cantidad} {ing.unidad_medida}</TableCell>
                                <TableCell align="right" className="font-mono text-primary">${parcial.toFixed(0)}</TableCell>
                              </TableRow>
                            );
                          })}
                          
                          {/* FILA DE TOTALES REUTILIZANDO EL COMPONENTE TABLEROW */}
                          <TableRow className="bg-surface border-t-2 border-border group-hover:bg-surface">
                            <TableCell className="font-bold font-mono text-muted uppercase text-xs">Totales Lote</TableCell>
                            <TableCell align="right" className="font-mono font-bold text-foreground">
                              {totalCantidad.toFixed(1)} <span className="text-[10px] text-muted">unid/ml</span>
                            </TableCell>
                            <TableCell align="right" className="font-mono font-bold text-primary">
                              ${totalCostoParcial.toFixed(0)}
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-muted uppercase tracking-widest flex items-center gap-2">📋 Secuencia Operativa</h4>
                    {/* El Componente StepList ahora usa isCritical mapeado desde la base de datos */}
                    <StepList 
                      steps={pasos.map(p => ({ descripcion: p.descripcion, isCritical: p.es_critico }))} 
                      emptyMessage="Sin pasos operativos definidos."
                    />
                  </div>

                  {/* Tips de Barra movido a esta pestaña */}
                  {coctel.tips && (
                    <div className="bg-surface p-4 rounded-xl border border-border text-sm text-foreground shadow-sm">
                      <span className="text-warning font-mono font-bold text-xs uppercase block mb-1">💡 Tips de Barra</span>
                      <p className="text-muted">{coctel.tips}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabPanel>

            {/* TABS 3: SENSORIAL Y MARIDAJE */}
            <TabPanel id="sensorial" activeTab={tabActiva}>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-xs text-primary uppercase tracking-widest mb-2 font-mono">Storytelling & Inspiración</h4>
                  <p className="text-sm text-foreground italic bg-surface p-4 rounded-xl border border-border leading-relaxed shadow-sm">
                    {coctel.reseña_inspiracion || 'Sin receta histórica o storytelling registrado.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoCard title="👁️ Vista (Aspecto)" value={coctel.reseña_vista || '-'} variant="success" />
                  <InfoCard title="👃 Nariz (Aromas)" value={coctel.reseña_nariz || '-'} variant="warning" />
                  <InfoCard title="👄 Boca (Paladar)" value={coctel.reseña_boca || '-'} variant="info" />
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-xs text-muted uppercase tracking-widest font-mono">Maridaje & Sugerencias</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoCard title="Propuesta" value={coctel.maridaje_propuesta || '-'} variant="primary" />
                    <InfoCard title="Justificación" value={coctel.maridaje_justificacion || '-'} variant="primary" />
                    <InfoCard title="Alternativa" value={coctel.maridaje_alternativa || '-'} variant="primary" />
                  </div>
                </div>
              </div>
            </TabPanel>

            {/* TABS 4: CARTAS */}
            <TabPanel id="cartas" activeTab={tabActiva}>
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-muted uppercase tracking-widest flex items-center gap-2">📜 Menús y Cartas donde está incluido</h4>
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeaderCell>Nombre de la Carta</TableHeaderCell>
                      <TableHeaderCell>Cliente / Institución</TableHeaderCell>
                      <TableHeaderCell>Temática</TableHeaderCell>
                      <TableHeaderCell align="center">Estado</TableHeaderCell>
                      <TableHeaderCell align="right">Precio en Carta</TableHeaderCell>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {cartas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" className="py-8 text-muted font-mono text-xs">Este cóctel no está asignado a ninguna carta activa.</TableCell>
                      </TableRow>
                    ) : (
                      cartas.map((item, idx) => {
                        const c = item.cartas;
                        if (!c) return null;
                        const precioFinal = item.precio_venta_override || coctel.precio_venta_sugerido;
                        return (
                          <TableRow key={idx}>
                            <TableCell className="font-bold text-foreground">{c.nombre}</TableCell>
                            <TableCell className="text-muted">{c.cliente_institucion || 'General'}</TableCell>
                            <TableCell className="text-muted">{c.tematica || '-'}</TableCell>
                            <TableCell align="center"><Badge variant="info" size="sm" className="uppercase">{c.estado}</Badge></TableCell>
                            <TableCell align="right" className="font-mono text-primary font-bold">${Number(precioFinal).toFixed(0)}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabPanel>
          </>
        )}
      </div>
    </div>
  );
}