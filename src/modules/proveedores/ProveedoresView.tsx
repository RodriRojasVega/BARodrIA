import { useState } from 'react';
import { useProveedores } from './hooks/useProveedores';
import type { Proveedor } from '@/types/proveedores';
import type { VistaProveedor } from './types';

import { ProveedoresList } from './components/ProveedoresList';
import { ProveedoresDetail } from './components/ProveedoresDetail';
import { ProveedoresForm } from './components/ProveedoresForm';

export function ProveedoresView() {
  const { proveedores, insumosGlobales, cargando, guardando, guardarProveedor, eliminarProveedor, obtenerHistoricoProv } = useProveedores();
  const [vista, setVista] = useState<VistaProveedor>('listado');
  const [provActivo, setProvActivo] = useState<Proveedor | null>(null);

  const verDetalle = (prov: Proveedor) => { setProvActivo(prov); setVista('detalle'); };
  const procesarEliminacion = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar al proveedor "${nombre}"?`)) return;
    if (await eliminarProveedor(id)) setVista('listado');
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-background text-foreground">
      {vista === 'listado' && <ProveedoresList proveedores={proveedores} cargando={cargando} onVerDetalle={verDetalle} onNuevo={() => { setProvActivo(null); setVista('formulario'); }} />}
      {vista === 'detalle' && provActivo && <ProveedoresDetail proveedor={provActivo} insumosGlobales={insumosGlobales} obtenerHistorico={obtenerHistoricoProv} onVolver={() => setVista('listado')} onEditar={() => setVista('formulario')} onEliminar={procesarEliminacion} />}
      {vista === 'formulario' && <ProveedoresForm provAEditar={provActivo} insumosGlobales={insumosGlobales} guardando={guardando} onVolver={() => provActivo ? setVista('detalle') : setVista('listado')} onGuardar={async (payload, insumosTempo) => {
        const res = await guardarProveedor(payload, insumosTempo, !!provActivo, provActivo?.id.toString());
        if (res.success && res.provActualizado) { setProvActivo(res.provActualizado); setVista('detalle'); }
      }} />}
    </div>
  );
}
export default ProveedoresView;