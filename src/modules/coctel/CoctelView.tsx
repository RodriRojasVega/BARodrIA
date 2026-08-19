import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GlassWater, Plus, Edit3, Trash2, Eye } from 'lucide-react';
import type { Coctel } from '@/types/coctel';

// UI Kit Maestro 2.0
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { Button } from '@/components/ui/Button';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, TablePagination } from '@/components/ui/Table';

// Componentes del Módulo
import { CoctelFormView } from './components/CoctelFormView';
import { CoctelDetailView } from './components/CoctelDetailView';

type VistaActiva = 'grilla' | 'detalle' | 'formulario';

export function CoctelView() {
  // --- ESTADOS DE NAVEGACIÓN ---
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('grilla');
  const [coctelActivo, setCoctelActivo] = useState<Coctel | null>(null);
  
  // --- ESTADOS DE DATOS ---
  const [datos, setDatos] = useState<Coctel[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [showKpis, setShowKpis] = useState<boolean>(false);

  // --- PAGINACIÓN LOCAL ---
  const [paginaActual, setPaginaActual] = useState(1);
  const limite = 25; // Ajustado a 25 por defecto según tu diseño JS

  useEffect(() => {
    cargarCocteles();
  }, []);

  async function cargarCocteles() {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('cocteles')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setDatos(data || []);
    } catch (e: any) {
      console.error('Error cargando cócteles:', e.message);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarCoctel(id: number, nombre: string) {
    if (!confirm(`¿Estás seguro de eliminar el cóctel "${nombre}"? Esta acción es irreversible.`)) return;

    try {
      // Nota: Si tienes restricciones de clave foránea, Supabase podría requerir 
      // borrar primero en coctel_ingredientes y coctel_pasos_preparacion.
      const { error } = await supabase
        .from('cocteles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await cargarCocteles();
    } catch (e: any) {
      alert(`Error al eliminar: ${e.message}`);
    }
  }

  // Lógica transaccional para guardar el cóctel y sus tablas dependientes
  async function guardarCoctelMultinivel(formData: Partial<Coctel>, ingredientes: any[], pasos: any[]) {
    try {
      let coctelGuardado: Coctel;

      // 1. Guardar o Actualizar Tabla Principal (cocteles)
      if (coctelActivo) {
        const { data, error } = await supabase
          .from('cocteles')
          .update(formData)
          .eq('id', coctelActivo.id)
          .select()
          .single();
          
        if (error) throw error;
        coctelGuardado = data;
      } else {
        const { data, error } = await supabase
          .from('cocteles')
          .insert([formData])
          .select()
          .single();
          
        if (error) throw error;
        coctelGuardado = data;
      }

      // 2. Sincronizar Ingredientes (BOM)
      await supabase.from('coctel_ingredientes').delete().eq('coctel_id', coctelGuardado.id);
      if (ingredientes && ingredientes.length > 0) {
        const ingsPayload = ingredientes.map(i => ({
          coctel_id: coctelGuardado.id,
          insumo_id: i.insumo_id,
          cantidad: i.cantidad,
          unidad_medida: i.unidad_medida
        }));
        const { error: errIng } = await supabase.from('coctel_ingredientes').insert(ingsPayload);
        if (errIng) throw errIng;
      }

      // 3. Sincronizar Pasos de Preparación
      await supabase.from('coctel_pasos_preparacion').delete().eq('coctel_id', coctelGuardado.id);
      if (pasos && pasos.length > 0) {
        const pasosPayload = pasos.map((p, idx) => ({
          coctel_id: coctelGuardado.id,
          numero_paso: idx + 1,
          descripcion: p.descripcion,
          es_critico: p.es_critico || false
        }));
        const { error: errPasos } = await supabase.from('coctel_pasos_preparacion').insert(pasosPayload);
        if (errPasos) throw errPasos;
      }

      // Recargar la grilla y volver al listado
      await cargarCocteles();
      setVistaActiva('grilla');
      setCoctelActivo(null);
      
    } catch (e: any) {
      alert(`Error crítico al guardar la receta: ${e.message}`);
      throw e; // Relanzamos para que el modal sepa que hubo un fallo
    }
  }

  // --- CONTROLADOR DE RUTAS INTERNAS ---
  
  if (vistaActiva === 'formulario') {
    return (
      <CoctelFormView 
        coctelAEditar={coctelActivo} 
        onCerrar={() => {
          // Si venimos de editar, volvemos al detalle. Si es nuevo, volvemos a la grilla.
          setVistaActiva(coctelActivo ? 'detalle' : 'grilla');
        }}
        onGuardar={guardarCoctelMultinivel}
      />
    );
  }

 if (vistaActiva === 'detalle' && coctelActivo) {
    return (
      <CoctelDetailView 
        coctel={coctelActivo}
        onVolver={() => setVistaActiva('grilla')}
        onEditar={() => setVistaActiva('formulario')}
        onEliminar={() => {
          eliminarCoctel(coctelActivo.id, coctelActivo.nombre);
          setVistaActiva('grilla');
        }}
      />
    );
  }

  // --- VISTA PRINCIPAL (GRILLA) ---

  const totalRegistros = datos.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / limite));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaSegura - 1) * limite;
  const datosPaginados = datos.slice(inicio, inicio + limite);

  const costoPromedio = datos.length > 0 
    ? (datos.reduce((acc, curr) => acc + Number(curr.costo_produccion || 0), 0) / datos.length).toFixed(0)
    : '0';

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in p-4 md:p-6 bg-slate-950 text-slate-100 overflow-hidden">
      
      <ModuleHeader 
        icon={<GlassWater size={20} />}
        title="Directorio de Cócteles"
        subtitle="Auditoría financiera, balance químico y notas de cata del catálogo general."
        showKpis={showKpis}
        onToggleKpis={() => setShowKpis(!showKpis)}
        kpiButtonText="KPIs"
        primaryAction={
          <Button 
            variant="primary" 
            size="sm"
            icon={<Plus size={14} />} 
            onClick={() => {
              setCoctelActivo(null);
              setVistaActiva('formulario');
            }}
          >
            Nuevo Cóctel
          </Button>
        }
      />

      {showKpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 animate-fade-in">
          <SummaryCard 
            label="Total Catálogo" 
            value={totalRegistros.toString()} 
            valueClassName="text-emerald-400"
          />
          <SummaryCard 
            label="Costo Promedio (COGS)" 
            value={`$${costoPromedio}`} 
            valueClassName="text-purple-400"
          />
          <SummaryCard 
            label="Estado Motor Matemático" 
            value="Activo"
            valueClassName="text-sky-400"
          />
        </div>
      )}

      <Table className="flex-1 mt-2">
        <TableHead>
          <tr>
            <TableHeaderCell>Nombre</TableHeaderCell>
            <TableHeaderCell>Slug</TableHeaderCell>
            <TableHeaderCell align="center">ABV %</TableHeaderCell>
            <TableHeaderCell align="right">COGS</TableHeaderCell>
            <TableHeaderCell align="right">Precio Sugerido</TableHeaderCell>
            <TableHeaderCell align="right">Acciones</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {cargando ? (
            <TableRow>
              <TableCell colSpan={6} align="center" className="py-12 text-slate-500 font-mono text-xs animate-pulse">
                Cargando catálogo de cócteles...
              </TableCell>
            </TableRow>
          ) : datosPaginados.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" className="py-12 text-slate-500 font-mono text-xs">
                No hay cócteles registrados. Usa el botón "Nuevo Cóctel".
              </TableCell>
            </TableRow>
          ) : (
            datosPaginados.map(coctel => (
              <TableRow key={coctel.id} className="cursor-pointer group hover:bg-slate-900/50" onClick={() => {
                setCoctelActivo(coctel);
                setVistaActiva('detalle');
              }}>
                <TableCell>
                  <span className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">{coctel.nombre}</span>
                </TableCell>
                <TableCell>
                  <span className="text-slate-400 text-xs font-mono">{coctel.slug}</span>
                </TableCell>
                <TableCell align="center">
                  <span className="font-mono text-emerald-400 font-bold">{Number(coctel.grado_alcohol || 0).toFixed(1)}%</span>
                </TableCell>
                <TableCell align="right">
                  <span className="font-mono text-purple-400">${Number(coctel.costo_produccion || 0).toFixed(0)}</span>
                </TableCell>
                <TableCell align="right">
                  <span className="font-mono font-bold text-slate-100">${Number(coctel.precio_venta_sugerido || 0).toFixed(0)}</span>
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation() /* Evita que el click en botones abra el detalle */}>
                  <div className="flex justify-end gap-1.5">
                    <Button 
                      variant="inline" 
                      size="sm" 
                      icon={<Eye size={12} />} 
                      onClick={() => {
                        setCoctelActivo(coctel);
                        setVistaActiva('detalle');
                      }}
                      className="h-7 text-[10px] bg-slate-800 hover:bg-emerald-950/50 hover:text-emerald-400"
                    >
                      Ver
                    </Button>
                    <Button 
                      variant="inline-danger" 
                      size="sm" 
                      icon={<Trash2 size={12} />} 
                      onClick={() => eliminarCoctel(coctel.id, coctel.nombre)}
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

      <TablePagination 
        paginaActual={paginaSegura}
        totalPaginas={totalPaginas}
        onCambiarPagina={(p) => setPaginaActual(p)}
        elementosMostrados={totalRegistros === 0 ? 0 : datosPaginados.length}
        totalElementos={totalRegistros}
      />
    </div>
  );
}

export default CoctelView;