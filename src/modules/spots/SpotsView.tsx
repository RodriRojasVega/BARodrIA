// src/modules/spots/SpotsView.tsx
import { useState } from 'react';
import { SpotList } from './components/SpotList';
import { SpotDetail } from './components/SpotDetail';
import { SpotForm } from './components/SpotForm';
import { supabase } from '@/lib/supabase'; // 👈 Importamos supabase para recargar el detalle si es necesario
import type { Spot } from '@/types/spots';

type ViewState = 'list' | 'detail' | 'form';

export function SpotsView() {
  const [currentView, setCurrentView] = useState<ViewState>('list');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const handleGoToList = () => {
    setSelectedSpot(null);
    setCurrentView('list');
  };

  const handleGoToDetail = (spot: Spot) => {
    setSelectedSpot(spot);
    setCurrentView('detail');
  };

  const handleGoToForm = (spot?: Spot) => {
    setSelectedSpot(spot || null);
    setCurrentView('form');
  };

  // 👈 Modificamos para manejar el guardado con enfoque en el elemento
  const handleSaved = async (spotId?: number) => {
    if (!spotId) {
      handleGoToList();
      return;
    }

    try {
      // Consultamos el spot recién creado o actualizado con sus relaciones (salones)
      const { data, error } = await supabase
        .from('spots')
        .select(`
          *,
          salones_espacios (*)
        `)
        .eq('id', spotId)
        .single();

      if (error) throw error;

      if (data) {
        setSelectedSpot(data as Spot);
        setCurrentView('detail'); // 👈 Salta directamente a la vista de detalle del elemento editado/creado
      } else {
        handleGoToList();
      }
    } catch (err) {
      console.error('Error al recargar el spot guardado:', err);
      handleGoToList();
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in bg-background pt-4 md:pt-6 px-2 md:px-6 pb-6">
      {currentView === 'list' && (
        <SpotList 
          onDetail={handleGoToDetail} 
          onEdit={handleGoToForm} 
          onCreate={() => handleGoToForm()} 
        />
      )}
      
      {currentView === 'detail' && selectedSpot && (
        <SpotDetail 
          spot={selectedSpot} 
          onBack={handleGoToList} 
          onEdit={() => handleGoToForm(selectedSpot)} 
        />
      )}
      
      {currentView === 'form' && (
        <SpotForm 
          spot={selectedSpot} 
          onBack={selectedSpot ? () => handleGoToDetail(selectedSpot) : handleGoToList} 
          onSaved={handleSaved} // 👈 Conectamos nuestra nueva función con enfoque
        />
      )}
    </div>
  );
}