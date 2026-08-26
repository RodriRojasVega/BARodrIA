// src/modules/eventos/hooks/useForecastReal.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ItemForecastCalculado {
  id: number;
  tipo: string;
  categoria: string;
  nombre: string;
  consumoUnitario: number;
  peso: number;
  unidadBase: string;
  volumenTotal: number;
}

export interface PuntoForecastReal {
  id: number;
  nombre: string;
  paxAsignado: number;
  oferta: ItemForecastCalculado[];
}

export interface EtapaForecastReal {
  id: number;
  nombre: string;
  fase: string;
  horario: string;
  paxEtapa: number;
  reglaConsumo: number;
  puntos: PuntoForecastReal[];
}

interface ConceptoOfertaRelacion {
  peso_ajustado: number | null;
  conceptos_oferta: {
    id: number;
    nombre: string;
    unidad_medida_base: string | null;
    tipo: string | null;
    slug: string | null;
  } | null;
}

export function useForecastReal(eventoId: number) {
  return useQuery({
    queryKey: ['evento_forecast_real', eventoId],
    queryFn: async (): Promise<EtapaForecastReal[]> => {
      if (!eventoId) return [];

      // 1. Obtener las etapas del evento
      const { data: etapasData, error: errEtapas } = await supabase
        .from('evento_etapas')
        .select('id, nombre, orden, hora_inicio, hora_fin, pax_etapa, regla_consumo')
        .eq('evento_id', eventoId)
        .order('orden', { ascending: true });

      if (errEtapas || !etapasData) {
        throw new Error(errEtapas?.message || 'Error al cargar etapas para forecast');
      }

      const etapasConstruidas: EtapaForecastReal[] = [];

      for (const [index, etapa] of etapasData.entries()) {
        // 2. Obtener los puntos de servicio de esta etapa
        const { data: puntosData } = await supabase
          .from('evento_puntos_servicio')
          .select('id, nombre, pax_asignado')
          .eq('etapa_id', etapa.id);

        const puntosConstruidos: PuntoForecastReal[] = [];

        if (puntosData) {
          for (const punto of puntosData) {
            // 3. Obtener los conceptos y pesos ajustados de cada punto
            const { data: conceptosData } = await supabase
              .from('evento_punto_conceptos')
              .select(`
                peso_ajustado,
                conceptos_oferta (
                  id,
                  nombre,
                  unidad_medida_base,
                  tipo,
                  slug
                )
              `)
              .eq('punto_servicio_id', punto.id);

            const ofertaItems: ItemForecastCalculado[] = [];

            if (conceptosData) {
              const conceptosTipados = conceptosData as unknown as ConceptoOfertaRelacion[];
              
              conceptosTipados.forEach((item) => {
                const concepto = item.conceptos_oferta;
                if (!concepto) return;

                ofertaItems.push({
                  id: concepto.id,
                  tipo: concepto.tipo || 'otro',
                  categoria: concepto.tipo || 'otro',
                  nombre: concepto.nombre,
                  consumoUnitario: 1, 
                  peso: Number(item.peso_ajustado) || 0, 
                  unidadBase: concepto.unidad_medida_base || 'unit',
                  volumenTotal: 0, 
                });
              });
            }

            puntosConstruidos.push({
              id: punto.id,
              nombre: punto.nombre,
              paxAsignado: punto.pax_asignado || 0,
              oferta: ofertaItems,
            });
          }
        }

        const horarioTexto = `${etapa.hora_inicio?.slice(0, 5) || '--:--'} - ${etapa.hora_fin?.slice(0, 5) || '--:--'} hrs`;

        etapasConstruidas.push({
          id: etapa.id,
          nombre: etapa.nombre,
          fase: `Etapa ${index + 1}`,
          horario: horarioTexto,
          paxEtapa: etapa.pax_etapa || 0,
          reglaConsumo: Number(etapa.regla_consumo) || 1, 
          puntos: puntosConstruidos,
        });
      }

      return etapasConstruidas;
    },
    enabled: !!eventoId,
    staleTime: 1000 * 60 * 5,
  });
}