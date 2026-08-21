// src/modules/subrecetas/components/SubRecetasList.tsx
import { useState, useMemo } from 'react';
import { Plus, FlaskConical } from 'lucide-react';

// Importamos los átomos y componentes del UI Kit
import { 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableHeaderCell, 
  TableToolbar, 
  TablePagination 
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Badge } from '@/components/ui/Badge';

// Tipos centralizados
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
  
  const [busqueda, setBusqueda] = useState('');
  const [limite, setLimite] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);
  const [showKpis, setShowKpis] = useState(false);

  // Estados de ordenamiento tipados correctamente
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

  const subRecetasProcesadas = useMemo(() => {
    const filtradas = data.filter(sr => {
      const tipoObj = tipos.find(t => t.id === sr.tipo_id);
      const coincidenciaNombre = sr.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincidenciaTipo = tipoObj?.nombre?.toLowerCase().includes(busqueda.toLowerCase());
      return coincidenciaNombre || coincidenciaTipo;
    });

    return [...filtradas].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

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

      if (valA < valB) return ordenAsc ? -1 : 1;
      if (valA > valB) return ordenAsc ? 1 : -1;
      return 0;
    });
  }, [data, tipos, busqueda, ordenAsc, columnaOrden]);

  const totalRegistros = subRecetasProcesadas.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / limite));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  
  const paginadas = subRecetasProcesadas.slice((paginaSegura - 1) * limite, (paginaSegura - 1) * limite + limite);

  return (
    <div className="flex flex-col min-h-full w-full space-y-4 p-4 md:p-6 bg-background text-foreground animate-fade-in overflow-hidden">
      
      <ModuleHeader 
        icon={<FlaskConical size={20} />}
        title="Sub-recetas Artesanales"
        action={
            <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowKpis(!showKpis)}>
                    {showKpis ? 'Ocultar KPIs' : 'Ver KPIs'}
                </Button>
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={onNuevaSubReceta}>
                    Nueva Sub-receta
                </Button>
            </div>
        }
      />

      {showKpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 animate-fade-in">
          <SummaryCard label="Total Preparaciones" value={`${subRecetasProcesadas.length} Activas`} />
          <SummaryCard 
            label="Economía Circular" 
            value={`${subRecetasProcesadas.filter(sr => sr.control_mermas_economia_circular).length} / ${subRecetasProcesadas.length}`} 
            valueClassName="text-success"
          />
          <SummaryCard 
            label="Costo Promedio / ml" 
            value={`$${subRecetasProcesadas.length > 0 ? (subRecetasProcesadas.reduce((acc, sr) => acc + (sr.costo_unitario_clp || 0), 0) / subRecetasProcesadas.length).toFixed(1) : '0'}`}
            valueClassName="text-info"
          />
        </div>
      )}

      <TableToolbar 
        busqueda={busqueda}
        onBusquedaChange={(val) => { setBusqueda(val); setPaginaActual(1); }}
        placeholder="Buscar por nombre o tipo..."
        limite={limite}
        onLimiteChange={(val) => { setLimite(val); setPaginaActual(1); }}
      />

      <div className="flex flex-col flex-1 space-y-2">
        <Table className="flex-1">
          <TableHead>
            <tr>
              <TableHeaderCell isSortable sortDirection={columnaOrden === 'nombre' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('nombre')}>Nombre</TableHeaderCell>
              <TableHeaderCell isSortable sortDirection={columnaOrden === 'tipo' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('tipo')}>Tipo</TableHeaderCell>
              <TableHeaderCell align="right" isSortable sortDirection={columnaOrden === 'rendimiento_batch' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('rendimiento_batch')}>Rendimiento</TableHeaderCell>
              <TableHeaderCell align="right" isSortable sortDirection={columnaOrden === 'costo_lote_clp' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('costo_lote_clp')}>Costo Lote</TableHeaderCell>
              <TableHeaderCell align="right" isSortable sortDirection={columnaOrden === 'costo_unitario_clp' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('costo_unitario_clp')}>Costo Unit</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {paginadas.map((sr) => {
              const tipoObj = tipos.find(t => t.id === sr.tipo_id);
              return (
                <TableRow key={sr.id} isClickable onClick={() => onVerDetalle(sr)}>
                  <TableCell className="font-bold">{sr.nombre}</TableCell>
                  <TableCell><Badge variant="info" size="sm">{tipoObj?.nombre || '-'}</Badge></TableCell>
                  <TableCell align="right" className="font-mono">{Number(sr.rendimiento_batch).toLocaleString('es-CL')} {sr.unidad_rendimiento}</TableCell>
                  <TableCell align="right" className="font-mono">${sr.costo_lote_clp?.toLocaleString('es-CL') || 0}</TableCell>
                  <TableCell align="right" className="font-mono text-primary font-bold">${sr.costo_unitario_clp?.toFixed(2) || 0}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination 
          paginaActual={paginaSegura}
          totalPaginas={totalPaginas}
          onCambiarPagina={setPaginaActual}
          elementosMostrados={paginadas.length}
          totalElementos={totalRegistros}
        />
      </div>
    </div>
  );
}