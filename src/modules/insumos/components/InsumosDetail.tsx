// src/modules/insumos/components/InsumosDetail.tsx
import { useState, useMemo } from 'react';
import { ArrowLeft, Edit3, Trash2, Info, Truck, History } from 'lucide-react';

// Tipos
import type { Insumo, TipoInsumo, InsumoPrecioHistorico } from '@/types/insumos';

// UI Kit
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { Button } from '@/components/ui/Button';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TableToolbar, TablePagination } from '@/components/ui/Table';

export interface InsumoHistorico {
  id: string | number;
  fecha: string;
  proveedor_nombre?: string;
  precio_compra: number;
  costo_unitario: number;
  motivo?: string;
}

interface Props {
  insumo: Insumo;
  tipos: TipoInsumo[];
  historialPrecios?: InsumoHistorico[];
  cargandoHistorial?: boolean;
  onVolver: () => void;
  onEditar: () => void;
  onEliminar: (id: number, nombre: string) => void;
}

export function InsumosDetail({ 
  insumo, 
  tipos, 
  historialPrecios = [], 
  cargandoHistorial = false,
  onVolver, 
  onEditar, 
  onEliminar 
}: Props) {
  const [activeTab, setActiveTab] = useState('info');
  
  // Estados para Tabla Proveedores
  const [busquedaProv, setBusquedaProv] = useState('');
  const [paginaProv, setPaginaProv] = useState(1);
  const [colProv, setColProv] = useState<'nombre' | 'precio_oferta'>('nombre');
  const [dirProv, setDirProv] = useState<'asc' | 'desc'>('asc');
  const [provsPorPagina, setProvsPorPagina] = useState(5);

  // Estados para Tabla Historial
  const [busquedaHist, setBusquedaHist] = useState('');
  const [paginaHist, setPaginaHist] = useState(1);
  const [colHist, setColHist] = useState<keyof InsumoHistorico>('fecha');
  const [dirHist, setDirHist] = useState<'desc' | 'asc'>('desc');
  const [histPorPagina, setHistPorPagina] = useState(10);

  const _tipoNombre = tipos.find(t => t.id === insumo.tipo_id)?.nombre || 'General';
  const rendimientoPct = insumo.rendimiento_neto_porcentaje ? (insumo.rendimiento_neto_porcentaje * 100).toFixed(0) : '100';

  // Lógica de ordenamiento normalizada
  const manejarOrdenProv = (col: 'nombre' | 'precio_oferta') => {
    if (colProv === col) setDirProv(dirProv === 'asc' ? 'desc' : 'asc');
    else { setColProv(col); setDirProv('asc'); }
  };

  const manejarOrdenHist = (col: keyof InsumoHistorico) => {
    if (colHist === col) setDirHist(dirHist === 'asc' ? 'desc' : 'asc');
    else { setColHist(col); setDirHist(col === 'fecha' ? 'desc' : 'asc'); }
  };

  const proveedoresProcesados = useMemo(() => {
    if (!insumo.proveedores) return [];
    return [...insumo.proveedores].filter(p => 
      p.nombre.toLowerCase().includes(busquedaProv.toLowerCase())
    ).sort((a, b) => {
      const valA = a[colProv] ?? '';
      const valB = b[colProv] ?? '';
      if (typeof valA === 'string' && typeof valB === 'string') 
        return dirProv === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return dirProv === 'asc' ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
    });
  }, [insumo.proveedores, busquedaProv, colProv, dirProv]);

  const totalPaginasProv = Math.ceil(proveedoresProcesados.length / provsPorPagina) || 1;
  const paginaProvSegura = Math.min(paginaProv, totalPaginasProv); 
  const provsPaginados = proveedoresProcesados.slice((paginaProvSegura - 1) * provsPorPagina, paginaProvSegura * provsPorPagina);

  const historialProcesado = useMemo(() => {
    return [...historialPrecios].filter(h => {
      const query = busquedaHist.toLowerCase();
      return (h.motivo?.toLowerCase().includes(query) || h.proveedor_nombre?.toLowerCase().includes(query));
    }).sort((a, b) => {
      const valA = a[colHist] ?? '';
      const valB = b[colHist] ?? '';
      if (colHist === 'fecha') return dirHist === 'asc' ? new Date(valA).getTime() - new Date(valB).getTime() : new Date(valB).getTime() - new Date(valA).getTime();
      return dirHist === 'asc' ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
    });
  }, [historialPrecios, busquedaHist, colHist, dirHist]);

  const totalPaginasHist = Math.ceil(historialProcesado.length / histPorPagina) || 1;
  const paginaHistSegura = Math.min(paginaHist, totalPaginasHist);
  const histPaginado = historialProcesado.slice((paginaHistSegura - 1) * histPorPagina, paginaHistSegura * histPorPagina);

  return (
    <div className="flex flex-col min-h-full w-full space-y-3 p-4 md:p-6 bg-background text-foreground animate-fade-in">
      
      <ModuleHeader 
        title={insumo.nombre}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={onVolver}>Volver</Button>
            <Button variant="secondary" size="sm" icon={<Edit3 size={14} />} onClick={onEditar}>Editar</Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => onEliminar(insumo.id, insumo.nombre)}>Eliminar</Button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col">
        <Tabs 
          activeTab={activeTab} 
          onChangeTab={setActiveTab}
          tabs={[
            { id: 'info', label: 'Información y Costos', icon: <Info size={16}/> },
            { id: 'proveedores', label: 'Proveedores Asociados', icon: <Truck size={16}/> },
            { id: 'historico', label: 'Historial', icon: <History size={16}/> }
          ]}
        />

        <TabPanel id="info" activeTab={activeTab}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <SummaryCard label="Total Compra" value={`$${insumo.precio_compra.toLocaleString('es-CL')}`} />
            <SummaryCard label="Formato" value={`${insumo.formato_envase} ${insumo.unidad_medida}`} valueClassName="font-mono" />
            <SummaryCard label="Rendimiento" value={`${rendimientoPct}%`} valueClassName={insumo.rendimiento_neto_porcentaje && insumo.rendimiento_neto_porcentaje < 1 ? 'text-warning' : 'text-success'} />
            <SummaryCard label="ABV %" value={insumo.graduacion_alcohol_base > 0 ? `${insumo.graduacion_alcohol_base}%` : '0%'} valueClassName="text-amber-500 font-mono" />
            <SummaryCard label="Costo Unitario" value={`$${Number(insumo.costo_unitario).toFixed(4)}`} valueClassName="text-primary font-bold font-mono" />
          </div>
        </TabPanel>

        <TabPanel id="proveedores" activeTab={activeTab}>
          <TableToolbar busqueda={busquedaProv} onBusquedaChange={val => {setBusquedaProv(val); setPaginaProv(1)}} limite={provsPorPagina} onLimiteChange={setProvsPorPagina} />
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell isSortable onSort={() => manejarOrdenProv('nombre')}>Proveedor</TableHeaderCell>
                <TableHeaderCell align="right" isSortable onSort={() => manejarOrdenProv('precio_oferta')}>Precio</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {provsPaginados.length === 0 ? (
                <TableRow><TableCell colSpan={2} align="center" className="text-muted">Sin proveedores</TableCell></TableRow>
              ) : (
                provsPaginados.map(p => (
                  <TableRow key={p.proveedor_id}>
                    <TableCell className="font-bold">{p.nombre}</TableCell>
                    <TableCell align="right" className="font-mono text-primary font-bold">
                      {p.precio_oferta ? `$${p.precio_oferta.toLocaleString('es-CL')}` : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination paginaActual={paginaProvSegura} totalPaginas={totalPaginasProv} onCambiarPagina={setPaginaProv} elementosMostrados={provsPaginados.length} totalElementos={proveedoresProcesados.length} />
        </TabPanel>

        <TabPanel id="historico" activeTab={activeTab}>
          <TableToolbar busqueda={busquedaHist} onBusquedaChange={val => {setBusquedaHist(val); setPaginaHist(1)}} limite={histPorPagina} onLimiteChange={setHistPorPagina} />
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell isSortable onSort={() => manejarOrdenHist('fecha')}>Fecha</TableHeaderCell>
                <TableHeaderCell>Motivo</TableHeaderCell>
                <TableHeaderCell>Proveedor</TableHeaderCell>
                <TableHeaderCell align="right" isSortable onSort={() => manejarOrdenHist('precio_compra')}>Precio de Compra</TableHeaderCell>
                <TableHeaderCell align="right" isSortable onSort={() => manejarOrdenHist('costo_unitario')}>Costo Unitario</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {cargandoHistorial ? (
                <TableRow><TableCell colSpan={5} align="center" className="text-muted animate-pulse">Cargando...</TableCell></TableRow>
              ) : histPaginado.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" className="text-muted">No hay histórico</TableCell></TableRow>
              ) : (
                histPaginado.map(h => (
                  <TableRow key={h.id}>
                    <TableCell>{new Date(h.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{h.motivo}</TableCell>
                    <TableCell>{h.proveedor_nombre || '-'}</TableCell>
                    <TableCell align="right">${h.precio_compra.toLocaleString('es-CL')}</TableCell>
                    <TableCell align="right">${h.costo_unitario.toFixed(4)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination paginaActual={paginaHistSegura} totalPaginas={totalPaginasHist} onCambiarPagina={setPaginaHist} elementosMostrados={histPaginado.length} totalElementos={historialProcesado.length} />
        </TabPanel>
      </div>
    </div>
  );
}