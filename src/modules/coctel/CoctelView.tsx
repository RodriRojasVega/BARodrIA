// src/modules/coctel/CoctelView.tsx
import { useState } from 'react';
import type { Coctel } from '@/types/coctel';
import { useCocteles } from './hooks/useCocteles';

import { CoctelList } from './components/CoctelList';
import { CoctelDetail } from './components/CoctelDetail';
import { CoctelForm } from './components/CoctelForm';

type VistaActiva = 'grilla' | 'detalle' | 'formulario';

export function CoctelView() {
  const { cocteles, catalogos, isLoading, eliminarCoctel, guardarCoctel } = useCocteles();

  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('grilla');
  const [coctelActivo, setCoctelActivo] = useState<Coctel | null>(null);

  const handleEliminar = async (id: number, nombre: string) => {
    try {
      await eliminarCoctel(id);
      if (coctelActivo?.id === id) {
        setCoctelActivo(null);
        setVistaActiva('grilla');
      }
    } catch (error: unknown) {
      const err = error as Error;
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const handleGuardarMultinivel = async (formData: Partial<Coctel>, ingredientes: any[], pasos: any[]) => {
    try {
      await guardarCoctel(coctelActivo?.id, formData, ingredientes, pasos);
      setVistaActiva('grilla');
      setCoctelActivo(null);
    } catch (error: unknown) {
      const err = error as Error;
      alert(`Error crítico al guardar la receta: ${err.message}`);
      throw err;
    }
  };

  if (vistaActiva === 'formulario') {
    return (
      <CoctelForm 
        coctelAEditar={coctelActivo} 
        onCerrar={() => setVistaActiva(coctelActivo ? 'detalle' : 'grilla')}
        onGuardar={handleGuardarMultinivel}
      />
    );
  }

  if (vistaActiva === 'detalle' && coctelActivo) {
    return (
      <CoctelDetail 
        coctel={coctelActivo}
        onVolver={() => setVistaActiva('grilla')}
        onEditar={() => setVistaActiva('formulario')}
        onEliminar={() => handleEliminar(coctelActivo.id, coctelActivo.nombre)}
      />
    );
  }

  return (
    <CoctelList 
      data={cocteles}
      catalogos={catalogos} // <-- Inyectamos los catálogos para resolver los nombres en la tabla
      isLoading={isLoading}
      onNuevo={() => {
        setCoctelActivo(null);
        setVistaActiva('formulario');
      }}
      onVerDetalle={(coctel) => {
        setCoctelActivo(coctel);
        setVistaActiva('detalle');
      }}
    />
  );
}

export default CoctelView;