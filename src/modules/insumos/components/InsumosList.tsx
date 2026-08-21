// src/modules/insumos/components/InsumosList.tsx
import { useState, useMemo } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import type { Insumo, TipoInsumo } from '@/types/insumos';

// Importamos los átomos y componentes del UI Kit unificados
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

interface Props {
  insumos: Insumo[];
  tipos: TipoInsumo[];
  cargando: boolean;
  onVerDetalle: (insumo: Insumo) => void;
  onNuevo: () => void;
}

export function InsumosList({ insumos, tipos, cargando, onVerDetalle, onNuevo }: Props) {
  const [buscador, setBuscador] = useState('');
  const [porPagina, setPorPagina] = useState(10);
  const [pagina, setPagina] = useState(1);
  const [columnaOrden, setColumnaOrden] = useState<keyof Insumo>('nombre');
  const [dirOrden, setDirOrden] = useState<'asc' | 'desc'>('asc');
  const [showKpis, setShowKpis] = useState(false);

  const manejarOrden = (col: keyof Insumo) => {
    if (columnaOrden === col) {
      setDirOrden(dirOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setColumnaOrden(col);
      setDirOrden('asc');
    }
  };

  const insumosFiltradosYOrdenados = useMemo(() => {
    const filtrados = insumos.filter(i => {
      const q = buscador.toLowerCase();
      const nombreMatch = i.nombre.toLowerCase().includes(q);
      const tipoObj = tipos.find(t => t.id === i.tipo_id);
      const tipoMatch = tipoObj ? tipoObj.nombre.toLowerCase().includes(q) : false;
      return nombreMatch || tipoMatch;
    });

    return filtrados.sort((a, b) => {
      const valA = a[columnaOrden];
      const valB = b[columnaOrden];

      // Manejo de ordenamiento específico para tipo
      if (columnaOrden === 'tipo_id') {
        const nomA = tipos.find(t => t.id === a.tipo_id)?.nombre || '';
        const nomB = tipos.find(t => t.id === b.tipo_id)?.nombre || '';
        return dirOrden === 'asc' ? nomA.localeCompare(nomB) : nomB.localeCompare(nomA);
      }

      // Ordenamiento genérico
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (valA < valB) return dirOrden === 'asc' ? -1 : 1;
      if (valA > valB) return dirOrden === 'asc' ? 1 : -1;
      return 0;
    });
  }, [insumos, buscador, tipos, columnaOrden, dirOrden]);

  const totalPaginas = Math.ceil(insumosFiltradosYOrdenados.length / porPagina) || 1;
  const paginaSegura = Math.min(pagina, totalPaginas);

  const paginados = useMemo(() => {
    const inicio = (paginaSegura - 1) * porPagina;
    return insumosFiltradosYOrdenados.slice(inicio, inicio + porPagina);
  }, [insumosFiltradosYOrdenados, paginaSegura, porPagina]);

  const totalInsumos = insumos.length;
  const artesanalesCount = insumos.filter(i => i.es_artesanal).length;
  const costoPromedio = totalInsumos > 0 
    ? (insumos.reduce((acc, i) => acc + (Number(i.costo_unitario) || 0), 0) / totalInsumos).toFixed(2)
    : '0';

  return (
    <div className="flex flex-col min-h-full w-full space-y-4 p-4 md:p-6 bg-background text-foreground animate-fade-in">
      
      <ModuleHeader 
        icon={<ShoppingCart size={20} />}
        title="Gestión de Insumos"
        // Mostramos el botón de KPIs solo si hay datos
        action={
            <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowKpis(!showKpis)}>
                    {showKpis ? 'Ocultar KPIs' : 'Ver KPIs'}
                </Button>
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={onNuevo}>
                    Nuevo Insumo
                </Button>
            </div>
        }
      />

      {showKpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 animate-fade-in">
          <SummaryCard label="Total Insumos" value={<>{totalInsumos} <span className="text-xs font-normal text-muted">Registrados</span></>} />
          <SummaryCard label="Insumos Artesanales" value={<>{artesanalesCount} <span className="text-xs font-normal text-muted">/ {totalInsumos}</span></>} valueClassName="text-purple-400" />
          <SummaryCard label="Costo Unitario Promedio" value={`$${costoPromedio}`} valueClassName="text-primary" />
        </div>
      )}

      <TableToolbar 
        busqueda={buscador}
        onBusquedaChange={(val) => { setBuscador(val); setPagina(1); }}
        placeholder="Buscar insumo por nombre o tipo..."
        limite={porPagina}
        onLimiteChange={(val) => { setPorPagina(val); setPagina(1); }}
      />

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell isSortable sortDirection={columnaOrden === 'nombre' ? dirOrden : null} onSort={() => manejarOrden('nombre')}>Nombre</TableHeaderCell>
            <TableHeaderCell isSortable sortDirection={columnaOrden === 'tipo_id' ? dirOrden : null} onSort={() => manejarOrden('tipo_id')}>Tipo</TableHeaderCell>
            <TableHeaderCell isSortable sortDirection={columnaOrden === 'es_artesanal' ? dirOrden : null} onSort={() => manejarOrden('es_artesanal')} align="center">Artesanal</TableHeaderCell>
            <TableHeaderCell isSortable sortDirection={columnaOrden === 'graduacion_alcohol_base' ? dirOrden : null} onSort={() => manejarOrden('graduacion_alcohol_base')} align="center">ABV %</TableHeaderCell>
            <TableHeaderCell isSortable sortDirection={columnaOrden === 'precio_compra' ? dirOrden : null} onSort={() => manejarOrden('precio_compra')} align="right">Precio</TableHeaderCell>
            <TableHeaderCell isSortable sortDirection={columnaOrden === 'costo_unitario' ? dirOrden : null} onSort={() => manejarOrden('costo_unitario')} align="right">Costo Unit</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {cargando ? (
            <TableRow><TableCell colSpan={6} align="center" className="py-12 text-muted animate-pulse">Cargando...</TableCell></TableRow>
          ) : paginados.length === 0 ? (
            <TableRow><TableCell colSpan={6} align="center" className="py-12 text-muted">No se encontraron insumos.</TableCell></TableRow>
          ) : (
            paginados.map(insumo => {
              const tipoObj = tipos.find(t => t.id === insumo.tipo_id);
              return (
                <TableRow key={insumo.id} isClickable onClick={() => onVerDetalle(insumo)}>
                  <TableCell className="font-bold">{insumo.nombre}</TableCell>
                  <TableCell className="text-muted">{tipoObj?.nombre || 'General'}</TableCell>
                  <TableCell align="center">{insumo.es_artesanal ? <Badge variant="purple" size="sm">Sí</Badge> : <span className="text-muted text-xs">No</span>}</TableCell>
                  <TableCell align="center" className="font-mono text-emerald-400">{insumo.graduacion_alcohol_base > 0 ? `${insumo.graduacion_alcohol_base}%` : '-'}</TableCell>
                  <TableCell align="right" className="font-mono">${insumo.precio_compra.toLocaleString('es-CL')}</TableCell>
                  <TableCell align="right" className="font-mono text-primary font-bold">${Number(insumo.costo_unitario).toFixed(4)}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination 
        paginaActual={paginaSegura}
        totalPaginas={totalPaginas}
        onCambiarPagina={setPagina}
        elementosMostrados={paginados.length}
        totalElementos={insumosFiltradosYOrdenados.length}
      />
    </div>
  );
}