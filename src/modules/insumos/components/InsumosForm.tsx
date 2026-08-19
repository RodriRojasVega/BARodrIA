// src/modules/insumos/components/InsumosForm.tsx
import { useState, useMemo, useEffect } from 'react';
import { calcularCostoUnitarioInsumo } from '../../../lib/calculos';
import type { Insumo, TipoInsumo, Proveedor } from '../types';

interface Props {
  insumoAEditar: Insumo | null;
  tipos: TipoInsumo[];
  proveedores: Proveedor[];
  guardando: boolean;
  onVolver: () => void;
  onGuardar: (payload: any, provsAsociados: Map<number, number | null>) => void;
}

export function InsumosForm({ insumoAEditar, tipos, proveedores, guardando, onVolver, onGuardar }: Props) {
  const [formData, setFormData] = useState({
    nombre: '', tipo_id: tipos[0]?.id.toString() || '', unidad_medida: 'ml',
    formato_envase: 750, precio_compra: 0, graduacion_alcohol_base: 0,
    rendimiento_neto_porcentaje: 100, es_artesanal: false
  });
  const [proveedoresAsociados, setProveedoresAsociados] = useState<Map<number, number | null>>(new Map());

  useEffect(() => {
    if (insumoAEditar) {
      setFormData({
        nombre: insumoAEditar.nombre, tipo_id: insumoAEditar.tipo_id?.toString() || '',
        unidad_medida: insumoAEditar.unidad_medida || 'ml', formato_envase: insumoAEditar.formato_envase || 1,
        precio_compra: insumoAEditar.precio_compra || 0, graduacion_alcohol_base: insumoAEditar.graduacion_alcohol_base || 0,
        rendimiento_neto_porcentaje: insumoAEditar.rendimiento_neto_porcentaje ? insumoAEditar.rendimiento_neto_porcentaje * 100 : 100,
        es_artesanal: !!insumoAEditar.es_artesanal
      });
      const mapaProv = new Map<number, number | null>();
      insumoAEditar.proveedores?.forEach(p => mapaProv.set(p.proveedor_id, p.precio_oferta));
      setProveedoresAsociados(mapaProv);
    }
  }, [insumoAEditar]);

  const costoCalculadoActual = useMemo(() => {
    const costoBase = calcularCostoUnitarioInsumo(formData.precio_compra, formData.formato_envase);
    const rendimiento = (formData.rendimiento_neto_porcentaje || 100) / 100;
    return costoBase / (rendimiento > 0 ? rendimiento : 1);
  }, [formData.precio_compra, formData.formato_envase, formData.rendimiento_neto_porcentaje]);

  const aplicarMejorOferta = () => {
    let mejorPrecio: number | null = null;
    proveedoresAsociados.forEach(oferta => {
      if (oferta !== null && !isNaN(oferta) && oferta > 0) {
        if (mejorPrecio === null || oferta < mejorPrecio) mejorPrecio = oferta;
      }
    });
    if (mejorPrecio === null) {
      alert("Ninguno de los proveedores seleccionados tiene un precio de oferta válido definido.");
      return;
    }
    setFormData(prev => ({ ...prev, precio_compra: mejorPrecio! }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(formData, proveedoresAsociados);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto space-y-6 bg-slate-950 p-2 custom-scrollbar">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
        <h2 className="text-lg font-bold text-white tracking-wide">{insumoAEditar ? `Editar Insumo: ${formData.nombre}` : 'Nuevo Insumo'}</h2>
        <button onClick={onVolver} className="text-xs text-slate-400 hover:text-white font-semibold uppercase transition">Cancelar</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Nombre del Insumo</label>
          <input type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tipo de Insumo</label>
            <select value={formData.tipo_id} onChange={e => setFormData({...formData, tipo_id: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none">
              {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Graduación Alcohólica (% ABV)</label>
            <input type="number" step="0.1" value={formData.graduacion_alcohol_base} onChange={e => setFormData({...formData, graduacion_alcohol_base: parseFloat(e.target.value) || 0})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
          </div>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3">
          <input type="checkbox" disabled={!!insumoAEditar} checked={formData.es_artesanal} onChange={e => setFormData({...formData, es_artesanal: e.target.checked})} className="w-4 h-4 rounded bg-slate-900 border-slate-700 accent-emerald-500" />
          <label className="text-xs text-emerald-300 font-bold uppercase tracking-wider">¿Es de origen artesanal / producción propia? {!!insumoAEditar && <span className="text-slate-500 italic">(Inmutable al editar)</span>}</label>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">Formato de Compra y Costeo Principal</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Precio Total Compra ($)</label>
                <button type="button" onClick={aplicarMejorOferta} className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono underline">Usar mejor oferta</button>
              </div>
              <input type="number" step="any" required value={formData.precio_compra} onChange={e => setFormData({...formData, precio_compra: parseFloat(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Unidad Base</label>
              <select value={formData.unidad_medida} onChange={e => setFormData({...formData, unidad_medida: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none">
                <option value="ml">Mililitros (ml)</option><option value="g">Gramos (g)</option><option value="unit">Unidades (unit)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Formato / Envase</label>
              <input type="number" step="any" required value={formData.formato_envase} onChange={e => setFormData({...formData, formato_envase: parseFloat(e.target.value) || 1})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Rendimiento Neto (%)</label>
              <input type="number" step="1" value={formData.rendimiento_neto_porcentaje} onChange={e => setFormData({...formData, rendimiento_neto_porcentaje: parseFloat(e.target.value) || 100})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400 uppercase font-bold tracking-wider">Costo Unitario Resultante:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">${costoCalculadoActual.toFixed(4)}</span>
          </div>
        </div>

        {!formData.es_artesanal && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">Asociar Proveedores</span>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
                  <tr><th className="py-2.5 px-3 text-center">Sel</th><th className="py-2.5 px-3">Proveedor</th><th className="py-2.5 px-3 text-right">Oferta</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {proveedores.map(p => {
                    const isChecked = proveedoresAsociados.has(p.id);
                    const ofertaVal = isChecked ? (proveedoresAsociados.get(p.id) ?? '') : '';
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 text-center">
                          <input type="checkbox" checked={isChecked} onChange={e => {
                            const mapa = new Map(proveedoresAsociados);
                            if (e.target.checked) mapa.set(p.id, null); else mapa.delete(p.id);
                            setProveedoresAsociados(mapa);
                          }} className="accent-emerald-500" />
                        </td>
                        <td className="py-3 px-3 text-white">{p.nombre}</td>
                        <td className="py-3 px-3 text-right">
                          <input type="number" disabled={!isChecked} value={ofertaVal} onChange={e => {
                            const val = e.target.value === '' ? null : parseFloat(e.target.value);
                            const mapa = new Map(proveedoresAsociados); mapa.set(p.id, val); setProveedoresAsociados(mapa);
                          }} className="w-32 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-right disabled:opacity-30" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button type="button" onClick={onVolver} className="bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl text-xs font-bold uppercase text-slate-300">Cancelar</button>
          <button type="submit" disabled={guardando} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 rounded-xl text-xs font-bold uppercase text-white shadow-lg disabled:opacity-50">{guardando ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}