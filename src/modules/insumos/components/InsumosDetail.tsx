// src/modules/insumos/components/InsumosDetail.tsx
import { useState, useMemo } from 'react';
import { ArrowLeft, Edit3, Trash2, Info, Truck, History, Package } from 'lucide-react';
import type { Insumo, TipoInsumo } from '../types';

// Componentes del UI Kit Maestro 2.0
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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

  const tipoNombre = tipos.find(t => t.id == insumo.tipo_id)?.nombre || 'General';
  const rendimientoPct = insumo.rendimiento_neto_porcentaje ? (insumo.rendimiento_neto_porcentaje * 100).toFixed(0) : '100';

  // Manejadores de Orden
  const manejarOrdenProv = (col: 'nombre' | 'precio_oferta') => {
    if (colProv === col) setDirProv(dirProv === 'asc' ? 'desc' : 'asc');
    else { setColProv(col); setDirProv('asc'); }
  };

  const manejarOrdenHist = (col: keyof InsumoHistorico) => {
    if (colHist === col) setDirHist(dirHist === 'asc' ? 'desc' : 'asc');
    else { setColHist(col); setDirHist(col === 'fecha' ? 'desc' : 'asc'); }
  };

  // Lógica Tabla Proveedores
  const proveedoresProcesados = useMemo(() => {
    if (!insumo.proveedores) return [];
    const filtrados = insumo.proveedores.filter(p => {
      if (!busquedaProv) return true;
      return p.nombre.toLowerCase().includes(busquedaProv.toLowerCase());
    });
    
    return filtrados.sort((a, b) => {
      let valA = a[colProv]; let valB = b[colProv];
      if (valA == null) valA = ''; if (valB == null) valB = '';
      if (typeof valA === 'string' && typeof valB === 'string') return dirProv === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return dirProv === 'asc' ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
    });
  }, [insumo.proveedores, busquedaProv, colProv, dirProv]);
  
  const totalPaginasProv = Math.ceil(proveedoresProcesados.length / provsPorPagina) || 1;
  const paginaProvSegura = Math.min(paginaProv, totalPaginasProv); 
  const provsPaginados = proveedoresProcesados.slice((paginaProvSegura - 1) * provsPorPagina, paginaProvSegura * provsPorPagina);

  // Lógica Tabla Historial
  const historialProcesado = useMemo(() => {
    const filtrados = historialPrecios.filter(h => {
      if (!busquedaHist) return true; 
      
      const query = busquedaHist.toLowerCase();
      const strMotivo = h.motivo?.toLowerCase() || '';
      const strProveedor = h.proveedor_nombre?.toLowerCase() || 'costo base general';
      
      return strMotivo.includes(query) || strProveedor.includes(query);
    });

    return filtrados.sort((a, b) => {
      let valA = a[colHist]; let valB = b[colHist];
      if (valA == null) valA = ''; if (valB == null) valB = '';
      if (colHist === 'fecha') {
        const dateA = new Date(valA).getTime(); const dateB = new Date(valB).getTime();
        return dirHist === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (typeof valA === 'string' && typeof valB === 'string') return dirHist === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return dirHist === 'asc' ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
    });
  }, [historialPrecios, busquedaHist, colHist, dirHist]);

  const totalPaginasHist = Math.ceil(historialProcesado.length / histPorPagina) || 1;
  const paginaHistSegura = Math.min(paginaHist, totalPaginasHist);
  const histPaginado = historialProcesado.slice((paginaHistSegura - 1) * histPorPagina, paginaHistSegura * histPorPagina);

  return (
    <div className="flex flex-col min-h-full w-full space-y-3 p-4 md:p-6 bg-background text-foreground animate-fade-in">
      
      {/* CABECERA MAESTRA */}
      <ModuleHeader 
        icon={<Package size={20} />}
        title={insumo.nombre}
        badges={
          <>
            <Badge variant="default" size="sm">{tipoNombre}</Badge>
            {insumo.es_artesanal ? (
              <Badge variant="purple" size="sm">Producción Propia</Badge>
            ) : (
              <Badge variant="info" size="sm">Industrial / Comercial</Badge>
            )}
          </>
        }
        primaryAction={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={onVolver}>
              Volver
            </Button>
            <Button variant="secondary" size="sm" icon={<Edit3 size={14} />} onClick={onEditar}>
              Editar
            </Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => onEliminar(insumo.id, insumo.nombre)}>
              Eliminar
            </Button>
          </div>
        }
      />

      {/* SISTEMA DE PESTAÑAS (Espaciado reducido a space-y-2) */}
      <div className="flex-1 flex flex-col">
        
        <Tabs 
          activeTab={activeTab} 
          onChangeTab={setActiveTab}
          tabs={[
            { id: 'info', label: 'Información y Costos', icon: <Info size={16}/>, activeColor: 'text-primary border-primary' },
            { id: 'proveedores', label: 'Proveedores Asociados', icon: <Truck size={16}/>, activeColor: 'text-primary border-primary' },
            { id: 'historico', label: 'Historial de Variaciones', icon: <History size={16}/>, activeColor: 'text-primary border-primary' }
          ]}
        />

        {/* TAB 1: INFORMACIÓN GENERAL */}
        <TabPanel id="info" activeTab={activeTab}>
          <div className="animate-fade-in pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <SummaryCard label="Total Compra" value={`$${insumo.precio_compra?.toLocaleString('es-CL')}`} valueClassName="text-foreground" />
              <SummaryCard label="Formato / Envase" value={`${insumo.formato_envase} ${insumo.unidad_medida}`} valueClassName="text-foreground font-mono" />
              <SummaryCard label="Rendimiento Neto" value={`${rendimientoPct}%`} valueClassName={insumo.rendimiento_neto_porcentaje < 1 ? 'text-warning' : 'text-success'} />
              <SummaryCard 
                label="Graduación (ABV)" 
                value={insumo.graduacion_alcohol_base > 0 ? `${insumo.graduacion_alcohol_base}%` : '0%'} 
                valueClassName="text-amber-500 font-mono"
                badge={insumo.graduacion_alcohol_base === 0 ? <Badge variant="default" size="sm">Sin alcohol</Badge> : undefined}
              />
              <SummaryCard 
                label="Costo Unitario Real" 
                value={`$${Number(insumo.costo_unitario).toFixed(4)}`} 
                valueClassName="text-primary text-2xl font-bold font-mono"
                badge={<span className="text-muted font-normal">/ {insumo.unidad_medida}</span>}
              />
            </div>
          </div>
        </TabPanel>

        {/* TAB 2: PROVEEDORES */}
        <TabPanel id="proveedores" activeTab={activeTab}>
          <div className="flex flex-col animate-fade-in pt-1">
            <TableToolbar 
              busqueda={busquedaProv}
              onBusquedaChange={(val) => { setBusquedaProv(val); setPaginaProv(1); }}
              placeholder="Buscar proveedor asociado..."
              limite={provsPorPagina}
              onLimiteChange={(val) => { setProvsPorPagina(val); setPaginaProv(1); }}
            />
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell isSortable sortDirection={colProv === 'nombre' ? dirProv : null} onSort={() => manejarOrdenProv('nombre')}>
                    Proveedor
                  </TableHeaderCell>
                  <TableHeaderCell align="right" isSortable sortDirection={colProv === 'precio_oferta' ? dirProv : null} onSort={() => manejarOrdenProv('precio_oferta')}>
                    Precio Oferta Asignado
                  </TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {provsPaginados.length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center" className="py-6 text-muted">No hay proveedores que coincidan.</TableCell></TableRow>
                ) : (
                  provsPaginados.map(p => (
                    <TableRow key={p.proveedor_id}>
                      <TableCell className="font-bold">{p.nombre}</TableCell>
                      <TableCell align="right" className="font-mono text-primary font-bold">
                        {p.precio_oferta ? `$${p.precio_oferta.toLocaleString('es-CL')}` : 'Sin oferta'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination 
              paginaActual={paginaProvSegura} totalPaginas={totalPaginasProv} onCambiarPagina={setPaginaProv}
              elementosMostrados={provsPaginados.length} totalElementos={proveedoresProcesados.length}
            />
          </div>
        </TabPanel>

        {/* TAB 3: HISTORIAL */}
        <TabPanel id="historico" activeTab={activeTab}>
          <div className="flex flex-col animate-fade-in pt-1">
            <TableToolbar 
              busqueda={busquedaHist}
              onBusquedaChange={(val) => { setBusquedaHist(val); setPaginaHist(1); }}
              placeholder="Buscar por motivo o proveedor..."
              limite={histPorPagina}
              onLimiteChange={(val) => { setHistPorPagina(val); setPaginaHist(1); }}
            />
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell isSortable sortDirection={colHist === 'fecha' ? dirHist : null} onSort={() => manejarOrdenHist('fecha')}>
                    Fecha y Hora
                  </TableHeaderCell>
                  <TableHeaderCell isSortable sortDirection={colHist === 'motivo' ? dirHist : null} onSort={() => manejarOrdenHist('motivo')}>
                    Motivo / Evento
                  </TableHeaderCell>
                  <TableHeaderCell isSortable sortDirection={colHist === 'proveedor_nombre' ? dirHist : null} onSort={() => manejarOrdenHist('proveedor_nombre')}>
                    Proveedor (Origen)
                  </TableHeaderCell>
                  <TableHeaderCell align="right" isSortable sortDirection={colHist === 'precio_compra' ? dirHist : null} onSort={() => manejarOrdenHist('precio_compra')}>
                    Precio Compra
                  </TableHeaderCell>
                  <TableHeaderCell align="right" isSortable sortDirection={colHist === 'costo_unitario' ? dirHist : null} onSort={() => manejarOrdenHist('costo_unitario')}>
                    Costo Unitario
                  </TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {cargandoHistorial ? (
                  <TableRow><TableCell colSpan={5} align="center" className="py-6 text-muted animate-pulse">Cargando registros históricos...</TableCell></TableRow>
                ) : histPaginado.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" className="py-6 text-muted">No hay registros históricos disponibles.</TableCell></TableRow>
                ) : (
                  histPaginado.map(h => (
                    <TableRow key={h.id}>
                      <TableCell className="font-mono text-xs text-muted">
                        {new Date(h.fecha).toLocaleString('es-CL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-xs">{h.motivo || 'Actualización de Insumo'}</TableCell>
                      <TableCell className="text-xs">
                        {h.proveedor_nombre ? (
                          <span className="text-foreground">{h.proveedor_nombre}</span>
                        ) : (
                          <span className="text-primary italic font-medium">Costo Base / General</span>
                        )}
                      </TableCell>
                      <TableCell align="right" className="font-mono">${h.precio_compra.toLocaleString('es-CL')}</TableCell>
                      <TableCell align="right" className="font-mono font-bold text-primary">${Number(h.costo_unitario).toFixed(4)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination 
              paginaActual={paginaHistSegura} totalPaginas={totalPaginasHist} onCambiarPagina={setPaginaHist}
              elementosMostrados={histPaginado.length} totalElementos={historialProcesado.length}
            />
          </div>
        </TabPanel>

      </div>
    </div>
  );
}