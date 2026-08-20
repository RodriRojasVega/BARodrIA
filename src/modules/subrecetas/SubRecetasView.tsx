// src/modules/subrecetas/SubRecetasView.tsx
import { useState } from 'react';
import { SubRecetasList, type SubRecetaItem } from './components/SubRecetasList';
import { SubRecetasDetail } from './components/SubRecetasDetail';
import { SubRecetasForm } from './components/SubRecetasForm';
import { useSubRecetas } from './hooks/useSubRecetas';

export function SubRecetasModule() {
  const { subRecetas, tipos, insumos, isLoading, guardarSubReceta, eliminarSubReceta, obtenerDetallesSubReceta } = useSubRecetas();

  const [vistaActiva, setVistaActiva] = useState<'list' | 'detail' | 'form'>('list');
  const [subRecetaSeleccionada, setSubRecetaSeleccionada] = useState<SubRecetaItem | null>(null);
  const [ingredientesActivos, setIngredientesActivos] = useState<any[]>([]);
  const [pasosActivos, setPasosActivos] = useState<any[]>([{ descripcion: '' }]);

  const handleNuevaSubReceta = () => {
    setSubRecetaSeleccionada(null);
    setIngredientesActivos([]);
    setPasosActivos([{ descripcion: '' }]);
    setVistaActiva('form');
  };

  const handleVerDetalle = async (subReceta: SubRecetaItem) => {
    const { ingredientes, pasos } = await obtenerDetallesSubReceta(subReceta.id);
    setIngredientesActivos(ingredientes);
    setPasosActivos(pasos);
    setSubRecetaSeleccionada(subReceta);
    setVistaActiva('detail');
  };

  const handleEditarSubReceta = async (subReceta: SubRecetaItem) => {
    const { ingredientes, pasos } = await obtenerDetallesSubReceta(subReceta.id);
    setIngredientesActivos(ingredientes);
    setPasosActivos(pasos.length > 0 ? pasos : [{ descripcion: '' }]);
    setSubRecetaSeleccionada(subReceta);
    setVistaActiva('form');
  };

  if (isLoading) {
    // Aplicamos semántica UI Kit: bg-background y text-primary
    return (
      <div className="flex h-full items-center justify-center bg-background text-primary font-mono animate-pulse">
        Conectando a BARodrIA...
      </div>
    );
  }

  return (
    // Aplicamos semántica UI Kit: bg-background
    <div className="h-full w-full flex flex-col overflow-hidden bg-background">
      {vistaActiva === 'list' && (
        <SubRecetasList 
          data={subRecetas} 
          tipos={tipos} 
          onNuevaSubReceta={handleNuevaSubReceta} 
          onVerDetalle={handleVerDetalle} 
        />
      )}
      {vistaActiva === 'detail' && subRecetaSeleccionada && (
        <SubRecetasDetail 
          subReceta={subRecetaSeleccionada} 
          insumosDisponibles={insumos} 
          ingredientesBase={ingredientesActivos} 
          pasosBase={pasosActivos}
          onVolver={() => setVistaActiva('list')} 
          onEditar={handleEditarSubReceta} 
          onEliminar={async () => {
            if (confirm("¿Eliminar sub-receta?")) { 
              await eliminarSubReceta(subRecetaSeleccionada.id); 
              setVistaActiva('list'); 
            }
          }}
        />
      )}
      {vistaActiva === 'form' && (
        <SubRecetasForm
          subRecetaBase={subRecetaSeleccionada} 
          insumosDisponibles={insumos} 
          ingredientesBase={ingredientesActivos} 
          pasosBase={pasosActivos}
          tipos={tipos}
          onGuardar={async (payload, ings, pasos) => { 
            await guardarSubReceta(payload, ings, pasos); 
            setVistaActiva('list'); 
          }}
          onCancelar={() => setVistaActiva('list')}
        />
      )}
    </div>
  );
}