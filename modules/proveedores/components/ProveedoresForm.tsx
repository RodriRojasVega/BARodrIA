// src/modules/proveedores/components/ProveedoresForm.tsx
import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import type { Proveedor, InsumoGlobal } from '../types';

interface Props {
  provAEditar: Proveedor | null;
  insumosGlobales: InsumoGlobal[];
  guardando: boolean;
  onVolver: () => void;
  onGuardar: (payload: any, insumosTempo: { insumo_id: number; precio_oferta: number }[]) => void;
}

export function ProveedoresForm({ provAEditar, insumosGlobales, guardando, onVolver, onGuardar }: Props) {
  const [formData, setFormData] = useState({
    nombre: '', contacto: '', telefono: '', email: '', observaciones: ''
  });
  
  const [insumosTempo, setInsumosTempo] = useState<{ insumo_id: number; precio_oferta: number }[]>([]);
  const [buscadorDisp, setBuscadorDisp] = useState('');

  useEffect(() => {
    if (provAEditar) {
      setFormData({
        nombre: provAEditar.nombre,
        contacto: provAEditar.contacto || '',
        telefono: provAEditar.telefono || '',
        email: provAEditar.email || '',
        observaciones: provAEditar.observaciones || ''
      });
      setInsumosTempo(provAEditar.insumos.map(r => ({ 
        insumo_id: r.insumo_id, 
        precio_oferta: r.precio_oferta || 0 
      })));
    }
  }, [provAEditar]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(formData, insumosTempo);
  };

  const insumosDisponibles = useMemo(() => {
    const seleccionadosIds = new Set(insumosTempo.map(i => i.insumo_id));
    return insumosGlobales.filter(ins => !seleccionadosIds.has(ins.id) && ins.nombre.toLowerCase().includes(buscadorDisp.toLowerCase()));
  }, [insumosGlobales, insumosTempo, buscadorDisp]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-2xl space-y-8 flex-1 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <button onClick={onVolver} className="text-xs font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1 transition-colors">
            <ArrowLeft size={14} /> Volver
          </button>
          <h2 className="text-2xl font-bold text-slate-100 tracking-wide">
            {provAEditar ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h2>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onVolver} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-slate-100 transition-colors">Cancelar</button>
          <button type="submit" form="form-prov" disabled={guardando} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg text-sm font-bold text-white tracking-wide transition-colors shadow-lg disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Guardar Proveedor'}
          </button>
        </div>
      </div>

      <form id="form-prov" onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">1. Datos Comerciales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase">Razón Social / Nombre <span className="text-emerald-500">*</span></label>
              <input type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 outline-none shadow-inner" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase">Contacto Comercial</label>
              <input type="text" value={formData.contacto} onChange={e => setFormData({...formData, contacto: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 outline-none shadow-inner" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase">Teléfono</label>
              <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 outline-none font-mono shadow-inner" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase">Correo Electrónico</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 outline-none shadow-inner" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase">Observaciones</label>
              <textarea rows={2} value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 outline-none shadow-inner" />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-800">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">2. Asignación de Insumos y Precios de Oferta</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col h-[400px]">
              <h4 className="text-xs font-bold text-slate-300 mb-3 uppercase font-mono">📋 Catálogo General</h4>
              <input type="text" value={buscadorDisp} onChange={e => setBuscadorDisp(e.target.value)} placeholder="Buscar insumo..." className="mb-3 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500 shadow-inner" />
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {insumosDisponibles.map(ins => (
                  <div key={ins.id} className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800 hover:border-emerald-500/30 transition">
                    <div>
                      <p className="text-xs text-slate-200 font-medium">{ins.nombre}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Ref: ${ins.precio_compra?.toLocaleString('es-CL')}</p>
                    </div>
                    <button type="button" onClick={() => setInsumosTempo([...insumosTempo, { insumo_id: ins.id, precio_oferta: ins.precio_compra || 0 }])} className="text-emerald-500 hover:text-white bg-emerald-950/40 px-2 py-1 rounded font-bold text-xs">+</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 border border-emerald-900/50 rounded-xl p-4 flex flex-col h-[400px] shadow-inner">
              <h4 className="text-xs font-bold text-emerald-400 mb-3 uppercase font-mono">✅ Insumos Distribuidos ({insumosTempo.length})</h4>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {insumosTempo.length === 0 ? (
                  <div className="text-xs text-slate-600 text-center py-20">Sin insumos distribuidos.</div>
                ) : (
                  insumosTempo.map((item, index) => {
                    const ins = insumosGlobales.find(x => x.id === item.insumo_id);
                    if (!ins) return null;
                    return (
                      <div key={item.insumo_id} className="flex items-center justify-between gap-2 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                        <div className="flex-1 min-w-0"><p className="text-xs text-emerald-400 font-bold truncate">{ins.nombre}</p></div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-slate-400 font-mono">$</span>
                          <input type="number" step="any" value={item.precio_oferta} onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            setInsumosTempo(prev => prev.map((t, idx) => idx === index ? { ...t, precio_oferta: val } : t));
                          }} className="w-24 bg-slate-900 border border-slate-800 text-right rounded px-1.5 py-1 text-xs text-white font-mono outline-none shadow-inner" />
                        </div>
                        <button type="button" onClick={() => setInsumosTempo(prev => prev.filter((_, idx) => idx !== index))} className="text-red-400 hover:bg-red-950 p-1 rounded font-bold text-xs"><X size={14} /></button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}