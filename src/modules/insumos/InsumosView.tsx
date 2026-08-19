// src/modules/insumos/InsumosView.tsx
import { useState } from 'react';
import { useInsumos } from './hooks/useInsumos';
import type { Insumo, VistaInsumo, PrecioHistorico } from '@/types/insumos';

// Componentes de Presentación (Los crearemos en el Paso 2)
import { InsumosList } from './components/InsumosList';
import { InsumosDetail } from './components/InsumosDetail';
import { InsumosForm } from './components/InsumosForm';
import { InsumosHistory } from './components/InsumosHistory';

export function InsumosView() {
  const { insumos, tipos, proveedores, cargando, guardando, guardarInsumo, eliminarInsumo, obtenerHistorico } = useInsumos();
  
  // Estado UI
  const [vista, setVista] = useState<VistaInsumo>('listado');
  const [insumoActivo, setInsumoActivo] = useState<Insumo | null>(null);
  const [historicoActivo, setHistoricoActivo] = useState<PrecioHistorico[]>([]);

  // Controladores de Vistas
  const verDetalle = (insumo: Insumo) => {
    setInsumoActivo(insumo);
    setVista('detalle');
  };

  const verHistorico = async (insumo: Insumo) => {
    const hist = await obtenerHistorico(insumo.id);
    setHistoricoActivo(hist);
    setVista('historico');
  };

  const procesarEliminacion = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el insumo "${nombre}"?`)) return;
    const exito = await eliminarInsumo(id);
    if (exito) {
      setVista('listado');
    } else {
      alert("No se pudo eliminar el insumo.");
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-950">
      {vista === 'listado' && (
        <InsumosList 
          insumos={insumos} 
          tipos={tipos} 
          cargando={cargando} 
          onVerDetalle={verDetalle} 
          onNuevo={() => { setInsumoActivo(null); setVista('formulario'); }} 
        />
      )}

      {vista === 'detalle' && insumoActivo && (
        <InsumosDetail 
          insumo={insumoActivo} 
          tipos={tipos} 
          onVolver={() => setVista('listado')} 
          onEditar={() => setVista('formulario')} 
          onEliminar={procesarEliminacion} 
          onVerHistorico={() => verHistorico(insumoActivo)} 
        />
      )}

      {vista === 'historico' && insumoActivo && (
        <InsumosHistory 
          insumo={insumoActivo} 
          historico={historicoActivo} 
          onVolver={() => setVista('detalle')} 
        />
      )}

      {vista === 'formulario' && (
        <InsumosForm 
          insumoAEditar={insumoActivo} 
          tipos={tipos} 
          proveedores={proveedores} 
          guardando={guardando} 
          onVolver={() => insumoActivo ? setVista('detalle') : setVista('listado')} 
          onGuardar={async (payload, provsAsociados) => {
            const res = await guardarInsumo(payload, provsAsociados, !!insumoActivo, insumoActivo?.id.toString());
            if (res.success && res.insumoActualizado) {
              setInsumoActivo(res.insumoActualizado);
              setVista('detalle');
            }
          }} 
        />
      )}
    </div>
  );
}

export default InsumosView;