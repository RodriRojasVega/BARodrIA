// src/modules/catalogos/CatalogosView.tsx
import { useState, useEffect, useMemo, type FormEvent, type ChangeEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit3, Trash2, Database, BarChart3 } from 'lucide-react';

// Componentes del UI Kit Maestro
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TablePagination, TableToolbar } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { PillNavigation } from '@/components/ui/PillNavigation';
import { Badge } from '@/components/ui/Badge';

import type { NombreTabla } from './types';
import { GRUPOS_TAXONOMIAS, TABLAS_CONFIG } from './constants';
import { SidebarTaxonomias } from './components/SidebarTaxonomias';

export function CatalogosView() {
  const [tablaActiva, setTablaActiva] = useState<NombreTabla>('categorias');
  const [datos, setDatos] = useState<Record<string, unknown>[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [showKpis, setShowKpis] = useState(false);
  const [panelIzquierdoColapsado, setPanelIzquierdoColapsado] = useState<boolean>(false);

  // Estados de acordeón para grupos taxonómicos en el panel izquierdo (todos abiertos por defecto)
  const [gruposAbiertos, setGruposAbiertos] = useState<Record<string, boolean>>({
    organoleptica: true,
    fisico_quimica: true,
    logistica: true,
  });

  // Estados de control de tabla
  const [busqueda, setBusqueda] = useState('');
  const [limite, setLimite] = useState(25);
  const [paginaActual, setPaginaActual] = useState(1);
  const [ordenColumna, setOrdenColumna] = useState<string | null>('id');
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc' | null>('asc');

  // Estados del Modal CRUD
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [registroEditando, setRegistroEditando] = useState<Record<string, unknown> | null>(null);
  const [formCampos, setFormCampos] = useState<Record<string, unknown>>({});

  useEffect(() => {
    cargarDatosTabla(tablaActiva);
    setPaginaActual(1);
    setBusqueda(''); 
    setOrdenColumna('id');
    setOrdenDireccion('asc');
  }, [tablaActiva]);

  async function cargarDatosTabla(nombreTabla: NombreTabla) {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from(nombreTabla)
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setDatos(data || []);
    } catch (e: unknown) {
      console.error(`Error cargando la tabla ${nombreTabla}:`, e);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarRegistro(nombreTabla: NombreTabla, id: number | string) {
    if (!confirm(`¿Estás seguro de eliminar el registro #${id} de ${nombreTabla}?`)) return;

    try {
      const { error } = await supabase
        .from(nombreTabla)
        .delete()
        .eq('id', Number(id));

      if (error) throw error;
      await cargarDatosTabla(nombreTabla);
    } catch (e: unknown) {
      const err = e as Error;
      alert(`Error al eliminar: ${err.message}`);
    }
  }

  function abrirModalRegistro(_nombreTabla: NombreTabla, datosExistentes: Record<string, unknown> | null = null) {
    setRegistroEditando(datosExistentes);
    
    if (datosExistentes) {
      setFormCampos({ ...datosExistentes });
    } else if (datos.length > 0) {
      const plantilla: Record<string, unknown> = {};
      const primerRegistro = datos[0];
      Object.keys(primerRegistro).forEach(k => {
        if (k !== 'id' && k !== 'created_at') {
          plantilla[k] = '';
        }
      });
      setFormCampos(plantilla);
    } else {
      if (tablaActiva === 'hielos') {
        setFormCampos({ nombre: '', descripcion: '', tiempo_fusion_min: '', temperatura_c: '' });
      } else if (tablaActiva === 'soportes') {
        setFormCampos({ nombre: '', tipo: '', capacidad_ml: '' });
      } else {
        setFormCampos({ nombre: '', descripcion: '' });
      }
    }
    setModalAbierto(true);
  }

  async function guardarRegistro(e: FormEvent) {
    e.preventDefault();
    try {
      if (registroEditando && registroEditando.id !== undefined) {
        const { error } = await (supabase.from(tablaActiva) as unknown as { update: (data: Record<string, unknown>) => { eq: (col: string, val: number) => Promise<{ error: Error | null }> } })
          .update(formCampos)
          .eq('id', Number(registroEditando.id));

        if (error) throw error;
      } else {
        const payload = { ...formCampos };
        Object.keys(payload).forEach(k => {
          if (payload[k] === '') delete payload[k];
        });

        const { error } = await (supabase.from(tablaActiva) as unknown as { insert: (data: Record<string, unknown>[]) => Promise<{ error: Error | null }> })
          .insert([payload]);

        if (error) throw error;
      }

      setModalAbierto(false);
      await cargarDatosTabla(tablaActiva);
    } catch (e: unknown) {
      const err = e as Error;
      alert(`Error al guardar el registro: ${err.message}`);
    }
  }

  // Filtrado y ordenamiento en cliente
  const datosFiltrados = useMemo(() => {
    return datos.filter(row => {
      if (!busqueda.trim()) return true;
      const query = busqueda.toLowerCase();
      return Object.values(row).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(query)
      );
    });
  }, [datos, busqueda]);

  const datosOrdenados = useMemo(() => {
    if (!ordenColumna || !ordenDireccion) return datosFiltrados;

    return [...datosFiltrados].sort((a, b) => {
      const valA = a[ordenColumna];
      const valB = b[ordenColumna];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let comparacion = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparacion = valA - valB;
      } else {
        comparacion = String(valA).localeCompare(String(valB));
      }

      return ordenDireccion === 'asc' ? comparacion : -comparacion;
    });
  }, [datosFiltrados, ordenColumna, ordenDireccion]);

  const totalRegistros = datosOrdenados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / limite));
  const paginaSegura = Math.min(paginaActual, totalPaginas);

  const datosPaginados = useMemo(() => {
    const inicio = (paginaSegura - 1) * limite;
    return datosOrdenados.slice(inicio, inicio + limite);
  }, [datosOrdenados, paginaSegura, limite]);

  function manejarOrden(columna: string) {
    if (ordenColumna === columna) {
      if (ordenDireccion === 'asc') setOrdenDireccion('desc');
      else if (ordenDireccion === 'desc') {
        setOrdenColumna(null);
        setOrdenDireccion(null);
      } else {
        setOrdenDireccion('asc');
      }
    } else {
      setOrdenColumna(columna);
      setOrdenDireccion('asc');
    }
  }

  function toggleGrupo(grupoId: string) {
    setGruposAbiertos(prev => ({
      ...prev,
      [grupoId]: !prev[grupoId]
    }));
  }

  const infoTablaActiva = TABLAS_CONFIG.find(t => t.id === tablaActiva);

  return (
    <div className="flex flex-col min-h-full w-full space-y-4 p-4 md:p-6 bg-background text-foreground animate-fade-in overflow-hidden">
      <ModuleHeader 
        icon={<Database size={20} className="text-primary" />}
        title="Catálogos Maestros y Taxonomías"
        primaryAction={
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              size="sm"
              icon={<BarChart3 size={16} />}
              onClick={() => setShowKpis(!showKpis)}
              title="Alternar KPIs"
            />
            <Button 
              variant="primary" 
              size="sm" 
              icon={<Plus size={16} />}
              onClick={() => abrirModalRegistro(tablaActiva, null)}
              title="Nuevo Registro"
            />
          </div>
        }
      />

      {/* KPIs desplegables flotantes */}
      {showKpis && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-down">
          <SummaryCard 
            label="Tabla Activa" 
            value={infoTablaActiva?.label || tablaActiva} 
            valueClassName="text-foreground font-bold"
            badge={<Badge variant="success">Activa</Badge>}
            className="bg-background/40 backdrop-blur-sm border-border/40 shadow-none"
          />
          <SummaryCard 
            label="Total Registros" 
            value={datos.length} 
            valueClassName="text-foreground"
            className="bg-background/40 backdrop-blur-sm border-border/40 shadow-none"
          />
          <SummaryCard 
            label="Grupos" 
            value={GRUPOS_TAXONOMIAS.length} 
            valueClassName="text-foreground"
            className="bg-background/40 backdrop-blur-sm border-border/40 shadow-none"
          />
          <SummaryCard 
            label="Tablas" 
            value={TABLAS_CONFIG.length} 
            valueClassName="text-foreground"
            className="bg-background/40 backdrop-blur-sm border-border/40 shadow-none"
          />
        </section>
      )}

      {/* INTERFAZ DE DOBLE COLUMNA SPLIT-SCREEN AVANZADA Y FLOTANTE */}
      <div className="flex flex-col lg:flex-row gap-4 items-start flex-1 overflow-hidden">
        
        <SidebarTaxonomias
          tablaActiva={tablaActiva}
          setTablaActiva={setTablaActiva}
          panelIzquierdoColapsado={panelIzquierdoColapsado}
          setPanelIzquierdoColapsado={setPanelIzquierdoColapsado}
          gruposAbiertos={gruposAbiertos}
          toggleGrupo={toggleGrupo}
          tablasConfig={TABLAS_CONFIG}
          gruposTaxonomias={GRUPOS_TAXONOMIAS}
        />

        {/* PANEL DERECHO: TABLA MAESTRA AVANZADA */}
        <div className="flex-1 w-full overflow-hidden bg-background/30 backdrop-blur-md border border-border/40 rounded-2xl shadow-none p-4 sm:p-5 space-y-3">
          
          {/* Selector rápido en dispositivos pequeños */}
          <div className="lg:hidden w-full overflow-x-auto pb-2">
            <PillNavigation
              activeId={tablaActiva}
              onChange={(id) => setTablaActiva(id as NombreTabla)}
              options={TABLAS_CONFIG.map(t => ({ id: t.id, label: t.label }))}
            />
          </div>

          {/* TableToolbar totalmente integrada con búsqueda y contador total reactivo */}
          <TableToolbar 
            busqueda={busqueda}
            onBusquedaChange={(val) => { setBusqueda(val); setPaginaActual(1); }}
            placeholder={`Buscar en ${TABLAS_CONFIG.find(t => t.id === tablaActiva)?.label?.toLowerCase() || 'catálogo'}...`}
            limite={limite}
            onLimiteChange={(val) => { setLimite(val); setPaginaActual(1); }}
          />

          {/* Tabla con soporte de ordenamiento, celdas y paginación */}
          <div className="overflow-x-auto custom-scrollbar border border-border/40 rounded-xl bg-background/20 backdrop-blur-sm">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell 
                    isSortable 
                    sortDirection={ordenColumna === 'id' ? ordenDireccion : null}
                    onSort={() => manejarOrden('id')}
                  >
                    ID
                  </TableHeaderCell>
                  <TableHeaderCell 
                    isSortable 
                    sortDirection={ordenColumna === 'nombre' ? ordenDireccion : null}
                    onSort={() => manejarOrden('nombre')}
                  >
                    Nombre
                  </TableHeaderCell>
                  
                  {/* Columnas dinámicas según los campos del primer registro o estructura */}
                  {datos.length > 0 && Object.keys(datos[0])
                    .filter(k => k !== 'id' && k !== 'nombre' && k !== 'created_at')
                    .map(campo => (
                      <TableHeaderCell 
                        key={campo}
                        isSortable
                        sortDirection={ordenColumna === campo ? ordenDireccion : null}
                        onSort={() => manejarOrden(campo)}
                      >
                        {campo.replace('_', ' ')}
                      </TableHeaderCell>
                    ))
                  }

                  {datos.length === 0 && (
                    <TableHeaderCell>Detalle</TableHeaderCell>
                  )}

                  <TableHeaderCell align="right">Acciones</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cargando ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" className="py-10 text-muted font-mono">
                      Cargando registros...
                    </TableCell>
                  </TableRow>
                ) : datosPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" className="py-10 text-muted font-mono">
                      No se encontraron registros.
                    </TableCell>
                  </TableRow>
                ) : (
                  datosPaginados.map((row) => (
                    <TableRow key={String(row.id || Math.random())} isClickable onClick={() => abrirModalRegistro(tablaActiva, row)}>
                      <TableCell className="font-mono text-xs text-muted">
                        #{String(row.id ?? '')}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {String(row.nombre || 'Sin nombre')}
                      </TableCell>

                      {Object.keys(row)
                        .filter(k => k !== 'id' && k !== 'nombre' && k !== 'created_at')
                        .map(campo => {
                          const val = row[campo];
                          let textoMostrado = val !== null && val !== undefined ? String(val) : '-';
                          if (typeof val === 'boolean') {
                            textoMostrado = val ? 'Sí' : 'No';
                          }
                          return (
                            <TableCell key={campo} className="text-sm text-muted">
                              {textoMostrado}
                            </TableCell>
                          );
                        })
                      }

                      {Object.keys(row).filter(k => k !== 'id' && k !== 'nombre' && k !== 'created_at').length === 0 && (
                        <TableCell className="text-sm text-muted">
                          {String(row.descripcion || 'Sin descripción adicional')}
                        </TableCell>
                      )}

                      <TableCell align="right">
                        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            icon={<Edit3 size={14} />} 
                            onClick={() => abrirModalRegistro(tablaActiva, row)}
                            title="Editar registro"
                          />
                          <Button 
                            variant="inline-danger" 
                            size="sm" 
                            icon={<Trash2 size={14} />} 
                            onClick={() => eliminarRegistro(tablaActiva, row.id as number | string)}
                            title="Eliminar registro"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination 
            paginaActual={paginaSegura}
            totalPaginas={totalPaginas}
            onCambiarPagina={setPaginaActual}
            elementosMostrados={datosPaginados.length}
            totalElementos={totalRegistros}
          />

        </div>

      </div>

      {/* 5. MODAL CRUD DINÁMICO */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={registroEditando ? `Editar en: ${infoTablaActiva?.label}` : `Nuevo en: ${infoTablaActiva?.label}`}
      >
        <form onSubmit={guardarRegistro} className="space-y-4">
          {Object.keys(formCampos).map(campo => {
            if (campo === 'id' || campo === 'created_at') return null;
            const valorActual = formCampos[campo] !== null && formCampos[campo] !== undefined ? String(formCampos[campo]) : '';
            const esTextoLargo = campo.includes('descripcion') || campo.includes('observaciones') || campo.includes('resena') || campo.includes('formula');

            return (
              <div key={campo} className="space-y-1">
                <label className="text-xs uppercase font-mono font-bold text-muted block mb-1">
                  {campo.replace('_', ' ')}
                </label>
                {esTextoLargo ? (
                  <Textarea 
                    rows={3}
                    value={valorActual}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormCampos({ ...formCampos, [campo]: e.target.value })}
                  />
                ) : (
                  <Input 
                    type="text"
                    value={valorActual}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormCampos({ ...formCampos, [campo]: e.target.value })}
                  />
                )}
              </div>
            );
          })}

          <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-6">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Guardar Registro
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CatalogosView;
