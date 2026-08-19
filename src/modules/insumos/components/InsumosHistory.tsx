// src/modules/insumos/components/InsumosHistory.tsx
import { useState, useMemo } from 'react';
import type { Insumo, PrecioHistorico } from '../types';

interface Props {
  insumo: Insumo;
  historico: PrecioHistorico[];
  onVolver: () => void;
}

export function InsumosHistory({ insumo, historico, onVolver }: Props) {
  const [buscador, setBuscador] = useState('');
  const [porPagina, setPorPagina] = useState(10);
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    return historico.filter(h => {
      const q = buscador.toLowerCase();
      const fecha = new Date(h.created_at).toLocaleString('es-CL').toLowerCase();
      const prov = h.proveedores?.nombre?.toLowerCase() || 'precio general insumo';
      const precio = h.precio_compra.toString();
      return fecha.includes(q) || prov.includes(q) || precio.includes(q);
    });
  }, [historico, buscador]);

  const paginados = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return filtrados.slice(inicio, inicio + porPagina);
  }, [filtrados, pagina, porPagina]);

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto space-y-4 custom-scrollbar">
      <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800 shrink-0">
        <button onClick={onVolver} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2 rounded-xl transition">← Volver al detalle</button>
        <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Histórico: {insumo.nombre}</span>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <input type="text" value={buscador} onChange={e => { setBuscador(e.target.value); setPagina(1); }} placeholder="Buscar..." className="w-full sm:w-72 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white" />
        <select value={porPagina} onChange={e => { setPorPagina(parseInt(e.target.value)); setPagina(1); }} className="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 outline-none font-mono">
          <option value={10}>10 por pág</option><option value={20}>20 por pág</option>
        </select>
      </div>
      <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden shadow-xl flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400 sticky top-0">
              <tr>
                <th className="py-3 px-4">Fecha</th><th className="py-3 px-3">Origen</th><th className="py-3 px-3 text-right">Precio</th><th className="py-3 px-3 text-right">Costo Unit.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-xs">
              {paginados.map(h => (
                <tr key={h.id} className="hover:bg-slate-800/40 border-b border-slate-800/40 text-sm">
                  <td className="py-3 px-4 font-mono text-slate-300 text-xs">{new Date(h.created_at).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="py-3 px-3">{h.proveedor_id ? <span className="text-white">{h.proveedores?.nombre}</span> : <span className="text-emerald-400/80 font-mono">General</span>}</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">${h.precio_compra.toLocaleString('es-CL')}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">${Number(h.costo_unitario).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}