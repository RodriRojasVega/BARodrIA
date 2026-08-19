// src/modules/insumos/components/InsumosDetail.tsx
import { ArrowLeft, Edit3, Trash2, History } from 'lucide-react';
import type { Insumo, TipoInsumo } from '../types';

interface Props {
  insumo: Insumo;
  tipos: TipoInsumo[];
  onVolver: () => void;
  onEditar: () => void;
  onEliminar: (id: number, nombre: string) => void;
  onVerHistorico: () => void;
}

export function InsumosDetail({ insumo, tipos, onVolver, onEditar, onEliminar, onVerHistorico }: Props) {
  const tipoNombre = tipos.find(t => t.id == insumo.tipo_id)?.nombre || 'General';

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto space-y-4 custom-scrollbar">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
        <button onClick={onVolver} className="text-xs text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-2 transition bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
          <ArrowLeft size={14} /> <span>Volver al listado</span>
        </button>
        <div className="flex gap-2">
          <button onClick={onEditar} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5">
            <Edit3 size={14} /> Editar
          </button>
          <button onClick={() => onEliminar(insumo.id, insumo.nombre)} className="text-xs bg-red-950/40 hover:bg-red-900/50 text-red-400 font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition border border-red-900/50 flex items-center gap-1.5">
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>

      <div className="space-y-4 pb-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-mono border border-emerald-500/25">{tipoNombre}</span>
              <h2 className="text-2xl font-bold text-white mt-2">{insumo.nombre}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Costo Unitario Real</span>
              <span className="text-xl font-mono font-bold text-emerald-400">${Number(insumo.costo_unitario).toFixed(4)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Precio Compra</span>
              <span className="text-sm font-mono text-white font-semibold">${insumo.precio_compra?.toLocaleString('es-CL')}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Formato / Envase</span>
              <span className="text-sm font-mono text-white font-semibold">{insumo.formato_envase} {insumo.unidad_medida}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Rendimiento Neto</span>
              <span className="text-sm font-mono text-white font-semibold">{(insumo.rendimiento_neto_porcentaje * 100).toFixed(0)}%</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Graduación (ABV)</span>
              <span className="text-sm font-mono text-amber-400 font-semibold">{insumo.graduacion_alcohol_base > 0 ? `${insumo.graduacion_alcohol_base}%` : 'Sin alcohol'}</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Origen del Insumo</span>
            <span className={`text-xs font-bold font-mono px-3 py-1 rounded-lg ${insumo.es_artesanal ? 'text-purple-400 bg-purple-950/40 border border-purple-900/50' : 'text-slate-400'}`}>
              {insumo.es_artesanal ? 'Artesanal / Producción Propia' : 'Industrial / Comercial'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider font-mono">Proveedores que Suministran este Insumo</h3>
          <div className="space-y-2">
            {insumo.proveedores && insumo.proveedores.length > 0 ? (
              insumo.proveedores.map(p => (
                <div key={p.proveedor_id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-white font-semibold">{p.nombre}</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    {p.precio_oferta ? `$${p.precio_oferta.toLocaleString('es-CL')}` : 'Sin oferta definida'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center bg-slate-900 border border-slate-800 rounded-xl">Este insumo no tiene proveedores asociados actualmente.</div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wider font-mono">Histórico de Precios y Costos</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Consulta todos los registros de auditoría y cambios con buscador y paginación.</p>
          </div>
          <button onClick={onVerHistorico} className="text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-4 py-2.5 rounded-xl border border-emerald-500/30 font-bold transition flex items-center gap-1.5 shadow">
            <History size={16} /> Ver Histórico Completo →
          </button>
        </div>
      </div>
    </div>
  );
}