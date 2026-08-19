// src/modules/subrecetas/SubRecetasListView.tsx
import { useState, useMemo } from 'react';
import { Plus, Layers } from 'lucide-react';

// Importamos los átomos y componentes del UI Kit
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TableToolbar, TablePagination } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { ModuleHeader } from '@/components/ui/ModuleHeader';

// Tipos basados en tu esquema
import type { SubReceta, TipoSubReceta } from '@/types/subrecetas';

export type SubRecetaViewItem = SubReceta & {
  categoria_nombre?: string;
  costo_lote_clp?: number;
  costo_unitario_clp?: number;
};

interface SubRecetasListViewProps {
  data: SubRecetaViewItem[];
  tipos: TipoSubReceta[];
  onNuevaSubReceta: () => void;
  onVerDetalle: (subReceta: SubRecetaViewItem) => void;
}

export function SubRecetasListView({ 
  data, 
  tipos, 
  onNuevaSubReceta, 
  onVerDetalle 
}: SubRecetasListViewProps) {
  
  // Estados de interfaz
  const [busqueda, setBusqueda] = useState('');
  const [limite, setLimite] = useState(25);
  const [paginaActual, setPaginaActual] = useState(1);
  const [ordenAsc, setOrdenAsc] = useState(true);
  const [showKpis, setShowKpis] = useState(true);

  // Filtrado y ordenamiento reactivo
  const subRecetasProcesadas = useMemo(() => {
    let filtradas = data.filter(sr => {
      const tipoObj = tipos.find(t => t.id === sr.tipo_id);
      const coincidenciaNombre = sr.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincidenciaTipo = tipoObj?.nombre.toLowerCase().includes(busqueda.toLowerCase());
      return coincidenciaNombre || coincidenciaTipo;
    });

    filtradas.sort((a, b) => {
      const nombreA = a.nombre.toLowerCase();
      const nombreB = b.nombre.toLowerCase();
      return ordenAsc ? (nombreA > nombreB ? 1 : -1) : (nombreA < nombreB ? 1 : -1);
    });

    return filtradas;
  }, [data, tipos, busqueda, ordenAsc]);

  // Cálculos de Paginación segura
  const totalRegistros = subRecetasProcesadas.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / limite));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  
  const inicio = (paginaSegura - 1) * limite;
  const paginadas = subRecetasProcesadas.slice(inicio, inicio + limite);

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in p-4 md:p-6 bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* 1. NUEVO MODULE HEADER TRANSPARENTE */}
      <ModuleHeader 
        icon={<Layers size={20} />}
        title="Sub-recetas Artesanales"
        subtitle="Gestión de preparaciones intermedias, pre-batches y escandallos de producción."
        showKpis={showKpis}
        onToggleKpis={() => setShowKpis(!showKpis)}
        kpiButtonText="KPIs"
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
                {subRecetasProcesadas.length} <span className="text-xs font-normal text-slate-500">Activas</span>
              </>
            } 
          />

          <SummaryCard 
            label="Economía Circular" 
            value={
              <>
                {subRecetasProcesadas.filter(sr => sr.control_mermas_economia_circular && sr.control_mermas_economia_circular.trim() !== '').length}
                <span className="text-xs font-normal text-slate-500"> / {subRecetasProcesadas.length}</span>
              </>
            }
            valueClassName="text-emerald-400"
          />

          <SummaryCard 
            label="Costo Promedio / ml" 
            value={
              `$${subRecetasProcesadas.length > 0 ? (subRecetasProcesadas.reduce((acc, sr) => acc + (sr.costo_unitario_clp || 0), 0) / subRecetasProcesadas.length).toFixed(1) : '0'}`
            }
            valueClassName="text-sky-400"
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
      <Table className="flex-1">
        <TableHead>
          <tr>
            <TableHeaderCell isSortable onClick={() => setOrdenAsc(!ordenAsc)}>Nombre {ordenAsc ? '↓' : '↑'}</TableHeaderCell>
            <TableHeaderCell>Tipo</TableHeaderCell>
            <TableHeaderCell align="right">Rendimiento (Batch)</TableHeaderCell>
            <TableHeaderCell align="right">Costo Lote</TableHeaderCell>
            <TableHeaderCell align="right">Costo Unitario</TableHeaderCell>
            <TableHeaderCell align="center">Acciones</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {paginadas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" className="py-12 text-slate-500 font-mono">
                {data.length === 0 ? 'Cargando catálogo de preparaciones...' : 'No se encontraron sub-recetas.'}
              </TableCell>
            </TableRow>
          ) : (
            paginadas.map((sr) => {
              const tipoObj = tipos.find(t => t.id === sr.tipo_id);
              
              return (
                <TableRow key={sr.id} isClickable onClick={() => onVerDetalle(sr)}>
                  <TableCell className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {sr.nombre}
                  </TableCell>
                  
                  <TableCell className="font-mono text-[11px] text-purple-400 uppercase tracking-wider">
                    {tipoObj?.nombre || '-'}
                  </TableCell>
                  
                  <TableCell align="right" className="font-mono text-slate-300">
                    {Number(sr.rendimiento_batch).toLocaleString('es-CL')} {sr.unidad_rendimiento}
                  </TableCell>
                  
                  <TableCell align="right" className="font-mono text-pink-400">
                    ${sr.costo_lote_clp?.toLocaleString('es-CL') || 0}
                  </TableCell>
                  
                  <TableCell align="right" className="font-mono text-emerald-400 font-bold">
                    ${sr.costo_unitario_clp?.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0} / {sr.unidad_rendimiento}
                  </TableCell>
                  
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => onVerDetalle(sr)}
                      className="h-7 text-[10px] bg-slate-800 hover:bg-emerald-950/50 hover:text-emerald-400 hover:border-emerald-900/50"
                    >
                      Ver Ficha
                    </Button>
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
  );
}