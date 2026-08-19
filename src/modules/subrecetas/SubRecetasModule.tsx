import { useState } from 'react';
import { SubRecetasListView, type SubRecetaViewItem } from './components/SubRecetasListView';
import { SubRecetaDetailView } from './components/SubRecetaDetailView';
import { SubRecetaFormView } from './components/SubRecetaFormView';
import { useSubRecetas } from './hooks/useSubRecetas';

export function SubRecetasModule() {
  const { subRecetas, tipos, insumos, isLoading, guardarSubReceta, eliminarSubReceta, obtenerDetallesSubReceta } = useSubRecetas();

  const [vistaActiva, setVistaActiva] = useState<'list' | 'detail' | 'form'>('list');
  const [subRecetaSeleccionada, setSubRecetaSeleccionada] = useState<SubRecetaViewItem | null>(null);
  const [ingredientesActivos, setIngredientesActivos] = useState<any[]>([]);
  const [pasosActivos, setPasosActivos] = useState<any[]>([{ descripcion: '' }]);

  const handleNuevaSubReceta = () => {
    setSubRecetaSeleccionada(null);
    setIngredientesActivos([]);
    setPasosActivos([{ descripcion: '' }]);
    setVistaActiva('form');
  };

  const handleVerDetalle = async (subReceta: SubRecetaViewItem) => {
    const { ingredientes, pasos } = await obtenerDetallesSubReceta(subReceta.id);
    setIngredientesActivos(ingredientes);
    setPasosActivos(pasos);
    setSubRecetaSeleccionada(subReceta);
    setVistaActiva('detail');
  };

  const handleEditarSubReceta = async (subReceta: SubRecetaViewItem) => {
    const { ingredientes, pasos } = await obtenerDetallesSubReceta(subReceta.id);
    setIngredientesActivos(ingredientes);
    setPasosActivos(pasos.length > 0 ? pasos : [{ descripcion: '' }]);
    setSubRecetaSeleccionada(subReceta);
    setVistaActiva('form');
  };

  if (isLoading) return <div className="flex h-full items-center justify-center bg-slate-950 text-emerald-500 font-mono animate-pulse">Conectando a BARodrIA...</div>;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-950">
      {vistaActiva === 'list' && (
        <SubRecetasListView data={subRecetas} tipos={tipos} onNuevaSubReceta={handleNuevaSubReceta} onVerDetalle={handleVerDetalle} />
      )}
      {vistaActiva === 'detail' && subRecetaSeleccionada && (
        <SubRecetaDetailView 
          subReceta={subRecetaSeleccionada} insumosDisponibles={insumos} ingredientesBase={ingredientesActivos} pasosBase={pasosActivos}
          onVolver={() => setVistaActiva('list')} onEditar={handleEditarSubReceta} onEliminar={async () => {
            if (confirm("¿Eliminar sub-receta?")) { await eliminarSubReceta(subRecetaSeleccionada.id); setVistaActiva('list'); }
          }}
        />
      )}
      {vistaActiva === 'form' && (
        <SubRecetaFormView
          subRecetaBase={subRecetaSeleccionada} insumosDisponibles={insumos} ingredientesBase={ingredientesActivos} pasosBase={pasosActivos}
          onGuardar={async (payload, ings, pasos) => { await guardarSubReceta(payload, ings, pasos); setVistaActiva('list'); }}
          onCancelar={() => setVistaActiva('list')}
        />
      )}
    </div>
  );
}