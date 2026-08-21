// src/modules/catalogos/CatalogosView.tsx
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit3, Trash2, Database } from 'lucide-react';

// Componentes del UI Kit Maestro
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TablePagination, TableToolbar } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PillNavigation } from '@/components/ui/PillNavigation'; // <-- Nuevo import

type NombreTabla = 
  | 'categorias' 
  | 'familias' 
  | 'soportes' 
  | 'hielos' 
  | 'tecnicas' 
  | 'tipos_insumos' 
  | 'tipos_sub_recetas';

const TABLAS_CONFIG: { id: NombreTabla; label: string }[] = [
  { id: 'categorias', label: 'Categorías' },
  { id: 'familias', label: 'Familias' },
  { id: 'soportes', label: 'Soportes' },
  { id: 'hielos', label: 'Hielos' },
  { id: 'tecnicas', label: 'Técnicas' },
  { id: 'tipos_insumos', label: 'Tipos Insumos' },
  { id: 'tipos_sub_recetas', label: 'Tipos Sub-recetas' },
];

export function CatalogosView() {
  const [tablaActiva, setTablaActiva] = useState<NombreTabla>('categorias');
  const [datos, setDatos] = useState<any[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [showKpis, setShowKpis] = useState(false);

  // Estados de control de tabla
  const [busqueda, setBusqueda] = useState('');
  const [limite, setLimite] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);

  // Estados del Modal CRUD
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [registroEditando, setRegistroEditando] = useState<any | null>(null);
  const [formCampos, setFormCampos] = useState<Record<string, any>>({});

  useEffect(() => {
    cargarDatosTabla(tablaActiva);
    setPaginaActual(1);
    setBusqueda(''); // Limpiar búsqueda al cambiar de tabla
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
    } catch (e: any) {
      console.error(`Error cargando la tabla ${nombreTabla}:`, e);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarRegistro(nombreTabla: NombreTabla, id: number) {
    if (!confirm(`¿Estás seguro de eliminar el registro #${id} de ${nombreTabla}?`)) return;

    try {
      const { error } = await supabase
        .from(nombreTabla)
        .delete()
        .eq('id', id);

      if (error) throw error;
      await cargarDatosTabla(nombreTabla);
    } catch (e: any) {
      alert(`Error al eliminar: ${e.message}`);
    }
  }

  function abrirModalRegistro(_nombreTabla: NombreTabla, datosExistentes: any | null = null) {
    setRegistroEditando(datosExistentes);
    
    let columnas: string[] = [];
    if (datosExistentes) {
      columnas = Object.keys(datosExistentes).filter(k => k !== 'id' && k !== 'created_at');
      setFormCampos({ ...datosExistentes });
    } else if (datos.length > 0) {
      columnas = Object.keys(datos[0]).filter(k => k !== 'id' && k !== 'created_at');
      const objVacio: Record<string, any> = {};
      columnas.forEach(c => objVacio[c] = '');
      setFormCampos(objVacio);
    } else {
      setFormCampos({ nombre: '', descripcion: '' });
    }

    setModalAbierto(true);
  }

  async function guardarRegistro(e: React.FormEvent) {
    e.preventDefault();
    try {
      let error;
      if (registroEditando) {
        const { error: err } = await supabase
          .from(tablaActiva)
          .update(formCampos as any)
          .eq('id', registroEditando.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from(tablaActiva)
          .insert([formCampos as any]);
        error = err;
      }

      if (error) throw error;

      setModalAbierto(false);
      await cargarDatosTabla(tablaActiva);
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    }
  }

  const columnasTabla = datos.length > 0 ? Object.keys(datos[0]).filter(k => k !== 'created_at') : []; // Ocultamos created_at por limpieza visual

  // Filtrado y Paginación
  const datosProcesados = useMemo(() => {
    return datos.filter(row => {
      if (!busqueda) return true;
      // Busca en todos los valores de la fila
      return Object.values(row).some(val => 
        String(val).toLowerCase().includes(busqueda.toLowerCase())
      );
    });
  }, [datos, busqueda]);

  const totalRegistros = datosProcesados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / limite));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaSegura - 1) * limite;
  const datosPaginados = datosProcesados.slice(inicio, inicio + limite);

  return (
    <div className="flex flex-col min-h-full w-full space-y-4 p-4 md:p-6 bg-background text-foreground animate-fade-in overflow-hidden">
    {/* 1. MODULE HEADER */}
      <ModuleHeader 
        icon={<Database size={20} />}
        title="Catálogos y Tablas Maestras"
        //subtitle="Administración de clasificaciones, tipos y parámetros de configuración del sistema."
        showKpis={showKpis}
        onToggleKpis={() => setShowKpis(!showKpis)}
        kpiButtonText="Resumen"
        primaryAction={
          <Button 
            variant="primary" 
            size="sm"
            icon={<Plus size={14} />} 
            onClick={() => abrirModalRegistro(tablaActiva, null)}
          >
            Nuevo Registro
          </Button>
        }
      />

      {/* 2. KPIs (Opcionales) */}
      {showKpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 animate-fade-in">
          <SummaryCard 
            label="Tabla Activa" 
            value={TABLAS_CONFIG.find(t => t.id === tablaActiva)?.label || tablaActiva.toUpperCase()} 
            valueClassName="text-primary"
          />
          <SummaryCard 
            label="Registros Totales" 
            value={datos.length} 
          />
          <SummaryCard 
            label="Resultados Búsqueda" 
            value={totalRegistros}
            valueClassName="text-info"
          />
        </div>
      )}

      {/* 3. NAVEGACIÓN POR PÍLDORAS (UI KIT) */}
      <div className="shrink-0 border-b border-border">
        <PillNavigation 
          options={TABLAS_CONFIG}
          activeId={tablaActiva}
          onChange={(id) => { 
            setTablaActiva(id as NombreTabla); 
            setPaginaActual(1); 
          }}
        />
      </div>

      {/* 4. BARRA DE HERRAMIENTAS Y TABLA */}
      <div className="flex flex-col flex-1 space-y-2">
        
        {/* Usamos el TableToolbar unificado del UI Kit */}
        <TableToolbar 
          busqueda={busqueda}
          onBusquedaChange={(val) => { setBusqueda(val); setPaginaActual(1); }}
          placeholder={`Buscar en ${TABLAS_CONFIG.find(t => t.id === tablaActiva)?.label}...`}
          limite={limite}
          onLimiteChange={(val) => { setLimite(val); setPaginaActual(1); }}
        />

        <Table className="flex-1">
          <TableHead>
            <tr>
              {columnasTabla.map(col => (
                <TableHeaderCell key={col}>{col.toUpperCase()}</TableHeaderCell>
              ))}
              <TableHeaderCell align="right">Acciones</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {cargando ? (
              <TableRow>
                <TableCell colSpan={columnasTabla.length + 1} align="center" className="py-12 text-muted font-mono text-xs animate-pulse">
                  Cargando catálogos...
                </TableCell>
              </TableRow>
            ) : datosPaginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnasTabla.length + 1} align="center" className="py-12 text-muted font-mono text-xs">
                  No se encontraron registros.
                </TableCell>
              </TableRow>
            ) : (
              datosPaginados.map(row => (
                <TableRow key={row.id}>
                  {columnasTabla.map(col => {
                    let valor = row[col];
                    let contenidoCelda;
                    if (typeof valor === 'boolean') {
                      contenidoCelda = valor ? 
                        <span className="text-success font-mono text-xs font-bold">Sí</span> : 
                        <span className="text-muted font-mono text-xs">No</span>;
                    } else if (valor === null || valor === undefined) {
                      contenidoCelda = <span className="text-muted italic">-</span>;
                    } else {
                      contenidoCelda = <div className="whitespace-normal break-words max-w-xs">{valor}</div>;
                    }
                    return (
                      <TableCell key={col} align="left" className={col === 'id' ? 'font-mono text-muted text-xs' : 'font-medium'}>
                        {contenidoCelda}
                      </TableCell>
                    );
                  })}
                  <TableCell align="right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={<Edit3 size={14} />} 
                        onClick={() => abrirModalRegistro(tablaActiva, row)}
                        title="Editar"
                      />
                      <Button 
                        variant="inline-danger" 
                        size="sm" 
                        icon={<Trash2 size={14} />} 
                        onClick={() => eliminarRegistro(tablaActiva, row.id)}
                        title="Eliminar"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination 
          paginaActual={paginaSegura}
          totalPaginas={totalPaginas}
          onCambiarPagina={setPaginaActual}
          elementosMostrados={datosPaginados.length}
          totalElementos={totalRegistros}
        />
      </div>

      {/* 5. MODAL CRUD DINÁMICO */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={registroEditando ? `Editar: ${TABLAS_CONFIG.find(t => t.id === tablaActiva)?.label}` : `Nuevo: ${TABLAS_CONFIG.find(t => t.id === tablaActiva)?.label}`}
      >
        <form onSubmit={guardarRegistro} className="space-y-4">
          {Object.keys(formCampos).map(campo => {
            if (campo === 'id' || campo === 'created_at') return null;
            const valorActual = formCampos[campo] ?? '';
            const esTextoLargo = campo.includes('descripcion') || campo.includes('observaciones') || campo.includes('resena') || campo.includes('formula');

            return (
              <div key={campo} className="space-y-1">
                <label className="text-xs uppercase font-mono font-bold text-muted block mb-1">
                  {campo.replace('_', ' ')}
                </label>
                {esTextoLargo ? (
                  <textarea 
                    rows={3}
                    value={valorActual}
                    onChange={e => setFormCampos({ ...formCampos, [campo]: e.target.value })}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-sans resize-y transition-colors custom-scrollbar"
                  />
                ) : (
                  <Input 
                    type="text"
                    value={valorActual}
                    onChange={e => setFormCampos({ ...formCampos, [campo]: e.target.value })}
                  />
                )}
              </div>
            );
          })}

          <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
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