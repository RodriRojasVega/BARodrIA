import { useState } from 'react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Button } from '@/components/ui/Button';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Save, CheckCircle, CalendarPlus } from 'lucide-react';
import { EventoGeneralFormTab } from './tabs/EventoGeneralFormTab';
import { useEventoMutations, EventoFormData } from '../hooks/useEventoMutations';
import { useEventos, EventoConRelaciones } from '../hooks/useEventos';

interface EventoFormProps {
  eventoId?: number | null; 
  onGuardado: () => void;
  onCancelar: () => void;
}

type FormTabKey = 'general' | 'etapas' | 'oferta';

export function EventoForm({ eventoId, onGuardado, onCancelar }: EventoFormProps) {
  const [activeTab, setActiveTab] = useState<FormTabKey>('general');
  const { eventos } = useEventos();
  const isEditMode = eventoId !== null && eventoId !== undefined;

  // Inicialización perezosa (Lazy initial state): Carga los datos al nacer el componente sin necesidad de useEffect
  const [formData, setFormData] = useState<EventoFormData>(() => {
    if (isEditMode && eventos) {
      const eventoActual = eventos.find((e: EventoConRelaciones) => e.id === eventoId);
      if (eventoActual) {
        const tipoId: number | null = typeof eventoActual.tipo_evento === 'number' 
          ? eventoActual.tipo_evento 
          : (eventoActual.tipo_evento_info?.id ?? null);

        const estadoId: number = typeof eventoActual.estado === 'number' 
          ? eventoActual.estado 
          : (eventoActual.estado_info?.id ?? 1);

        return {
          nombre: eventoActual.nombre || '',
          tipo_evento: tipoId,
          total_pax: eventoActual.total_pax || 0,
          staff_proyectado: eventoActual.staff_proyectado || 0,
          fecha_evento: eventoActual.fecha_evento || '',
          hora_inicio: eventoActual.hora_inicio || '',
          hora_fin: eventoActual.hora_fin || '',
          mandante_id: eventoActual.mandante_id || null,
          cliente_final_id: eventoActual.cliente_final_id || null,
          observaciones_logistica: eventoActual.observaciones_logistica || '',
          estado: estadoId,
        };
      }
    }

    // Valores por defecto para un evento nuevo
    return {
      nombre: '',
      tipo_evento: null,
      total_pax: 0,
      staff_proyectado: 0,
      fecha_evento: '',
      hora_inicio: '',
      hora_fin: '',
      mandante_id: null,
      cliente_final_id: null,
      observaciones_logistica: '',
      estado: 1, // ID 1 por defecto (Cotización)
    };
  });

  const { crearEvento, actualizarEvento } = useEventoMutations();

  const handleChange = <K extends keyof EventoFormData>(field: K, value: EventoFormData[K]) => {
    setFormData((prev: EventoFormData) => ({
      ...prev,
      [field]: value,
    }));
  };

  const tabsConfig = [
    { id: 'general', label: '1. Configuración General' },
    { id: 'etapas', label: '2. Etapas Operativas' },
    { id: 'oferta', label: '3. Oferta y Puntos de Servicio' },
  ];

  const handleGuardar = async (estadoBorrador = false) => {
    try {
      const payload: EventoFormData = {
        ...formData,
        estado: estadoBorrador ? 1 : formData.estado, 
      };

      if (isEditMode && eventoId) {
        await actualizarEvento.mutateAsync({ id: eventoId, data: payload });
      } else {
        await crearEvento.mutateAsync(payload);
      }
      
      onGuardado();
    } catch (error) {
      console.error('Error al guardar el evento:', error);
      alert('Ocurrió un error al intentar guardar el evento.');
    }
  };

  const cargando = crearEvento.isPending || actualizarEvento.isPending;

  return (
    <div className="flex flex-col h-full space-y-5 animate-fade-in bg-background pt-4 md:pt-6">
      
      {/* HEADER DEL FORMULARIO */}
      <div className="shrink-0">
        <ModuleHeader 
          icon={<CalendarPlus size={20} className="text-primary" />}
          title={isEditMode ? 'Editar Evento' : 'Nuevo Evento'}
          backAction={onCancelar}
          backLabel=""
          backOnRight={true}
          primaryAction={
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                icon={<Save size={16} />}
                onClick={() => handleGuardar(true)}
                disabled={cargando}
                title="Guardar Borrador"
              />
              <Button 
                variant="primary" 
                size="sm" 
                icon={<CheckCircle size={16} />}
                onClick={() => handleGuardar(false)}
                disabled={cargando}
                title="Guardar y Salir"
              />
            </div>
          }
        />
      </div>

      {/* ENRUTADOR DE PESTAÑAS */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b border-border/50 mb-6">
          <Tabs 
            tabs={tabsConfig} 
            activeTab={activeTab} 
            onChangeTab={(id) => setActiveTab(id as FormTabKey)} 
          />
        </div>

        {/* CONTENEDORES DE PESTAÑAS */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
          
          <TabPanel id="general" activeTab={activeTab}>
            <EventoGeneralFormTab formData={formData} onChange={handleChange} />
          </TabPanel>

          <TabPanel id="etapas" activeTab={activeTab}>
            <div className="text-muted text-sm p-4 border border-dashed border-border rounded-xl">
              <p>Próximo paso: Componente para etapas operativas.</p>
            </div>
          </TabPanel>

          <TabPanel id="oferta" activeTab={activeTab}>
            <div className="text-muted text-sm p-4 border border-dashed border-border rounded-xl">
              <p>Próximo paso: Componente para oferta comercial y conceptos.</p>
            </div>
          </TabPanel>

        </div>
      </div>
    </div>
  );
}