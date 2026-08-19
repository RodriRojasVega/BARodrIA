import { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Trash2, Beaker, Eye, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Coctel } from '@/types/coctel';

// UI Kit
import { Button } from '@/components/ui/Button';

interface CoctelDetailViewProps {
  coctel: Coctel;
  onVolver: () => void;
  onEditar: () => void;
  onEliminar: () => void;
}

type TabType = 'ingenieria' | 'sensorial' | 'cartas';

export function CoctelDetailView({ coctel, onVolver, onEditar, onEliminar }: CoctelDetailViewProps) {
  const [tabActiva, setTabActiva] = useState<TabType>('ingenieria');
  const [cargando, setCargando] = useState(true);

  // Estados locales para los datos relacionales
  const [nombresCatalogos, setNombresCatalogos] = useState({ categoria: '-', familia: '-', soporte: '-', tecnica: '-' });
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [pasos, setPasos] = useState<any[]>([]);
  const [cartas, setCartas] = useState<any[]>([]);

  useEffect(() => {
    cargarDatosRelacionales();
  }, [coctel.id]);

  async function cargarDatosRelacionales() {
    setCargando(true);
    try {
      // 1. Cargar nombres de los catálogos (Resolviendo IDs)
      const [resCat, resFam, resSop, resTec] = await Promise.all([
        supabase.from('categorias').select('nombre').eq('id', coctel.categoria_id).single(),
        supabase.from('familias').select('nombre').eq('id', coctel.familia_id).single(),
        supabase.from('soportes').select('nombre').eq('id', coctel.soporte_id).single(),
        supabase.from('tecnicas').select('nombre').eq('id', coctel.tecnica_id).single()
      ]);

      setNombresCatalogos({
        categoria: resCat.data?.nombre || '-',
        familia: resFam.data?.nombre || '-',
        soporte: resSop.data?.nombre || '-',
        tecnica: resTec.data?.nombre || '-'
      });

      // 2. Cargar Ingredientes con el nombre del insumo usando Join de Supabase
      const { data: ingsData } = await supabase
        .from('coctel_ingredientes')
        .select(`
          cantidad,
          unidad_medida,
          insumos (nombre, costo_unitario)
        `)
        .eq('coctel_id', coctel.id);
      setIngredientes(ingsData || []);

      // 3. Cargar Pasos de Preparación
      const { data: pasosData } = await supabase
        .from('coctel_pasos_preparacion')
        .select('*')
        .eq('coctel_id', coctel.id)
        .order('numero_paso', { ascending: true });
      setPasos(pasosData || []);

      // 4. Cargar Presencia en Cartas
      const { data: cartasData } = await supabase
        .from('carta_cocteles')
        .select(`
          precio_venta_override,
          cartas (nombre, cliente_institucion, tematica, estado)
        `)
        .eq('coctel_id', coctel.id);
      setCartas(cartasData || []);

    } catch (error) {
      console.error('Error cargando detalles del cóctel:', error);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 p-4 md:p-6 animate-fade-in overflow-y-auto custom-scrollbar text-slate-100 space-y-6">
      
      {/* HEADER DEL DETALLE */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <button 
            type="button" 
            onClick={onVolver}
            className="text-xs font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={14} /> Volver a la Grilla
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-wide">{coctel.nombre}</h2>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-xs px-2.5 py-1 rounded font-bold font-mono uppercase">
              {Number(coctel.grado_alcohol || 0).toFixed(1)}% ABV
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {nombresCatalogos.categoria} | {nombresCatalogos.familia} | {nombresCatalogos.soporte} | {nombresCatalogos.tecnica}
          </p>
        </div>
        
        <div className="flex gap-3 shrink-0 mt-2 md:mt-0">
          <Button variant="secondary" icon={<Edit3 size={16} />} onClick={onEditar}>
            Editar Cóctel
          </Button>
          <Button variant="inline-danger" icon={<Trash2 size={16} />} onClick={onEliminar}>
            Eliminar
          </Button>
        </div>
      </div>

      {/* BARRA DE PESTAÑAS */}
      <div className="flex border-b border-slate-800 bg-slate-900 rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto shrink-0">
        <button 
          onClick={() => setTabActiva('ingenieria')}
          className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${tabActiva === 'ingenieria' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Beaker size={14} /> Ingeniería & Receta
        </button>
        <button 
          onClick={() => setTabActiva('sensorial')}
          className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${tabActiva === 'sensorial' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Eye size={14} /> Cata & Maridaje
        </button>
        <button 
          onClick={() => setTabActiva('cartas')}
          className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${tabActiva === 'cartas' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <FileText size={14} /> Presencia en Cartas
        </button>
      </div>

      {/* CONTENEDOR DE CONTENIDO */}
      <div className="bg-slate-900 border-x border-b border-slate-800 rounded-b-xl p-6 space-y-6 flex-1">
        
        {cargando ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs animate-pulse">
            Obteniendo ficha técnica relacional...
          </div>
        ) : (
          <>
            {/* PESTAÑA 1: INGENIERÍA */}
            {tabActiva === 'ingenieria' && (
              <div className="space-y-6 animate-fade-in">
                {/* KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider font-mono">% Alcohol (ABV)</span>
                    <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{Number(coctel.grado_alcohol || 0).toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider font-mono">Azúcar Estimada</span>
                    <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{Number(coctel.porcentaje_azucar || 0).toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider font-mono">COGS / Costo Copa</span>
                    <div className="text-xl font-bold text-purple-400 mt-1 font-mono">${Number(coctel.costo_produccion || 0).toFixed(0)}</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider font-mono">Precio Carta Sugerido</span>
                    <div className="text-xl font-bold text-white mt-1 font-mono">${Number(coctel.precio_venta_sugerido || 0).toFixed(0)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tabla de Ingredientes */}
                  <div>
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">🧪 Balance Líquido (Receta)</h4>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="border-b border-slate-800 text-slate-500 font-mono uppercase">
                          <tr>
                            <th className="pb-2">Insumo</th>
                            <th className="pb-2 text-right">Cantidad</th>
                            <th className="pb-2 text-right">Costo Parcial</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {ingredientes.length === 0 ? (
                            <tr><td colSpan={3} className="py-4 text-center text-slate-600">Sin ingredientes asignados.</td></tr>
                          ) : (
                            ingredientes.map((ing, idx) => {
                              const costoUnit = ing.insumos?.costo_unitario || 0;
                              const parcial = Number(ing.cantidad) * Number(costoUnit);
                              return (
                                <tr key={idx}>
                                  <td className="py-2 text-slate-200 font-sans font-medium">• {ing.insumos?.nombre || 'Desconocido'}</td>
                                  <td className="py-2 text-right text-slate-400">{ing.cantidad} {ing.unidad_medida}</td>
                                  <td className="py-2 text-right text-emerald-400">${parcial.toFixed(0)}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pasos de Preparación */}
                  <div>
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">📋 Secuencia Operativa de Preparación</h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      {pasos.length === 0 ? (
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center text-xs text-slate-600 font-mono">
                          Sin pasos operativos definidos.
                        </div>
                      ) : (
                        pasos.map((p) => (
                          <div key={p.id} className={`p-3 rounded-lg border text-xs space-y-1 bg-slate-950 ${p.es_critico ? 'border-red-900/40 bg-red-950/10' : 'border-slate-800'}`}>
                            <div className="flex justify-between items-center font-mono">
                              <span className={`font-bold ${p.es_critico ? 'text-red-400' : 'text-slate-500'}`}>PASO {p.numero_paso}</span>
                              {p.es_critico && <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded uppercase font-bold">Crítico</span>}
                            </div>
                            <p className="text-slate-300">{p.descripcion}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA 2: SENSORIAL */}
            {tabActiva === 'sensorial' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h4 className="font-bold text-xs text-purple-400 uppercase tracking-widest mb-2">Storytelling & Inspiración</h4>
                  <p className="text-sm text-slate-300 italic bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed">
                    {coctel.reseña_inspiracion || 'Sin receta histórica o storytelling registrado.'}
                  </p>
                </div>

                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 text-sm">
                  <div><span className="text-emerald-400 font-bold font-mono text-xs">👁️ VISTA:</span> <span className="text-slate-300 ml-2">{coctel.reseña_vista || '-'}</span></div>
                  <div><span className="text-amber-400 font-bold font-mono text-xs">👃 NARIZ:</span> <span className="text-slate-300 ml-2">{coctel.reseña_nariz || '-'}</span></div>
                  <div><span className="text-purple-400 font-bold font-mono text-xs">👄 BOCA:</span> <span className="text-slate-300 ml-2">{coctel.reseña_boca || '-'}</span></div>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-2">Maridaje & Sugerencias</h4>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                    <p><strong className="text-emerald-400">Propuesta:</strong> {coctel.maridaje_propuesta || '-'}</p>
                    <p><strong className="text-emerald-400">Justificación:</strong> {coctel.maridaje_justificacion || '-'}</p>
                    <p><strong className="text-emerald-400">Alternativa:</strong> {coctel.maridaje_alternativa || '-'}</p>
                    <p className="pt-2 border-t border-slate-800 text-slate-400">💡 <strong className="text-slate-300">Tips de Barra:</strong> {coctel.tips || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA 3: CARTAS */}
            {tabActiva === 'cartas' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  📜 Menús y Cartas donde está incluido
                </h4>
                
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 font-mono uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Nombre de la Carta</th>
                        <th className="py-3 px-4">Cliente / Institución</th>
                        <th className="py-3 px-4">Temática</th>
                        <th className="py-3 px-4 text-center">Estado</th>
                        <th className="py-3 px-4 text-right">Precio en Carta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {cartas.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-6 text-slate-500 font-mono">Este cóctel no está asignado a ninguna carta activa.</td></tr>
                      ) : (
                        cartas.map((item, idx) => {
                          const c = item.cartas;
                          if (!c) return null;
                          const precioFinal = item.precio_venta_override || coctel.precio_venta_sugerido;
                          return (
                            <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                              <td className="py-3 px-4 font-bold text-slate-100">{c.nombre}</td>
                              <td className="py-3 px-4 text-slate-400">{c.cliente_institucion || 'General'}</td>
                              <td className="py-3 px-4 text-slate-400">{c.tematica || '-'}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 uppercase text-slate-300">
                                  {c.estado}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold">
                                ${Number(precioFinal).toFixed(0)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CoctelDetailView;