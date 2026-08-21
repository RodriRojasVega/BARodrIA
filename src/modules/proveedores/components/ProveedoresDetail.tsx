// src/modules/proveedores/components/ProveedoresDetail.tsx
import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Edit3, Trash2, ClipboardList, TrendingUp, Users, Info } from 'lucide-react';

// Tipos centralizados
import type { Proveedor, ProveedorPrecioHistorico } from '@/types/proveedores';
import type { Insumo as InsumoGlobal } from '@/types/insumos';

// Componentes del UI Kit Maestro 2.0
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TableToolbar, TablePagination } from '@/components/ui/Table';
import { InfoCard } from '@/components/ui/InfoCard';

interface Props {
  proveedor: Proveedor;
  insumosGlobales: InsumoGlobal[];
  obtenerHistorico: (id: number) => Promise<ProveedorPrecioHistorico[]>; // Corregido el tipo
  onVolver: () => void;
  onEditar: () => void;
  onEliminar: (id: number, nombre: string) => void;
}

export function ProveedoresDetail({ proveedor, insumosGlobales, obtenerHistorico, onVolver, onEditar, onEliminar }: Props) {
  const [activeTab, setActiveTab] = useState('info');
  const [historico, setHistorico] = useState<ProveedorPrecioHistorico[]>([]);
  const [cargandoHist, setCargandoHist] = useState(false);

  // Estados para Tabla Catálogo
  const [busquedaCat, setBusquedaCat] = useState('');
  const [paginaCat, setPaginaCat] = useState(1);
  const [limiteCat, setLimiteCat] = useState(5);
  const [colCat, setColCat] = useState<'nombre' | 'formato_envase' | 'precio_oferta'>('nombre');
  const [dirCat, setDirCat] = useState<'asc' | 'desc'>('asc');

  // Estados para Tabla Histórico
  const [busquedaHist, setBusquedaHist] = useState('');
  const [paginaHist, setPaginaHist] = useState(1);
  const [limiteHist, setLimiteHist] = useState(5);
  const [colHist, setColHist] = useState<keyof ProveedorPrecioHistorico>('created_at');
  const [dirHist, setDirHist] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (activeTab === 'historico' && historico.length === 0) {
      cargarHist();
    }
  }, [activeTab, proveedor.id]);

  const cargarHist = async () => {
    setCargandoHist(true);
    const data = await obtenerHistorico(proveedor.id);
    setHistorico(data);
    setCargandoHist(false);
  };

  // Manejadores de Orden
  const manejarOrdenCat = (col: 'nombre' | 'formato_envase' | 'precio_oferta') => {
    if (colCat === col) setDirCat(dirCat === 'asc' ? 'desc' : 'asc');
    else { setColCat(col); setDirCat('asc'); }
  };

  const manejarOrdenHist = (col: keyof ProveedorPrecioHistorico) => {
    if (colHist === col) setDirHist(dirHist === 'asc' ? 'desc' : 'asc');
    else { setColHist(col); setDirHist(col === 'created_at' ? 'desc' : 'asc'); }
  };

  // Procesamiento Catálogo
  const catalogoProcesado = useMemo(() => {
    if (!proveedor.insumos) return [];
    const items = proveedor.insumos.map(rel => {
      const ins = insumosGlobales.find(i => i.id === rel.insumo_id);
      return { ...rel, ins };
    }).filter(x => x.ins != null);

    const filtrados = items.filter(item => {
      if (!busquedaCat) return true;
      return item.ins?.nombre.toLowerCase().includes(busquedaCat.toLowerCase());
    });

    return filtrados.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';
      if (colCat === 'nombre') {
        valA = a.ins?.nombre || '';
        valB = b.ins?.nombre || '';
      } else if (colCat === 'formato_envase') {
        valA = a.ins?.formato_envase || 0;
        valB = b.ins?.formato_envase || 0;
      } else if (colCat === 'precio_oferta') {
        valA = a.precio_oferta ?? -1;
        valB = b.precio_oferta ?? -1;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return dirCat === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return dirCat === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    });
  }, [proveedor.insumos, insumosGlobales, busquedaCat, colCat, dirCat]);

  const totalPaginasCat = Math.ceil(catalogoProcesado.length / limiteCat) || 1;
  const paginaCatSegura = Math.min(paginaCat, totalPaginasCat);
  const catalogoPaginado = catalogoProcesado.slice((paginaCatSegura - 1) * limiteCat, paginaCatSegura * limiteCat);

  // Procesamiento Histórico
  const historicoProcesado = useMemo(() => {
    const filtrados = historico.filter(h => {
      if (!busquedaHist) return true;
      const q = busquedaHist.toLowerCase();
      return h.insumo_nombre?.toLowerCase().includes(q) || h.created_at?.toLowerCase().includes(q);
    });

    return filtrados.sort((a, b) => {
      let valA = a[colHist];
      let valB = b[colHist];
      if (valA == null) valA = '';
      if (valB == null) valB = '';

      if (colHist === 'created_at') {
        const dateA = new Date(valA as string).getTime();
        const dateB = new Date(valB as string).getTime();
        return dirHist === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return dirHist === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return dirHist === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    });
  }, [historico, busquedaHist, colHist, dirHist]);

  const totalPaginasHist = Math.ceil(historicoProcesado.length / limiteHist) || 1;
  const paginaHistSegura = Math.min(paginaHist, totalPaginasHist);
  const historicoPaginado = historicoProcesado.slice((paginaHistSegura - 1) * limiteHist, paginaHistSegura * limiteHist);

  return (
    <div className="flex flex-col min-h-full w-full space-y-3 p-4 md:p-6 bg-background text-foreground animate-fade-in">
      
      <ModuleHeader 
        icon={<Users size={20} />}
        title={proveedor.nombre}
        badges={<Badge variant="info" size="sm">Distribuidor</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={onVolver}>Volver</Button>
            <Button variant="secondary" size="sm" icon={<Edit3 size={14} />} onClick={onEditar}>Editar</Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => onEliminar(proveedor.id, proveedor.nombre)}>Eliminar</Button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col">
        <Tabs 
          activeTab={activeTab} 
          onChangeTab={setActiveTab}
          tabs={[
            { id: 'info', label: 'Información General', icon: <Info size={16}/> },
            { id: 'catalogo', label: 'Catálogo de Productos', icon: <ClipboardList size={16}/> },
            { id: 'historico', label: 'Histórico de Precios', icon: <TrendingUp size={16}/> }
          ]}
        />

        <TabPanel id="info" activeTab={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in pt-3">
            <InfoCard title="Razón Social / Nombre" value={proveedor.nombre} copyText={proveedor.nombre} variant="primary" />
            <InfoCard title="Contacto Comercial" value={proveedor.contacto || 'Sin definir'} copyText={proveedor.contacto || undefined} variant="info" />
            <InfoCard title="Teléfono de Contacto" value={proveedor.telefono || 'Sin definir'} copyText={proveedor.telefono || undefined} variant="success" />
            <InfoCard title="Correo Electrónico" value={proveedor.email || 'Sin definir'} copyText={proveedor.email || undefined} variant="warning" />
            <InfoCard title="Observaciones & Notas" value={proveedor.observaciones || 'Sin notas'} variant="purple" className="md:col-span-2 lg:col-span-2" />
          </div>
        </TabPanel>

        <TabPanel id="catalogo" activeTab={activeTab}>
          <div className="flex flex-col space-y-2 animate-fade-in pt-1">
            <TableToolbar 
              busqueda={busquedaCat}
              onBusquedaChange={(val) => { setBusquedaCat(val); setPaginaCat(1); }}
              placeholder="Buscar insumo en catálogo..."
              limite={limiteCat}
              onLimiteChange={(val) => { setLimiteCat(val); setPaginaCat(1); }}
            />
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell isSortable sortDirection={colCat === 'nombre' ? dirCat : null} onSort={() => manejarOrdenCat('nombre')}>Insumo</TableHeaderCell>
                  <TableHeaderCell align="center" isSortable sortDirection={colCat === 'formato_envase' ? dirCat : null} onSort={() => manejarOrdenCat('formato_envase')}>Formato / Unidad</TableHeaderCell>
                  <TableHeaderCell align="right" isSortable sortDirection={colCat === 'precio_oferta' ? dirCat : null} onSort={() => manejarOrdenCat('precio_oferta')}>Precio de Oferta</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {catalogoPaginado.length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center" className="py-8 text-muted">Sin insumos asignados o coincidentes.</TableCell></TableRow>
                ) : (
                  catalogoPaginado.map(rel => (
                    <TableRow key={rel.insumo_id}>
                      <TableCell className="font-bold text-foreground">{rel.ins?.nombre}</TableCell>
                      <TableCell align="center" className="text-xs text-muted font-mono">{rel.ins?.formato_envase} {rel.ins?.unidad_medida}</TableCell>
                      <TableCell align="right" className="font-mono text-primary font-bold">
                        {rel.precio_oferta !== null ? `$${rel.precio_oferta.toLocaleString('es-CL')}` : 'Sin oferta'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination 
              paginaActual={paginaCatSegura}
              totalPaginas={totalPaginasCat}
              onCambiarPagina={setPaginaCat}
              elementosMostrados={catalogoPaginado.length}
              totalElementos={catalogoProcesado.length}
            />
          </div>
        </TabPanel>

        <TabPanel id="historico" activeTab={activeTab}>
          <div className="flex flex-col space-y-2 animate-fade-in pt-1">
            <TableToolbar 
              busqueda={busquedaHist}
              onBusquedaChange={(val) => { setBusquedaHist(val); setPaginaHist(1); }}
              placeholder="Buscar por insumo o fecha..."
              limite={limiteHist}
              onLimiteChange={(val) => { setLimiteHist(val); setPaginaHist(1); }}
            />
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell isSortable sortDirection={colHist === 'created_at' ? dirHist : null} onSort={() => manejarOrdenHist('created_at')}>Fecha y Hora</TableHeaderCell>
                  <TableHeaderCell isSortable sortDirection={colHist === 'insumo_nombre' ? dirHist : null} onSort={() => manejarOrdenHist('insumo_nombre')}>Insumo Modificado</TableHeaderCell>
                  <TableHeaderCell align="right" isSortable sortDirection={colHist === 'precio_compra' ? dirHist : null} onSort={() => manejarOrdenHist('precio_compra')}>Precio Registrado</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {cargandoHist ? (
                  <TableRow><TableCell colSpan={3} align="center" className="py-8 text-muted animate-pulse">Cargando auditoría...</TableCell></TableRow>
                ) : historicoPaginado.length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center" className="py-8 text-muted">Sin cambios registrados o coincidentes.</TableCell></TableRow>
                ) : (
                  historicoPaginado.map(h => (
                    <TableRow key={h.id}>
                      <TableCell className="font-mono text-xs text-muted">
                        {new Date(h.created_at).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}
                      </TableCell>
                      <TableCell className="text-xs text-foreground font-medium">{h.insumo_nombre}</TableCell>
                      <TableCell align="right" className="font-mono font-bold text-primary">
                        ${h.precio_compra?.toLocaleString('es-CL')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination 
              paginaActual={paginaHistSegura}
              totalPaginas={totalPaginasHist}
              onCambiarPagina={setPaginaHist}
              elementosMostrados={historicoPaginado.length}
              totalElementos={historicoProcesado.length}
            />
          </div>
        </TabPanel>

      </div>
    </div>
  );
}