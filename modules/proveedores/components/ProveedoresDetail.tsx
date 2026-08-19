// src/modules/proveedores/components/ProveedoresDetail.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Trash2, ClipboardList, TrendingUp } from 'lucide-react';
import type { Proveedor, InsumoGlobal, PrecioHistorico } from '../types';

interface Props {
  proveedor: Proveedor;
  insumosGlobales: InsumoGlobal[];
  obtenerHistorico: (id: number) => Promise<PrecioHistorico[]>;
  onVolver: () => void;
  onEditar: () => void;
  onEliminar: (id: number, nombre: string) => void;
}

export function ProveedoresDetail({ proveedor, insumosGlobales, obtenerHistorico, onVolver, onEditar, onEliminar }: Props) {
  const [tab, setTab] = useState<'catalogo' | 'historico'>('catalogo');
  const [historico, setHistorico] = useState<PrecioHistorico[]>([]);
  const [cargandoHist, setCargandoHist] = useState(false);

  useEffect(() => {
    if (tab === 'historico' && historico.length === 0) {
      cargarHist();
    }
  }, [tab, proveedor.id]);

  const cargarHist = async () => {
    setCargandoHist(true);
    const data = await obtenerHistorico(proveedor.id);
    setHistorico(data);
    setCargandoHist(false);
  };

  return (
    <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <button onClick={onVolver} className="text-xs font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1 transition-colors">
            <ArrowLeft size={14} /> Volver al Directorio
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-slate-100 tracking-wide">{proveedor.nombre}</h2>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[10px] px-2.5 py-1 rounded font-bold font-mono uppercase">Distribuidor</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
            <span>👤 {proveedor.contacto || 'Sin definir'}</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono">📱 {proveedor.telefono || 'Sin definir'}</span>
            <span className="text-slate-600">|</span>
            <span>✉️ {proveedor.email || 'Sin definir'}</span>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={onEditar} className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow">
            <Edit3 size={14} /> Editar
          </button>
          <button onClick={() => onEliminar(proveedor.id, proveedor.nombre)} className="bg-red-950/50 hover:bg-red-900 border border-red-900/50 text-red-400 text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow">
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-800 bg-slate-900 rounded-t-xl px-4 pt-2 gap-2">
        <button onClick={() => setTab('catalogo')} className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${tab === 'catalogo' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
          <ClipboardList size={14} /> Catálogo & Ofertas
        </button>
        <button onClick={() => setTab('historico')} className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${tab === 'historico' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
          <TrendingUp size={14} /> Histórico de Auditoría
        </button>
      </div>

      <div className="bg-slate-900 border-x border-b border-slate-800 rounded-b-xl p-6 shadow-xl min-h-[400px]">
        {tab === 'catalogo' ? (
          <div className="space-y-4 animate-fade-in">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-2">Insumos Asociados y Precios</h4>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-mono uppercase border-b border-slate-800">
                  <tr><th className="py-3 px-4">Insumo</th><th className="py-3 px-4 text-center">Formato / Unidad</th><th className="py-3 px-4 text-right">Precio de Oferta</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {proveedor.insumos?.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-8 text-slate-500 font-mono text-xs">Sin insumos asignados.</td></tr>
                  ) : (
                    proveedor.insumos.map(rel => {
                      const ins = insumosGlobales.find(i => i.id === rel.insumo_id);
                      if (!ins) return null;
                      return (
                        <tr key={rel.insumo_id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-medium text-slate-200 text-xs">{ins.nombre}</td>
                          <td className="py-3 px-4 text-center text-xs text-slate-400 font-mono">{ins.formato_envase} {ins.unidad_medida}</td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold text-xs">${rel.precio_oferta?.toLocaleString('es-CL')}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-2">Registro de Cambios de Tarifas</h4>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-mono uppercase border-b border-slate-800">
                  <tr><th className="py-3 px-4">Fecha y Hora</th><th className="py-3 px-4">Insumo Modificado</th><th className="py-3 px-4 text-right">Precio Registrado</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {cargandoHist ? (
                     <tr><td colSpan={3} className="text-center py-8 text-slate-500 text-xs animate-pulse">Cargando auditoría...</td></tr>
                  ) : historico.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-8 text-slate-500 text-xs">Sin cambios registrados.</td></tr>
                  ) : (
                    historico.map(h => (
                      <tr key={h.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-slate-400 text-xs">{new Date(h.created_at).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td className="py-3 px-4 text-slate-200 text-xs font-sans">{h.insumo_nombre}</td>
                        <td className="py-3 px-4 text-right text-pink-400 text-xs font-bold">${h.precio_compra?.toLocaleString('es-CL')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}