// src/modules/cocteles/CoctelView.tsx
import { useState } from 'react';
import type { Coctel } from '@/types/cocteles';
import { useCocteles } from './hooks/useCocteles';

import { CoctelList } from './components/CoctelList';
import { CoctelDetail } from './components/CoctelDetail';
import { CoctelForm, type IngredienteRow, type PasoRow } from './components/CoctelForm';

type VistaActiva = 'grilla' | 'detalle' | 'formulario';

export function CoctelView() {
  // Nota arquitectónica (Regla 2): Idealmente las mutaciones (eliminar/guardar) 
  // deberían estar en un hook separado `useCoctelMutations()` en el futuro.
  const { cocteles, catalogos, isLoading, eliminarCoctel, guardarCoctel } = useCocteles();

  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('grilla');
  const [coctelActivo, setCoctelActivo] = useState<Coctel | null>(null);

const handleEliminar = async (id: number) => {
    try {
      await eliminarCoctel(id);
      if (coctelActivo?.id === id) {
        setCoctelActivo(null);
        setVistaActiva('grilla');
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`Error al eliminar: ${err.message}`);
    }
  };

  const handleGuardarMultinivel = async (formData: Partial<Coctel>, ingredientes: IngredienteRow[], pasos: PasoRow[]) => {
    try {
      await guardarCoctel(coctelActivo?.id, formData, ingredientes, pasos);
      setVistaActiva('grilla');
      setCoctelActivo(null);
    } catch (error: unknown) {
      const err = error as Error;
      // Regla 7: Prohibido usar alert().
      console.error(`Error crítico al guardar la receta: ${err.message}`);
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
        onEliminar={() => handleEliminar(coctelActivo.id)}
      />
    );
  }

  return (
    <CoctelList 
      data={cocteles}
      catalogos={catalogos}
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