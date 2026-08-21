// src/modules/subrecetas/hooks/useSubRecetaCalculador.ts
import { useState, useMemo } from 'react';
import type { IngredienteBOM } from '@/types/subrecetas';
import type { Insumo as InsumoGlobal } from '@/types/insumos'; // Alias para mantener compatibilidad
import { calcularCostoLoteBOM, calcularCostoSubReceta } from '@/lib/calculos';

export function useSubRecetaCalculador(insumosDisponibles: InsumoGlobal[], rendimientoInicial = 1000) {
  const [ingredientes, setIngredientes] = useState<IngredienteBOM[]>([]);
  const [rendimientoBatch, setRendimientoBatch] = useState<number>(rendimientoInicial);

  const agregarIngrediente = (insumoId: number) => {
    setIngredientes(prev => [
      ...prev,
      { insumo_id: insumoId, cantidad: 100, unidad_medida: 'ml' }
    ]);
  };

  const actualizarIngrediente = <K extends keyof IngredienteBOM>(index: number, campo: K, valor: IngredienteBOM[K]) => {
    setIngredientes(prev => prev.map((item, idx) => {
      if (idx === index) {
        return { ...item, [campo]: valor };
      }
      return item;
    }));
  };

  const eliminarIngrediente = (index: number) => {
    setIngredientes(prev => prev.filter((_, idx) => idx !== index));
  };

  const costoTotalLote = useMemo(() => {
    return calcularCostoLoteBOM(ingredientes, insumosDisponibles);
  }, [ingredientes, insumosDisponibles]);

  const costoUnitarioReal = useMemo(() => {
    return calcularCostoSubReceta(costoTotalLote, rendimientoBatch);
  }, [costoTotalLote, rendimientoBatch]);

  return {
    ingredientes,
    rendimientoBatch,
    setRendimientoBatch,
    agregarIngrediente,
    actualizarIngrediente,
    eliminarIngrediente,
    costoTotalLote,
    costoUnitarioReal
  };
}