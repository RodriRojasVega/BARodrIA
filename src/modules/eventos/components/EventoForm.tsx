// src/modules/eventos/components/EventoForm.tsx
import { useState } from 'react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Button } from '@/components/ui/Button';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Save, CheckCircle, CalendarPlus } from 'lucide-react';
import { EventoGeneralFormTab } from './tabs/EventoGeneralFormTab';
import { useEventoMutations, EventoFormData } from '../hooks/useEventoMutations';
import { useEventos, EventoConRelaciones } from '../hooks/useEventos';
import { useSalonesSpot } from '../hooks/useSalonesSpot';
import { useEventoDetalleForm } from '../hooks/useEventoDetalleForm';
import { EventoCronogramaFormTab, type ActividadForm, type EtapaForm } from './tabs/EventoCronogramaFormTab';
import { EventoForecastFormTab, type PuntoServicioForm } from './tabs/EventoForecastFormTab'; 

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
  
  // 1. Obtenemos el detalle remoto de etapas, actividades y puntos
  const { data: detalleRemoto, isLoading: cargandoDetalle } = useEventoDetalleForm(eventoId, isEditMode);

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
          spot_id: eventoActual.spot_id || null,
        };
      }
    }

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
      estado: 1, 
      spot_id: null,
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

  // 2. Inicializamos los estados alimentándolos directamente de detalleRemoto si ya cargó
  const [actividadesRemotasPrevias, setActividadesRemotasPrevias] = useState<any[] | null>(null);
  const [etapasRemotasPrevias, setEtapasRemotasPrevias] = useState<any[] | null>(null);
  const [puntosRemotosPrevios, setPuntosRemotosPrevios] = useState<any[] | null>(null);

  // Mapeo limpio y declarativo cuando llega el detalle remoto
  const etapas: EtapaForm[] = etapasRemotasPrevias || (detalleRemoto?.etapas ? detalleRemoto.etapas.map((e: any) => ({
    id: e.id,
    nombre: e.nombre,
    hora_inicio: e.hora_inicio || '',
    hora_fin: e.hora_fin || '',
    modalidad_calculo: e.modalidad_calculo || 'paquete_fijo',
    pax_etapa: e.pax_etapa || 0,
    regla_consumo: Number(e.regla_consumo) || 1,
    salon_ids: (e.evento_etapa_salones || []).map((s: any) => s.salon_id),
  })) : []);

  const actividades: ActividadForm[] = actividadesRemotasPrevias || (detalleRemoto?.actividades ? detalleRemoto.actividades.map((a: any) => ({
    id: a.id,
    etapa_id: a.etapa_id,
    nombre: a.nombre,
    hora_inicio: a.hora_inicio || '',
    hora_fin: a.hora_fin || '',
    es_hito: a.es_hito || false,
  })) : []);

  const puntos: PuntoServicioForm[] = puntosRemotosPrevios || (detalleRemoto?.puntos ? detalleRemoto.puntos.map((p: any) => {
    const pesosMap: Record<number, number> = {};
    (p.evento_punto_conceptos || []).forEach((c: any) => {
      pesosMap[c.concepto_id] = Number(c.peso_ajustado) || 0;
    });
    return {
      id: String(p.id),
      etapa_id: p.etapa_id,
      nombre: p.nombre,
      pax: p.pax_asignado || 0,
      salon_ids: (p.evento_punto_salones || []).map((s: any) => s.salon_id),
      menu_id: p.menu_id || null,
      pesos_ajustados: pesosMap,
    };
  }) : []);

  // Setters seguros que permiten al usuario seguir editando tras la carga inicial
  const setEtapasWrapper = (nuevasEtapas: EtapaForm[] | ((prev: EtapaForm[]) => EtapaForm[])) => {
    const actual = typeof nuevasEtapas === 'function' ? nuevasEtapas(etapas) : nuevasEtapas;
    setEtapasRemotasPrevias(actual);
  };

  const setActividadesWrapper = (nuevasActs: ActividadForm[] | ((prev: ActividadForm[]) => ActividadForm[])) => {
    const actual = typeof nuevasActs === 'function' ? nuevasActs(actividades) : nuevasActs;
    setActividadesRemotasPrevias(actual);
  };

  const setPuntosWrapper = (nuevosPuntos: PuntoServicioForm[] | ((prev: PuntoServicioForm[]) => PuntoServicioForm[])) => {
    const actual = typeof nuevosPuntos === 'function' ? nuevosPuntos(puntos) : nuevosPuntos;
    setPuntosRemotosPrevios(actual);
  };

  const { data: salonesDisponibles = [] } = useSalonesSpot(formData.spot_id);

  const handleGuardar = async (estadoBorrador = false) => {
    try {
      const payload: EventoFormData = {
        ...formData,
        actividades, 
        etapas,
        puntos,
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

  const cargando = crearEvento.isPending || actualizarEvento.isPending || cargandoDetalle;

  return (
    <div className="flex flex-col h-full space-y-5 animate-fade-in bg-background pt-4 md:pt-6">
      
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

      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b border-border/50 mb-6">
          <Tabs 
            tabs={tabsConfig} 
            activeTab={activeTab} 
            onChangeTab={(id) => setActiveTab(id as FormTabKey)} 
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
          
          <TabPanel id="general" activeTab={activeTab}>
            <EventoGeneralFormTab formData={formData} onChange={handleChange} />
          </TabPanel>

          <TabPanel id="etapas" activeTab={activeTab}>
            <EventoCronogramaFormTab 
              actividades={actividades}
              etapas={etapas}
              salonesDisponibles={salonesDisponibles}
              onChangeActividades={setActividadesWrapper}
              onChangeEtapas={setEtapasWrapper}
            />
          </TabPanel>

          <TabPanel id="oferta" activeTab={activeTab}>
            <EventoForecastFormTab 
              eventoId={eventoId || 0}
              puntos={puntos}
              onChangePuntos={setPuntosWrapper}
              etapas={etapas}
              salonesDisponibles={salonesDisponibles}
            />
          </TabPanel>

        </div>
      </div>
    </div>
  );
}