// src/modules/eventos/hooks/useEventoMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ActividadForm, EtapaForm } from '../components/tabs/EventoCronogramaFormTab';
import type { PuntoServicioForm } from '../components/tabs/EventoForecastFormTab';

export interface EventoFormData {
  nombre: string;
  tipo_evento: number | null; 
  total_pax: number;
  staff_proyectado: number;    
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string;
  mandante_id?: number | null;
  cliente_final_id?: number | null;
  observaciones_logistica?: string;
  estado: number;            
  salon_id?: number | null;
  spot_id?: number | null;
  
  actividades?: ActividadForm[];
  etapas?: EtapaForm[];
  puntos?: PuntoServicioForm[];
}

export function useEventoMutations() {
  const queryClient = useQueryClient();

  const crearEvento = useMutation({
    mutationFn: async (formData: EventoFormData) => {
      const { actividades = [], etapas = [], puntos = [], ...eventoData } = formData;

      const slug = eventoData.nombre
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const payload = {
        ...eventoData,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        estado: eventoData.estado || 1, 
      };

      const { data: nuevoEvento, error: errEvento } = await supabase
        .from('eventos')
        .insert([payload])
        .select()
        .single();

      if (errEvento) throw new Error(errEvento.message);
      const eventoId = nuevoEvento.id;

      const etapaIdMap = new Map<string | number, number>(); 

      if (etapas.length > 0) {
        for (const [index, etapa] of etapas.entries()) {
          const { data: nuevaEtapa, error: errEtapa } = await supabase
            .from('evento_etapas')
            .insert({
              evento_id: eventoId,
              orden: index + 1,
              nombre: etapa.nombre,
              hora_inicio: etapa.hora_inicio || null,
              hora_fin: etapa.hora_fin || null,
              modalidad_calculo: etapa.modalidad_calculo || 'paquete_fijo',
              pax_etapa: etapa.pax_etapa || 0,
              regla_consumo: etapa.regla_consumo || 1,
            })
            .select()
            .single();

          if (errEtapa) throw new Error(`Error al guardar etapa: ${errEtapa.message}`);
          etapaIdMap.set(etapa.id, nuevaEtapa.id);

          if (etapa.salon_ids && etapa.salon_ids.length > 0) {
            const payloadSalones = etapa.salon_ids.map(salonId => ({
              etapa_id: nuevaEtapa.id,
              salon_id: salonId,
            }));
            await supabase.from('evento_etapa_salones').insert(payloadSalones);
          }
        }
      }

      if (puntos.length > 0) {
        for (const punto of puntos) {
          let resolvedEtapaId = etapaIdMap.get(punto.etapa_id);
          if (!resolvedEtapaId) {
            const foundKey = Array.from(etapaIdMap.keys()).find(k => String(k) === String(punto.etapa_id));
            if (foundKey !== undefined) resolvedEtapaId = etapaIdMap.get(foundKey);
          }
          if (!resolvedEtapaId) continue;

          const { data: nuevoPunto, error: errPunto } = await supabase
            .from('evento_puntos_servicio')
            .insert({
              evento_id: eventoId,
              etapa_id: resolvedEtapaId,
              menu_id: punto.menu_id || null,
              nombre: punto.nombre,
              pax_asignado: punto.pax || 0
            })
            .select().single();

          if (errPunto) throw new Error(`Error al guardar punto: ${errPunto.message}`);

          if (punto.salon_ids && punto.salon_ids.length > 0) {
            const salonesPayload = punto.salon_ids.map(sId => ({
              punto_servicio_id: nuevoPunto.id,
              salon_id: sId
            }));
            await supabase.from('evento_punto_salones').insert(salonesPayload);
          }

          const conceptosKeys = Object.keys(punto.pesos_ajustados || {});
          if (conceptosKeys.length > 0) {
            const pesosPayload = conceptosKeys.map(cIdStr => ({
              punto_servicio_id: nuevoPunto.id,
              concepto_id: parseInt(cIdStr),
              peso_ajustado: punto.pesos_ajustados[parseInt(cIdStr)]
            }));
            await supabase.from('evento_punto_conceptos').insert(pesosPayload);
          }
        }
      }

      if (actividades.length > 0) {
        const payloadActividades = actividades.map((act, index) => {
          let resolvedEtapaId: number | null = null;
          if (act.etapa_id !== null && act.etapa_id !== undefined && act.etapa_id !== '') {
            resolvedEtapaId = etapaIdMap.get(act.etapa_id) || (typeof act.etapa_id === 'number' ? act.etapa_id : null);
          }

          return {
            evento_id: eventoId,
            etapa_id: resolvedEtapaId,
            orden: index + 1,
            nombre: act.nombre,
            hora_inicio: act.hora_inicio || '00:00:00',
            hora_fin: act.hora_fin || '00:00:00',
            es_hito: act.es_hito || false,
          };
        });

        await supabase.from('evento_actividades_cronograma').insert(payloadActividades);
      }

      return nuevoEvento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos_b2b'] });
    },
  });

  const actualizarEvento = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EventoFormData> }) => {
      const { actividades = [], etapas = [], puntos = [], ...eventoData } = data;

      // 1. Actualizar cabecera
      const { data: eventoActualizado, error: errEvento } = await supabase
        .from('eventos')
        .update(eventoData)
        .eq('id', id)
        .select()
        .single();

      if (errEvento) throw new Error(errEvento.message);

      // 2. Limpiar registros transaccionales previos (El CASCADE se encarga de los hijos)
      await supabase.from('evento_puntos_servicio').delete().eq('evento_id', id);
      await supabase.from('evento_actividades_cronograma').delete().eq('evento_id', id);
      await supabase.from('evento_etapas').delete().eq('evento_id', id);

      const etapaIdMap = new Map<string | number, number>();

      // 3. Reinsertar Etapas
      if (etapas.length > 0) {
        for (const [index, etapa] of etapas.entries()) {
          const { data: nuevaEtapa, error: errEtapa } = await supabase
            .from('evento_etapas')
            .insert({
              evento_id: id,
              orden: index + 1,
              nombre: etapa.nombre,
              hora_inicio: etapa.hora_inicio || null,
              hora_fin: etapa.hora_fin || null,
              modalidad_calculo: etapa.modalidad_calculo || 'paquete_fijo',
              pax_etapa: etapa.pax_etapa || 0,
              regla_consumo: etapa.regla_consumo || 1,
            })
            .select()
            .single();

          if (errEtapa) throw new Error(`Error al actualizar etapa: ${errEtapa.message}`);
          etapaIdMap.set(etapa.id, nuevaEtapa.id);

          if (etapa.salon_ids && etapa.salon_ids.length > 0) {
            const payloadSalones = etapa.salon_ids.map(salonId => ({
              etapa_id: nuevaEtapa.id,
              salon_id: salonId,
            }));
            await supabase.from('evento_etapa_salones').insert(payloadSalones);
          }
        }
      }

      // 4. Reinsertar Puntos, Salones y Pesos
      if (puntos.length > 0) {
        for (const punto of puntos) {
          let resolvedEtapaId = etapaIdMap.get(punto.etapa_id);
          if (!resolvedEtapaId) {
            const foundKey = Array.from(etapaIdMap.keys()).find(k => String(k) === String(punto.etapa_id));
            if (foundKey !== undefined) resolvedEtapaId = etapaIdMap.get(foundKey);
          }
          if (!resolvedEtapaId) continue;

          const { data: nuevoPunto, error: errPunto } = await supabase
            .from('evento_puntos_servicio')
            .insert({
              evento_id: id,
              etapa_id: resolvedEtapaId,
              menu_id: punto.menu_id || null,
              nombre: punto.nombre,
              pax_asignado: punto.pax || 0
            })
            .select().single();

          if (errPunto) throw new Error(`Error al guardar punto: ${errPunto.message}`);

          if (punto.salon_ids && punto.salon_ids.length > 0) {
            const salonesPayload = punto.salon_ids.map(sId => ({
              punto_servicio_id: nuevoPunto.id,
              salon_id: sId
            }));
            await supabase.from('evento_punto_salones').insert(salonesPayload);
          }

          const conceptosKeys = Object.keys(punto.pesos_ajustados || {});
          if (conceptosKeys.length > 0) {
            const pesosPayload = conceptosKeys.map(cIdStr => ({
              punto_servicio_id: nuevoPunto.id,
              concepto_id: parseInt(cIdStr),
              peso_ajustado: punto.pesos_ajustados[parseInt(cIdStr)]
            }));
            await supabase.from('evento_punto_conceptos').insert(pesosPayload);
          }
        }
      }

      // 5. Reinsertar Actividades
      if (actividades.length > 0) {
        const payloadActividades = actividades.map((act, index) => {
          let resolvedEtapaId: number | null = null;
          if (act.etapa_id !== null && act.etapa_id !== undefined && act.etapa_id !== '') {
            resolvedEtapaId = etapaIdMap.get(act.etapa_id) || (typeof act.etapa_id === 'number' ? act.etapa_id : null);
          }

          return {
            evento_id: id,
            etapa_id: resolvedEtapaId,
            orden: index + 1,
            nombre: act.nombre,
            hora_inicio: act.hora_inicio || '00:00:00',
            hora_fin: act.hora_fin || '00:00:00',
            es_hito: act.es_hito || false,
          };
        });

        await supabase.from('evento_actividades_cronograma').insert(payloadActividades);
      }

      return eventoActualizado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos_b2b'] });
    },
  });

  const eliminarEvento = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('eventos').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos_b2b'] });
    },
  });

  return { crearEvento, actualizarEvento, eliminarEvento };
}