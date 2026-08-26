// src/modules/insumos/InsumosView.tsx
import { useState } from 'react';
import { useInsumos } from './hooks/useInsumos';
import { useInsumoMutations } from './hooks/useInsumoMutations';

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
    obtenerHistorico 
  } = useInsumos();

  const { guardarInsumo, eliminarInsumo } = useInsumoMutations();
  
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
    try {
      const hist = await obtenerHistorico(insumo.id);
      setHistoricoActivo(hist);
    } catch {
      setHistoricoActivo([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const procesarEliminacion = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el insumo "${nombre}"?`)) return;
    try {
      await eliminarInsumo.mutateAsync(id);
      setVista('listado');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "No se pudo eliminar el insumo.");
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
          insumo={insumos.find(i => i.id === insumoActivo.id) || insumoActivo} 
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
          key={insumoActivo?.id ?? 'nuevo'}
          insumoAEditar={insumoActivo} 
          tipos={tipos} 
          proveedores={proveedores} 
          guardando={guardarInsumo.isPending} 
          onVolver={() => insumoActivo ? setVista('detalle') : setVista('listado')} 
          onGuardar={async (payload, provsAsociados) => {
            try {
              const nuevoId = await guardarInsumo.mutateAsync({
                payload,
                proveedoresAsociados: provsAsociados,
                isEdicion: !!insumoActivo,
                idEdicion: insumoActivo?.id.toString()
              });
              const insumoActualizado = insumos.find(i => i.id === nuevoId);
              if (insumoActualizado) {
                setInsumoActivo(insumoActualizado);
                setVista('detalle');
              } else {
                setVista('listado');
              }
            } catch (err: unknown) {
              alert(err instanceof Error ? err.message : 'Error al guardar insumo');
            }
          }} 
        />
      )}
    </div>
  );
}

export default InsumosView;