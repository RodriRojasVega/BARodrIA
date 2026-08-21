// src/modules/carta/CartaView.tsx
import { useState, useEffect } from 'react';
import type { Carta } from '@/types/carta';
import { useCartas } from './hooks/useCartas';

import { CartaList } from './components/CartaList';
import { CartaDetail } from './components/CartaDetail';
import { CartaForm } from './components/CartaForm';

type VistaActiva = 'grilla' | 'detalle' | 'formulario';

export function CartaView() {
  const { 
    cartas, 
    coctelesGlobales,
    isLoading, 
    cargarCartas, 
    cargarCatalogoCocteles,
    eliminarCarta, 
    guardarCartaMultinivel 
  } = useCartas();

  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('grilla');
  const [cartaActiva, setCartaActiva] = useState<Carta | null>(null);

  // Inicialización y manejo de retorno SPA
  useEffect(() => {
    const inicializar = async () => {
      const cartaRetorno = await cargarCartas();
      if (cartaRetorno) {
        setCartaActiva(cartaRetorno);
        setVistaActiva('detalle');
      }
    };
    inicializar();
  }, [cargarCartas]);

  const handleEliminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar la carta "${nombre}"?`)) return;
    try {
      await eliminarCarta(id);
      if (cartaActiva?.id === id) {
        setCartaActiva(null);
        setVistaActiva('grilla');
      }
    } catch (error: unknown) {
      const err = error as Error;
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const handleGuardar = async (formData: Partial<Carta>, coctelIds: number[]) => {
    try {
      await guardarCartaMultinivel(cartaActiva?.id, formData, coctelIds);
      setVistaActiva('grilla');
      setCartaActiva(null);
    } catch (error: unknown) {
      const err = error as Error;
      alert(`Error al guardar la carta: ${err.message}`);
    }
  };

  if (vistaActiva === 'formulario') {
    return (
      <CartaForm 
        cartaAEditar={cartaActiva}
        coctelesDisponibles={coctelesGlobales}
        onCargarCocteles={cargarCatalogoCocteles}
        onCerrar={() => setVistaActiva(cartaActiva ? 'detalle' : 'grilla')}
        onGuardar={handleGuardar}
      />
    );
  }

  if (vistaActiva === 'detalle' && cartaActiva) {
    return (
      <CartaDetail 
        carta={cartaActiva}
        onVolver={() => setVistaActiva('grilla')}
        onEditar={() => setVistaActiva('formulario')}
        onEliminar={() => handleEliminar(cartaActiva.id, cartaActiva.nombre)}
      />
    );
  }

  return (
    <CartaList 
      data={cartas}
      isLoading={isLoading}
      onNuevo={() => {
        setCartaActiva(null);
        setVistaActiva('formulario');
      }}
      onVerDetalle={(carta) => {
        setCartaActiva(carta);
        setVistaActiva('detalle');
      }}
    />
  );
}

export default CartaView;