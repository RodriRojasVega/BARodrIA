// src/modules/catalogos/CatalogosView.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit3, Trash2, X, Database } from 'lucide-react';

// Importamos los átomos y componentes del UI Kit unificados
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TablePagination } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Input } from '@/components/ui/Input';

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
  const [showKpis, setShowKpis] = useState(true);

  // Estados de paginación y control local de tabla
  const [limite, setLimite] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);

  // Estados del Modal CRUD
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [registroEditando, setRegistroEditando] = useState<any | null>(null);
  const [formCampos, setFormCampos] = useState<Record<string, any>>({});

  useEffect(() => {
    cargarDatosTabla(tablaActiva);
    setPaginaActual(1);
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

  function abrirModalRegistro(nombreTabla: NombreTabla, datosExistentes: any | null = null) {
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
          .update(formCampos)
          .eq('id', registroEditando.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from(tablaActiva)
          .insert([formCampos]);
        error = err;
      }

      if (error) throw error;

      setModalAbierto(false);
      await cargarDatosTabla(tablaActiva);
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    }
  }

  const columnasTabla = datos.length > 0 ? Object.keys(datos[0]) : [];

  // Cálculos de Paginación segura para la tabla activa
  const totalRegistros = datos.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / limite));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaSegura - 1) * limite;
  const datosPaginados = datos.slice(inicio, inicio + limite);

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in p-4 md:p-6 bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* 1. MODULE HEADER TRANSPARENTE */}
      <ModuleHeader 
        icon={<Database size={20} />}
        title="Catálogos y Tablas Maestras"
        subtitle="Administración de clasificaciones, tipos y parámetros de configuración del sistema."
        showKpis={showKpis}
        onToggleKpis={() => setShowKpis(!showKpis)}
        kpiButtonText="KPIs"
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

      {/* 1.5 TARJETAS DE INDICADORES (KPIs) DESPLEGABLES */}
      {showKpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 animate-fade-in">
          <SummaryCard 
            label="Tabla Activa" 
            value={tablaActiva.toUpperCase()} 
            valueClassName="text-emerald-400"
          />

          <SummaryCard 
            label="Registros en Tabla" 
            value={
              <>
                {totalRegistros} <span className="text-xs font-normal text-slate-500">Elementos</span>
              </>
            } 
          />

          <SummaryCard 
            label="Estado Supabase" 
            value="Conectado"
            valueClassName="text-sky-400"
          />
        </div>
      )}

      {/* 2. BARRA DE PESTAÑAS Y SELECTOR DE LÍMITE */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center shrink-0 py-1">
        {/* Pestañas de Tablas */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto custom-scrollbar">
          {TABLAS_CONFIG.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setTablaActiva(tab.id); setPaginaActual(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap ${
                tablaActiva === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Selector de límite de filas flotante */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <select 
            value={limite}
            onChange={(e) => { setLimite(Number(e.target.value)); setPaginaActual(1); }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none cursor-pointer focus:border-emerald-500 shadow-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* 3. TABLA DE RESULTADOS */}
      <Table className="flex-1">
        <TableHead>
          <tr>
            {columnasTabla.map(col => (
              <TableHeaderCell key={col}>{col}</TableHeaderCell>
            ))}
            <TableHeaderCell align="right">Acciones</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {cargando ? (
            <TableRow>
              <TableCell colSpan={columnasTabla.length + 1} align="center" className="py-12 text-slate-500 font-mono text-xs animate-pulse">
                Cargando registros de catálogos...
              </TableCell>
            </TableRow>
          ) : datosPaginados.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnasTabla.length + 1} align="center" className="py-12 text-slate-500 font-mono text-xs">
                No hay registros en esta tabla. Usa el botón "Nuevo Registro" para agregar uno.
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
                      <span className="text-emerald-400 font-mono text-xs font-bold">Sí</span> : 
                      <span className="text-slate-500 font-mono text-xs">No</span>;
                  } else if (valor === null || valor === undefined) {
                    contenidoCelda = <span className="text-slate-600 italic">null</span>;
                  } else {
                    contenidoCelda = <div className="whitespace-normal break-words max-w-xs md:max-w-md">{valor}</div>;
                  }
                  return (
                    <TableCell key={col} align="left">
                      {contenidoCelda}
                    </TableCell>
                  );
                })}
                <TableCell align="right">
                  <div className="flex justify-end gap-1.5">
                    <Button 
                      variant="inline" 
                      size="sm" 
                      icon={<Edit3 size={12} />} 
                      onClick={() => abrirModalRegistro(tablaActiva, row)}
                      className="h-7 text-[10px] bg-slate-800 hover:bg-emerald-950/50 hover:text-emerald-400 hover:border-emerald-900/50"
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="inline-danger" 
                      size="sm" 
                      icon={<Trash2 size={12} />} 
                      onClick={() => eliminarRegistro(tablaActiva, row.id)}
                      className="h-7 text-[10px]"
                    >
                      Borrar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* 4. FOOTER PAGINACIÓN */}
      <TablePagination 
        paginaActual={paginaSegura}
        totalPaginas={totalPaginas}
        onCambiarPagina={(p) => setPaginaActual(p)}
        elementosMostrados={totalRegistros === 0 ? 0 : datosPaginados.length}
        totalElementos={totalRegistros}
      />

      {/* MODAL CRUD DINÁMICO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-mono text-emerald-400 uppercase tracking-wider">
                {registroEditando ? `Editar en ${tablaActiva} (ID: ${registroEditando.id})` : `Nuevo registro en ${tablaActiva}`}
              </h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={guardarRegistro} className="space-y-4">
              {Object.keys(formCampos).map(campo => {
                if (campo === 'id' || campo === 'created_at') return null;
                const valorActual = formCampos[campo] ?? '';
                const esTextoLargo = campo.includes('descripcion') || campo.includes('observaciones') || campo.includes('resena') || campo.includes('formula');

                return (
                  <div key={campo} className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">{campo}</label>
                    {esTextoLargo ? (
                      <textarea 
                        rows={3}
                        value={valorActual}
                        onChange={e => setFormCampos({ ...formCampos, [campo]: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-sans resize-y"
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

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="secondary"
                  size="sm"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CatalogosView;