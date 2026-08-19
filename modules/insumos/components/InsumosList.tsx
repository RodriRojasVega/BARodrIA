// src/modules/insumos/components/InsumosList.tsx
import { useState, useMemo } from 'react';
import { Plus, Package } from 'lucide-react';
import type { Insumo, TipoInsumo } from '../types';

// Importamos los átomos y componentes del UI Kit unificados
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TableToolbar, TablePagination } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { ModuleHeader } from '@/components/ui/ModuleHeader';

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
  const [showKpis, setShowKpis] = useState(true);

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
      const tipoObj = tipos.find(t => t.id == i.tipo_id);
      const tipoMatch = tipoObj ? tipoObj.nombre.toLowerCase().includes(q) : false;
      return nombreMatch || tipoMatch;
    });

    return filtrados.sort((a, b) => {
      let valA: any = a[columnaOrden];
      let valB: any = b[columnaOrden];

      if (columnaOrden === 'tipo_id') {
        valA = tipos.find(t => t.id == a.tipo_id)?.nombre || '';
        valB = tipos.find(t => t.id == b.tipo_id)?.nombre || '';
      }

      if (valA == null) valA = '';
      if (valB == null) valB = '';

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

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

  // Cálculos para KPIs de Insumos
  const totalInsumos = insumos.length;
  const artesanalesCount = insumos.filter(i => i.es_artesanal).length;
  const costoPromedio = totalInsumos > 0 
    ? (insumos.reduce((acc, i) => acc + (Number(i.costo_unitario) || 0), 0) / totalInsumos).toFixed(2)
    : '0';

  return (
    <div className="flex flex-col h-full w-full overflow-hidden space-y-4 p-4 md:p-6 bg-slate-950 text-slate-100 animate-fade-in">
      
      {/* 1. MODULE HEADER TRANSPARENTE */}
      <ModuleHeader 
        icon={<Package size={20} />}
        title="Gestión de Insumos"
        subtitle="Catálogo maestro, formatos, costos y control de inventario base."
        showKpis={showKpis}
        onToggleKpis={() => setShowKpis(!showKpis)}
        kpiButtonText="KPIs"
        primaryAction={
          <Button 
            variant="primary" 
            size="sm"
            icon={<Plus size={14} />} 
            onClick={onNuevo}
          >
            Nuevo Insumo
          </Button>
        }
      />

      {/* 1.5 TARJETAS DE INDICADORES (KPIs) DESPLEGABLES */}
      {showKpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 animate-fade-in">
          <SummaryCard 
            label="Total Insumos" 
            value={
              <>
                {totalInsumos} <span className="text-xs font-normal text-slate-500">Registrados</span>
              </>
            } 
          />

          <SummaryCard 
            label="Insumos Artesanales" 
            value={
              <>
                {artesanalesCount} <span className="text-xs font-normal text-slate-500">/ {totalInsumos}</span>
              </>
            }
            valueClassName="text-purple-400"
          />

          <SummaryCard 
            label="Costo Unitario Promedio" 
            value={`$${costoPromedio}`}
            valueClassName="text-emerald-400"
          />
        </div>
      )}

      {/* 2. BARRA DE HERRAMIENTAS */}
      <TableToolbar 
        busqueda={buscador}
        onBusquedaChange={(val) => {
          setBuscador(val);
          setPagina(1);
        }}
        placeholder="Buscar insumo por nombre o tipo..."
        limite={porPagina}
        onLimiteChange={(val) => {
          setPorPagina(val);
          setPagina(1);
        }}
      />

      {/* 3. TABLA DE RESULTADOS */}
      <Table className="flex-1">
        <TableHead>
          <tr>
            <TableHeaderCell isSortable sortDirection={columnaOrden === 'nombre' ? dirOrden : null} onSort={() => manejarOrden('nombre')}>
              Nombre
            </TableHeaderCell>
            <TableHeaderCell isSortable sortDirection={columnaOrden === 'tipo_id' ? dirOrden : null} onSort={() => manejarOrden('tipo_id')}>
              Tipo
            </TableHeaderCell>
            <TableHeaderCell align="center">Artesanal</TableHeaderCell>
            <TableHeaderCell align="center">Graduación</TableHeaderCell>
            <TableHeaderCell align="right">Precio Compra</TableHeaderCell>
            <TableHeaderCell align="center">Envase</TableHeaderCell>
            <TableHeaderCell align="center">Unidad</TableHeaderCell>
            <TableHeaderCell align="center">Rendimiento</TableHeaderCell>
            <TableHeaderCell align="right">Costo Unitario</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {cargando ? (
            <TableRow>
              <TableCell colSpan={9} align="center" className="py-12 text-slate-500 text-xs font-mono animate-pulse">
                Cargando inventario...
              </TableCell>
            </TableRow>
          ) : paginados.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center" className="py-12 text-slate-500 text-xs font-mono">
                No se encontraron insumos.
              </TableCell>
            </TableRow>
          ) : (
            paginados.map(insumo => {
              const tipoObj = tipos.find(t => t.id == insumo.tipo_id);
              const rendimientoPct = insumo.rendimiento_neto_porcentaje ? `${(insumo.rendimiento_neto_porcentaje * 100).toFixed(0)}%` : '100%';
              
              return (
                <TableRow key={insumo.id} isClickable onClick={() => onVerDetalle(insumo)}>
                  <TableCell className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {insumo.nombre}
                  </TableCell>
                  <TableCell className="text-slate-400 text-xs font-mono">
                    {tipoObj ? tipoObj.nombre : 'General'}
                  </TableCell>
                  <TableCell align="center">
                    {insumo.es_artesanal ? (
                      <span className="bg-purple-950 text-purple-400 border border-purple-900/30 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Sí</span>
                    ) : (
                      <span className="text-slate-500 text-xs">No</span>
                    )}
                  </TableCell>
                  <TableCell align="center" className="text-amber-400 font-semibold">
                    {insumo.graduacion_alcohol_base > 0 ? `${insumo.graduacion_alcohol_base}%` : '-'}
                  </TableCell>
                  <TableCell align="right" className="font-mono text-slate-200">
                    ${insumo.precio_compra?.toLocaleString('es-CL')}
                  </TableCell>
                  <TableCell align="center" className="font-mono text-slate-300 text-xs">
                    {insumo.formato_envase}
                  </TableCell>
                  <TableCell align="center" className="font-mono text-slate-400 text-xs">
                    {insumo.unidad_medida}
                  </TableCell>
                  <TableCell align="center" className="font-mono text-slate-300 text-xs">
                    {rendimientoPct}
                  </TableCell>
                  <TableCell align="right" className="font-mono text-emerald-400 font-bold">
                    ${Number(insumo.costo_unitario).toFixed(4)}
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
        onCambiarPagina={(p) => setPagina(p)}
        elementosMostrados={insumosFiltradosYOrdenados.length === 0 ? 0 : paginados.length}
        totalElementos={insumosFiltradosYOrdenados.length}
      />

    </div>
  );
}