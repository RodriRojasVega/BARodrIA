// src/modules/coctel/components/CoctelList.tsx
import { useState, useMemo } from 'react';
import { Martini, Plus } from 'lucide-react';
import type { Coctel } from '@/types/coctel';
import type { CatalogosState } from '../hooks/useCocteles';

// UI Kit Maestro
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TablePagination, TableToolbar } from '@/components/ui/Table';

interface CoctelListProps {
  data: Coctel[];
  catalogos: CatalogosState;
  isLoading: boolean;
  onNuevo: () => void;
  onVerDetalle: (coctel: Coctel) => void;
}

export function CoctelList({ data, catalogos, isLoading, onNuevo, onVerDetalle }: CoctelListProps) {
  const [busqueda, setBusqueda] = useState('');
  const [limite, setLimite] = useState(25);
  const [paginaActual, setPaginaActual] = useState(1);
  const [showKpis, setShowKpis] = useState(false);

  // Estados de ordenamiento global (Incluye soporte_nombre)
  const [columnaOrden, setColumnaOrden] = useState<keyof Coctel | 'categoria_nombre' | 'familia_nombre' | 'tecnica_nombre' | 'soporte_nombre'>('nombre');
  const [ordenAsc, setOrdenAsc] = useState(true);

  const manejarOrden = (col: typeof columnaOrden) => {
    if (columnaOrden === col) {
      setOrdenAsc(!ordenAsc);
    } else {
      setColumnaOrden(col);
      setOrdenAsc(true);
    }
  };

  // Filtrado y ordenamiento reactivo
  const datosProcesados = useMemo(() => {
    // 1. Filtrar
    let filtrados = data.filter(c => {
      const catNombre = catalogos.categorias.find(cat => cat.id === c.categoria_id)?.nombre || '';
      return (
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        catNombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    });

    // 2. Ordenar
    filtrados.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (columnaOrden === 'categoria_nombre') {
        valA = catalogos.categorias.find(c => c.id === a.categoria_id)?.nombre || '';
        valB = catalogos.categorias.find(c => c.id === b.categoria_id)?.nombre || '';
      } else if (columnaOrden === 'familia_nombre') {
        valA = catalogos.familias.find(c => c.id === a.familia_id)?.nombre || '';
        valB = catalogos.familias.find(c => c.id === b.familia_id)?.nombre || '';
      } else if (columnaOrden === 'tecnica_nombre') {
        valA = catalogos.tecnicas.find(c => c.id === a.tecnica_id)?.nombre || '';
        valB = catalogos.tecnicas.find(c => c.id === b.tecnica_id)?.nombre || '';
      } else if (columnaOrden === 'soporte_nombre') {
        valA = catalogos.soportes.find(c => c.id === a.soporte_id)?.nombre || '';
        valB = catalogos.soportes.find(c => c.id === b.soporte_id)?.nombre || '';
      } else {
        // Fallback para campos numéricos/directos (nombre, abv, costo, etc.)
        valA = a[columnaOrden as keyof Coctel] || 0;
        valB = b[columnaOrden as keyof Coctel] || 0;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return ordenAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return ordenAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    return filtrados;
  }, [data, catalogos, busqueda, columnaOrden, ordenAsc]);

  // Paginación segura
  const totalRegistros = datosProcesados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / limite));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaSegura - 1) * limite;
  const datosPaginados = datosProcesados.slice(inicio, inicio + limite);

  const costoPromedio = datosProcesados.length > 0 
    ? (datosProcesados.reduce((acc, curr) => acc + Number(curr.costo_produccion || 0), 0) / datosProcesados.length).toFixed(0)
    : '0';

  return (
    <div className="flex flex-col min-h-full w-full space-y-4 p-4 md:p-6 bg-background text-foreground animate-fade-in overflow-hidden">
      
      {/* MODULE HEADER */}
      <ModuleHeader 
        icon={<Martini size={20} />}
        title="Directorio de Cócteles"
        showKpis={showKpis}
        onToggleKpis={() => setShowKpis(!showKpis)}
        kpiButtonText="KPIs"
        primaryAction={
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={onNuevo}>
            Nuevo Cóctel
          </Button>
        }
      />

      {/* KPIS DESPLEGABLES */}
      {showKpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 animate-fade-in">
          <SummaryCard label="Total Catálogo" value={totalRegistros.toString()} valueClassName="text-primary" />
          <SummaryCard label="Costo Promedio (COGS)" value={`$${costoPromedio}`} valueClassName="text-info" />
          <SummaryCard label="Estado Motor Matemático" value="Activo" valueClassName="text-success" />
        </div>
      )}

      {/* BARRA DE HERRAMIENTAS */}
      <TableToolbar 
        busqueda={busqueda}
        onBusquedaChange={(val) => { setBusqueda(val); setPaginaActual(1); }}
        placeholder="Buscar por nombre o categoría..."
        limite={limite}
        onLimiteChange={(val) => { setLimite(val); setPaginaActual(1); }}
      />

      {/* TABLA DE RESULTADOS */}
      <div className="flex flex-col flex-1 space-y-2">
        <Table className="flex-1">
          <TableHead>
            <tr>
              <TableHeaderCell isSortable sortDirection={columnaOrden === 'nombre' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('nombre')}>Nombre</TableHeaderCell>
              <TableHeaderCell isSortable sortDirection={columnaOrden === 'categoria_nombre' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('categoria_nombre')}>Categoría</TableHeaderCell>
              <TableHeaderCell isSortable sortDirection={columnaOrden === 'familia_nombre' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('familia_nombre')}>Familia</TableHeaderCell>
              <TableHeaderCell isSortable sortDirection={columnaOrden === 'tecnica_nombre' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('tecnica_nombre')}>Técnica</TableHeaderCell>
              <TableHeaderCell isSortable sortDirection={columnaOrden === 'soporte_nombre' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('soporte_nombre')}>Cristalería</TableHeaderCell>
              <TableHeaderCell align="center" isSortable sortDirection={columnaOrden === 'grado_alcohol' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('grado_alcohol')}>ABV %</TableHeaderCell>
              <TableHeaderCell align="center" isSortable sortDirection={columnaOrden === 'porcentaje_azucar' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('porcentaje_azucar')}>Azúcar %</TableHeaderCell>
              <TableHeaderCell align="right" isSortable sortDirection={columnaOrden === 'costo_produccion' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('costo_produccion')}>COGS</TableHeaderCell>
              <TableHeaderCell align="right" isSortable sortDirection={columnaOrden === 'precio_venta_sugerido' ? (ordenAsc ? 'asc' : 'desc') : null} onSort={() => manejarOrden('precio_venta_sugerido')}>Precio Sugerido</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" className="py-12 text-muted font-mono text-xs animate-pulse">
                  Cargando catálogo de cócteles...
                </TableCell>
              </TableRow>
            ) : datosPaginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" className="py-12 text-muted font-mono text-xs">
                  No se encontraron resultados en el directorio.
                </TableCell>
              </TableRow>
            ) : (
              datosPaginados.map(coctel => {
                const catNombre = catalogos.categorias.find(c => c.id === coctel.categoria_id)?.nombre || '-';
                const famNombre = catalogos.familias.find(c => c.id === coctel.familia_id)?.nombre || '-';
                const tecNombre = catalogos.tecnicas.find(c => c.id === coctel.tecnica_id)?.nombre || '-';
                const sopNombre = catalogos.soportes.find(c => c.id === coctel.soporte_id)?.nombre || '-';

                return (
                  <TableRow 
                    key={coctel.id} 
                    isClickable 
                    onClick={() => onVerDetalle(coctel)}
                  >
                    <TableCell>
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {coctel.nombre}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="info" size="sm" className="uppercase tracking-wider">
                        {catNombre}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-muted text-xs uppercase font-mono">{famNombre}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-muted text-xs uppercase font-mono">{tecNombre}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-muted text-xs uppercase font-mono">{sopNombre}</span>
                    </TableCell>

                    <TableCell align="center">
                      <span className="font-mono text-info font-bold">
                        {Number(coctel.grado_alcohol || 0).toFixed(1)}%
                      </span>
                    </TableCell>

                    <TableCell align="center">
                      <span className="font-mono text-warning font-bold">
                        {Number(coctel.porcentaje_azucar || 0).toFixed(1)}%
                      </span>
                    </TableCell>

                    <TableCell align="right">
                      <span className="font-mono text-foreground/80">
                        ${Number(coctel.costo_produccion || 0).toFixed(0)}
                      </span>
                    </TableCell>
                    
                    <TableCell align="right">
                      <span className="font-mono font-bold text-primary">
                        ${Number(coctel.precio_venta_sugerido || 0).toFixed(0)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <TablePagination 
          paginaActual={paginaSegura}
          totalPaginas={totalPaginas}
          onCambiarPagina={(p) => setPaginaActual(p)}
          elementosMostrados={datosPaginados.length}
          totalElementos={totalRegistros}
        />
      </div>
    </div>
  );
}