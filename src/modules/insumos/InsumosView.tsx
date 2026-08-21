// src/modules/insumos/InsumosView.tsx
import { useState } from 'react';
import { useInsumos } from './hooks/useInsumos';

// Tipos: Globales desde @/types, locales desde ./types
import type { Insumo, InsumoPrecioHistorico } from '@/types/insumos';
import type { VistaInsumo } from './types'; 

// Componentes de Presentación
import { InsumosList } from './components/InsumosList';
import { InsumosDetail } from './components/InsumosDetail';
import { InsumosForm } from './components/InsumosForm';

export function InsumosView() {
  const { 
    insumos, 
    tipos, 
    proveedores, 
    cargando, 
    guardando, 
    guardarInsumo, 
    eliminarInsumo, 
    obtenerHistorico 
  } = useInsumos();
  
  // Estado UI
  const [vista, setVista] = useState<VistaInsumo>('listado');
  const [insumoActivo, setInsumoActivo] = useState<Insumo | null>(null);
  
  // Estado del Historial
  const [historicoActivo, setHistoricoActivo] = useState<InsumoPrecioHistorico[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Controladores de Vistas
  const verDetalle = async (insumo: Insumo) => {
    setInsumoActivo(insumo);
    setVista('detalle');
    
    setCargandoHistorial(true);
    const hist = await obtenerHistorico(insumo.id);
    setHistoricoActivo(hist);
    setCargandoHistorial(false);
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

  // Mapeo para InsumosDetail que espera una estructura de historial
  const historialFormateado = historicoActivo.map(h => ({
    id: h.id,
    fecha: h.created_at,
    proveedor_nombre: h.proveedores?.nombre ?? 'Sin proveedor',
    precio_compra: h.precio_compra,
    costo_unitario: h.costo_unitario,
  }));

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-background">
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
          historialPrecios={historialFormateado}
          cargandoHistorial={cargandoHistorial}
          onVolver={() => setVista('listado')} 
          onEditar={() => setVista('formulario')} 
          onEliminar={procesarEliminacion} 
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
              setCargandoHistorial(true);
              const hist = await obtenerHistorico(res.insumoActualizado.id);
              setHistoricoActivo(hist);
              setCargandoHistorial(false);
            } else if (res.success) {
              setVista('listado');
            }
          }} 
        />
      )}
    </div>
  );
}

export default InsumosView;