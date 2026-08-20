// src/modules/subrecetas/components/SubRecetasList.tsx
import { useState, useMemo } from 'react';
import { Plus, FlaskConical } from 'lucide-react';

// Importamos los átomos y componentes del UI Kit
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TableToolbar, TablePagination } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Badge } from '@/components/ui/Badge';

// Tipos basados en tu esquema
import type { SubReceta, TipoSubReceta } from '@/types/subrecetas';

export type SubRecetaItem = SubReceta & {
  categoria_nombre?: string;
  costo_lote_clp?: number;
  costo_unitario_clp?: number;
};

interface SubRecetasListProps {
  data: SubRecetaItem[];
  tipos: TipoSubReceta[];
  onNuevaSubReceta: () => void;
  onVerDetalle: (subReceta: SubRecetaItem) => void;
}

export function SubRecetasList({ 
  data, 
  tipos, 
  onNuevaSubReceta, 
  onVerDetalle 
}: SubRecetasListProps) {
  
  // Estados de interfaz
  const [busqueda, setBusqueda] = useState('');
  const [limite, setLimite] = useState(10); // Ajustado a 10 por defecto
  const [paginaActual, setPaginaActual] = useState(1);
  const [showKpis, setShowKpis] = useState(false); // Oculto por defecto

  // Estados de ordenamiento
  const [columnaOrden, setColumnaOrden] = useState<keyof SubRecetaItem | 'tipo'>('nombre');
  const [ordenAsc, setOrdenAsc] = useState(true);

  const manejarOrden = (col: keyof SubRecetaItem | 'tipo') => {
    if (columnaOrden === col) {
      setOrdenAsc(!ordenAsc);
    } else {
      setColumnaOrden(col);
      setOrdenAsc(true);
    }
  };

  // Filtrado y ordenamiento reactivo
  const subRecetasProcesadas = useMemo(() => {
    let filtradas = data.filter(sr => {
      const tipoObj = tipos.find(t => t.id === sr.tipo_id);
      const coincidenciaNombre = sr.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincidenciaTipo = tipoObj?.nombre?.toLowerCase().includes(busqueda.toLowerCase());
      return coincidenciaNombre || coincidenciaTipo;
    });

    filtradas.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (columnaOrden === 'nombre') {
        valA = a.nombre.toLowerCase();
        valB = b.nombre.toLowerCase();
      } else if (columnaOrden === 'tipo') {
        valA = tipos.find(t => t.id === a.tipo_id)?.nombre.toLowerCase() || '';
        valB = tipos.find(t => t.id === b.tipo_id)?.nombre.toLowerCase() || '';
      } else if (columnaOrden === 'rendimiento_batch') {
        valA = Number(a.rendimiento_batch) || 0;
        valB = Number(b.rendimiento_batch) || 0;
      } else if (columnaOrden === 'costo_lote_clp') {
        valA = a.costo_lote_clp || 0;
        valB = b.costo_lote_clp || 0;
      } else if (columnaOrden === 'costo_unitario_clp') {
        valA = a.costo_unitario_clp || 0;
        valB = b.costo_unitario_clp || 0;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return ordenAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return ordenAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    return filtradas;
  }, [data, tipos, busqueda, ordenAsc, columnaOrden]);

  // Cálculos de Paginación segura
  const totalRegistros = subRecetasProcesadas.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / limite));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  
  const inicio = (paginaSegura - 1) * limite;
  const paginadas = subRecetasProcesadas.slice(inicio, inicio + limite);

  return (
    <div className="flex flex-col min-h-full w-full space-y-4 p-4 md:p-6 bg-background text-foreground animate-fade-in overflow-hidden">
      
      {/* 1. MODULE HEADER */}
      <ModuleHeader 
        icon={<FlaskConical size={20} />} // Cambiado al tubo de ensayo
        title="Sub-recetas Artesanales"
        //subtitle="Gestión de preparaciones intermedias, pre-batches y escandallos de producción."
        showKpis={showKpis}
        onToggleKpis={() => setShowKpis(!showKpis)}
        kpiButtonText="KPIs" // Texto corregido
        primaryAction={
          <Button 
            variant="primary" 
            size="sm"
            icon={<Plus size={14} />} 
            onClick={onNuevaSubReceta}
          >
            Nueva Sub-receta
          </Button>
        }
      />

      {/* 1.5 TARJETAS DE INDICADORES (KPIs) DESPLEGABLES */}
      {showKpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 animate-fade-in">
          <SummaryCard 
            label="Total Preparaciones" 
            value={
              <>
                {subRecetasProcesadas.length} <span className="text-xs font-normal text-muted">Activas</span>
              </>
            } 
          />
          <SummaryCard 
            label="Economía Circular" 
            value={
              <>
                {subRecetasProcesadas.filter(sr => sr.control_mermas_economia_circular && sr.control_mermas_economia_circular.trim() !== '').length}
                <span className="text-xs font-normal text-muted"> / {subRecetasProcesadas.length}</span>
              </>
            }
            valueClassName="text-success"
          />
          <SummaryCard 
            label="Costo Promedio / ml" 
            value={
              `$${subRecetasProcesadas.length > 0 ? (subRecetasProcesadas.reduce((acc, sr) => acc + (sr.costo_unitario_clp || 0), 0) / subRecetasProcesadas.length).toFixed(1) : '0'}`
            }
            valueClassName="text-info"
          />
        </div>
      )}

      {/* 2. BARRA DE HERRAMIENTAS */}
      <TableToolbar 
        busqueda={busqueda}
        onBusquedaChange={(val) => {
          setBusqueda(val);
          setPaginaActual(1);
        }}
        placeholder="Buscar por nombre o tipo..."
        limite={limite}
        onLimiteChange={(val) => {
          setLimite(val);
          setPaginaActual(1);
        }}
      />

      {/* 3. TABLA DE RESULTADOS */}
      <div className="flex flex-col flex-1 space-y-2">
        <Table className="flex-1">
          <TableHead>
            <tr>
              {/* Columnas 100% ordenables con visualización de dirección */}
              <TableHeaderCell isSortable sortDirection={columnaOrden === 'nombre' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('nombre')}>Nombre</TableHeaderCell>
              <TableHeaderCell isSortable sortDirection={columnaOrden === 'tipo' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('tipo')}>Tipo</TableHeaderCell>
              <TableHeaderCell align="right" isSortable sortDirection={columnaOrden === 'rendimiento_batch' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('rendimiento_batch')}>Rendimiento (Batch)</TableHeaderCell>
              <TableHeaderCell align="right" isSortable sortDirection={columnaOrden === 'costo_lote_clp' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('costo_lote_clp')}>Costo Lote</TableHeaderCell>
              <TableHeaderCell align="right" isSortable sortDirection={columnaOrden === 'costo_unitario_clp' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('costo_unitario_clp')}>Costo Unitario</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {paginadas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" className="py-12 text-muted font-mono">
                  {data.length === 0 ? 'Cargando catálogo de preparaciones...' : 'No se encontraron sub-recetas.'}
                </TableCell>
              </TableRow>
            ) : (
              paginadas.map((sr) => {
                const tipoObj = tipos.find(t => t.id === sr.tipo_id);
                
                return (
                  <TableRow key={sr.id} isClickable onClick={() => onVerDetalle(sr)}>
                    <TableCell className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {sr.nombre}
                    </TableCell>
                    
                    <TableCell>
                      {/* Aplicamos el componente Badge para el Tipo */}
                      <Badge variant="info" size="sm" className="uppercase tracking-wider">
                        {tipoObj?.nombre || '-'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell align="right" className="font-mono text-muted">
                      {Number(sr.rendimiento_batch).toLocaleString('es-CL')} {sr.unidad_rendimiento}
                    </TableCell>
                    
                    <TableCell align="right" className="font-mono text-foreground/70">
                      ${sr.costo_lote_clp?.toLocaleString('es-CL') || 0}
                    </TableCell>
                    
                    <TableCell align="right" className="font-mono text-primary font-bold">
                      ${sr.costo_unitario_clp?.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0} / {sr.unidad_rendimiento}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* 4. FOOTER PAGINACIÓN */}
        <TablePagination 
          paginaActual={paginaSegura}
          totalPaginas={totalPaginas}
          onCambiarPagina={(p) => setPaginaActual(p)}
          elementosMostrados={totalRegistros === 0 ? 0 : paginadas.length}
          totalElementos={totalRegistros}
        />
      </div>
    </div>
  );
}