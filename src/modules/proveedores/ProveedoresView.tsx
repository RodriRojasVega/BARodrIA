// src/modules/proveedores/ProveedoresView.tsx
import { useState } from 'react';
import { useProveedores } from './hooks/useProveedores';
import type { Proveedor } from '@/types/proveedores';
import type { VistaProveedor } from '../types';


// Componentes de Presentación
import { ProveedoresList } from './components/ProveedoresList';
import { ProveedoresDetail } from './components/ProveedoresDetail';
import { ProveedoresForm } from './components/ProveedoresForm';

export function ProveedoresView() {
  const { 
    proveedores, 
    insumosGlobales, 
    cargando, 
    guardando, 
    guardarProveedor, 
    eliminarProveedor, 
    obtenerHistoricoProv 
  } = useProveedores();
  
  // Estado UI
  const [vista, setVista] = useState<VistaProveedor>('listado');
  const [provActivo, setProvActivo] = useState<Proveedor | null>(null);

  // Controladores de Vistas
  const verDetalle = (prov: Proveedor) => {
    setProvActivo(prov);
    setVista('detalle');
  };

  const procesarEliminacion = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el proveedor "${nombre}"?`)) return;
    const exito = await eliminarProveedor(id);
    if (exito) {
      setVista('listado');
    } else {
      alert("No se pudo eliminar el proveedor.");
    }
  };

  return (
    // CORRECCIÓN: Usamos bg-background en lugar de bg-slate-950 para respetar los tokens semánticos
    <div className="h-full w-full flex flex-col overflow-hidden bg-background text-foreground">
      {vista === 'listado' && (
        <ProveedoresList 
          proveedores={proveedores} 
          cargando={cargando} 
          onVerDetalle={verDetalle} 
          onNuevo={() => { setProvActivo(null); setVista('formulario'); }} 
        />
      )}

      {vista === 'detalle' && provActivo && (
        <ProveedoresDetail 
          proveedor={provActivo} 
          insumosGlobales={insumosGlobales}
          obtenerHistorico={obtenerHistoricoProv}
          onVolver={() => setVista('listado')} 
          onEditar={() => setVista('formulario')} 
          onEliminar={procesarEliminacion} 
        />
      )}

      {vista === 'formulario' && (
        <ProveedoresForm 
          provAEditar={provActivo} 
          insumosGlobales={insumosGlobales}
          guardando={guardando} 
          onVolver={() => provActivo ? setVista('detalle') : setVista('listado')} 
          onGuardar={async (payload, insumosTempo) => {
            const res = await guardarProveedor(payload, insumosTempo, !!provActivo, provActivo?.id.toString());
            if (res.success && res.provActualizado) {
              setProvActivo(res.provActualizado);
              setVista('detalle');
            }
          }} 
        />
      )}
    </div>
  );
}

export default ProveedoresView;