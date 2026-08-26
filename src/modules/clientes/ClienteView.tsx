// src/modules/clientes/ClientesView.tsx
import { useState } from 'react';
import { ClienteList } from './components/ClienteList';
import { ClienteDetail } from './components/ClienteDetail';
import { ClienteForm } from './components/ClienteForm';
import { supabase } from '@/lib/supabase';
import type { ClienteEmpresa } from '@/types/clientes';

type ViewState = 'list' | 'detail' | 'form';

export function ClientesView() {
  const [currentView, setCurrentView] = useState<ViewState>('list');
  const [selectedCliente, setSelectedCliente] = useState<ClienteEmpresa | null>(null);

  const handleGoToList = () => {
    setSelectedCliente(null);
    setCurrentView('list');
  };

  const handleGoToDetail = (cliente: ClienteEmpresa) => {
    setSelectedCliente(cliente);
    setCurrentView('detail');
  };

  const handleGoToForm = (cliente?: ClienteEmpresa) => {
    setSelectedCliente(cliente || null);
    setCurrentView('form');
  };

  // 👈 Manejador de guardado con enfoque en el elemento modificado o creado
  const handleSaved = async (clienteId?: number) => {
    if (!clienteId) {
      handleGoToList();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clientes_empresas')
        .select('*')
        .eq('id', clienteId)
        .single();

      if (error) throw error;

      if (data) {
        setSelectedCliente(data as ClienteEmpresa);
        setCurrentView('detail'); // 👈 Mantiene la vista activa en el detalle del cliente
      } else {
        handleGoToList();
      }
    } catch (err) {
      console.error('Error al recargar el cliente guardado:', err);
      handleGoToList();
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in bg-background pt-4 md:pt-6 px-2 md:px-6 pb-6">
      {currentView === 'list' && (
        <ClienteList 
          onDetail={handleGoToDetail} 
          onEdit={handleGoToForm} 
          onCreate={() => handleGoToForm()} 
        />
      )}
      
      {currentView === 'detail' && selectedCliente && (
        <ClienteDetail 
          cliente={selectedCliente} 
          onBack={handleGoToList} 
          onEdit={() => handleGoToForm(selectedCliente)} 
        />
      )}
      
      {currentView === 'form' && (
        <ClienteForm 
          cliente={selectedCliente} 
          onBack={selectedCliente ? () => handleGoToDetail(selectedCliente) : handleGoToList} 
          onSaved={handleSaved} // 👈 Conectamos la función con enfoque
        />
      )}
    </div>
  );
}