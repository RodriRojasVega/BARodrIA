// src/lib/calculos.ts
import type { IngredienteBOM, InsumoGlobal } from '@/types/subrecetas';

/**
 * Calcula el costo unitario por ml o gramo de un insumo simple.
 * @param precioCompra - Precio total pagado por el envase (ej: $15.000)
 * @param formatoEnvase - Capacidad total del envase (ej: 750 ml)
 */
export function calcularCostoUnitarioInsumo(precioCompra: number, formatoEnvase: number): number {
  if (!formatoEnvase || formatoEnvase <= 0) return 0;
  return precioCompra / formatoEnvase;
}

/**
 * NUEVO: Calcula el Costo Total del Lote (COGS Nivel 2) sumando el costo proporcional 
 * de cada ingrediente del BOM según su cantidad utilizada y formato de envase.
 */
export function calcularCostoLoteBOM(
  ingredientes: IngredienteBOM[], 
  insumosDisponibles: InsumoGlobal[]
): number {
  return ingredientes.reduce((totalCost, ing) => {
    const insumoBase = insumosDisponibles.find(i => i.id === ing.insumo_id);
    if (!insumoBase || !insumoBase.formato_envase || insumoBase.formato_envase <= 0) return totalCost;

    // Aquí TypeScript ya no se quejará porque 'ing.cantidad' coincide con el tipo
    const costoInsumo = (ing.cantidad / insumoBase.formato_envase) * insumoBase.costo_unitario;
    return totalCost + (isNaN(costoInsumo) ? 0 : costoInsumo);
  }, 0);
}

/**
 * Calcula el costo por unidad real de una sub-receta artesanal (jarabes, infusiones, etc.)
 * considerando la merma por cocción o filtrado (Rendimiento Batch Real).
 */
export function calcularCostoSubReceta(costoTotalBatch: number, rendimientoRealMl: number): number {
  if (!rendimientoRealMl || rendimientoRealMl <= 0) return 0;
  return costoTotalBatch / rendimientoRealMl;
}

/**
 * Simulador de Grado Alcohólico (ABV%) considerando el aporte de agua por dilución de la técnica.
 */
export function calcularABVFinal(
  volumenAlcoholPuroMl: number,
  volumenLiquidoInicialMl: number,
  porcentajeDilucionTecnica: number
): number {
  const volumenAguaDilucion = (volumenLiquidoInicialMl * porcentajeDilucionTecnica) / 100;
  const volumenTotalFinal = volumenLiquidoInicialMl + volumenAguaDilucion;

  if (volumenTotalFinal <= 0) return 0;

  const abvFinal = (volumenAlcoholPuroMl / volumenTotalFinal) * 100;
  return Number(abvFinal.toFixed(2));
}

/**
 * Calcula el Precio de Venta Sugerido (PVS) basado en el multiplicador comercial estándar del bar.
 */
export function calcularPrecioVentaSugerido(costoProduccion: number, multiplicador: number = 8.0): number {
  return Math.round(costoProduccion * multiplicador);
}

/**
 * Lógica de Economía Circular para Garnishes:
 * Asigna costo $0 CLP si el insumo proviene de un residuo reutilizado.
 */
export function evaluarCostoGarnish(esRecicladoCircular: boolean, costoBase: number): number {
  return esRecicladoCircular ? 0 : costoBase;
}