// src/modules/clientes/components/ClienteForm.tsx
import { useState } from 'react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { SelectableCard } from '@/components/ui/SelectableCard';
import { Trash2, Save, Users, MapPin } from 'lucide-react';
import { useClienteMutations } from '../hooks/useClienteMutations';
import { useTiposClientes } from '../hooks/useTiposClientes';
import { useSpots } from '@/modules/spots/hooks/useSpots';
import type { ClienteFormData } from '../types';
import type { ClienteEmpresa } from '@/types/clientes';

interface ClienteFormProps {
  cliente: ClienteEmpresa | null;
  onBack: () => void;
  onSaved: (clienteId?: number) => void;
}

export function ClienteForm({ cliente, onBack, onSaved }: ClienteFormProps) {
  const { crearCliente, actualizarCliente, eliminarCliente } = useClienteMutations();
  const { data: tiposClientes = [] } = useTiposClientes();
  const { data: spotsDisponibles = [] } = useSpots();

  const [formData, setFormData] = useState<ClienteFormData>(() => {
    if (cliente) {
      return {
        nombre: cliente.nombre,
        tipo_id: cliente.tipo_id,
        contacto_nombre: cliente.contacto_nombre,
        telefono: cliente.telefono,
        email: cliente.email,
        spot_ids: cliente.cliente_spots ? cliente.cliente_spots.map(cs => cs.spot_id) : [],
      };
    }
    return {
      nombre: '',
      tipo_id: tiposClientes[0]?.id || null,
      contacto_nombre: '',
      telefono: '',
      email: '',
      spot_ids: [],
    };
  });

  const handleToggleSpot = (spotId: number) => {
    setFormData(prev => {
      const existe = prev.spot_ids.includes(spotId);
      return {
        ...prev,
        spot_ids: existe 
          ? prev.spot_ids.filter(id => id !== spotId)
          : [...prev.spot_ids, spotId]
      };
    });
  };

  const handleGuardar = async () => {
    try {
      let clienteGuardadoId = cliente?.id;

      if (cliente) {
        const updated = await actualizarCliente.mutateAsync({ id: cliente.id, data: formData });
        clienteGuardadoId = updated.id;
      } else {
        const nuevo = await crearCliente.mutateAsync(formData);
        clienteGuardadoId = nuevo.id;
      }

      onSaved(clienteGuardadoId);
    } catch (error) {
      console.error("Error al guardar cliente", error);
    }
  };

  const handleDelete = async () => {
    if (cliente) {
      try {
        await eliminarCliente.mutateAsync(cliente.id);
        onSaved(); 
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    }
  };

  const isCargando = crearCliente.isPending || actualizarCliente.isPending || eliminarCliente.isPending;

  return (
    <div className="flex flex-col h-full space-y-6 pb-10">
      <ModuleHeader
        title={cliente ? "Editar Cliente" : "Nuevo Cliente"}
        icon={<Users size={20} className="text-primary" />}
        backAction={onBack}
        backOnRight={true}
        primaryAction={
          <div className="flex items-center gap-2">
            {cliente && (
              <Button variant="danger" size="sm" icon={<Trash2 size={16} />} onClick={handleDelete} disabled={isCargando} title="Eliminar Cliente" />
            )}
            <Button variant="primary" size="sm" icon={<Save size={16} />} onClick={handleGuardar} disabled={isCargando || !formData.nombre.trim()} title="Guardar Cambios" />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: Datos Base */}
        <div className="lg:col-span-4 space-y-5 bg-surface/50 border border-border/40 rounded-2xl p-5">
          <div className="space-y-4">
            <Input 
              label="Nombre / Empresa" 
              value={formData.nombre} 
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))} 
              placeholder="Ej. Productora Global" 
            />
            <Select 
              label="Tipo de Mandante" 
              value={formData.tipo_id || ''} 
              onChange={(e) => setFormData(prev => ({ ...prev, tipo_id: e.target.value ? Number(e.target.value) : null }))}
            >
              {tiposClientes.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
              ))}
            </Select>
            <Input 
              label="Nombre de Contacto" 
              value={formData.contacto_nombre || ''} 
              onChange={(e) => setFormData(prev => ({ ...prev, contacto_nombre: e.target.value }))} 
              placeholder="Ej. Carla Gómez" 
            />
            <Input 
              label="Teléfono" 
              value={formData.telefono || ''} 
              onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))} 
              placeholder="+569..." 
            />
            <Input 
              label="Correo Electrónico" 
              value={formData.email || ''} 
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} 
              placeholder="contacto@empresa.com" 
            />
          </div>
        </div>

        {/* COLUMNA DERECHA: Selección de Spots con SelectableCard */}
        <div className="lg:col-span-8 space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-muted block text-left">Asociar Spots Disponibles</span>
          
          {spotsDisponibles.length === 0 ? (
            <div className="text-center p-6 border border-dashed border-border/50 rounded-2xl text-muted text-sm">
              No hay Spots creados aún. Crea locaciones primero para poder asociarlas.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {spotsDisponibles.map(spot => {
                const isSelected = formData.spot_ids.includes(spot.id);
                return (
                  <SelectableCard
                    key={spot.id}
                    title={spot.nombre}
                    subtitle={('ciudad' in spot && typeof spot.ciudad === 'string' ? spot.ciudad : null) || 'Santiago'}
                    isActive={isSelected}
                    onClick={() => handleToggleSpot(spot.id)}
                    icon={<MapPin size={16} />}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}