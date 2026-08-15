/**
 * Agronomic Formulas based on FAO Irrigation and Drainage Paper No. 56
 */

/**
 * Calculates Crop Evapotranspiration: ETc = Kc * ET0
 * @param kc Crop coefficient for specific growth stage
 * @param et0 Reference Evapotranspiration in mm/day
 */
export function calculateETc(kc: number, et0: number): number {
  return Number((kc * et0).toFixed(2));
}

/**
 * Calculates Total Available Water (TAW) in the root zone in mm
 * TAW = 1000 * (theta_FC - theta_WP) * Zr (with Zr in meters)
 * Or 10 * (FC% - WP%) * Zr (with Zr in meters)
 */
export function calculateTAW(fieldCapacityPct: number, wiltingPointPct: number, rootDepthCm: number): number {
  const rootDepthMeters = rootDepthCm / 100;
  const taw = 10 * (fieldCapacityPct - wiltingPointPct) * rootDepthMeters;
  return Math.max(1, Number(taw.toFixed(1)));
}

/**
 * Calculates Readily Available Water (RAW) in mm
 * RAW = p * TAW, where p is the average fraction of TAW that can be depleted from the root zone without stress (MAD)
 */
export function calculateRAW(taw: number, madFraction: number = 0.5): number {
  return Number((taw * madFraction).toFixed(1));
}

/**
 * Calculates Current Soil Water Depletion (Dr) in mm
 */
export function calculateSoilDepletion(
  fieldCapacityPct: number,
  currentVwcPct: number,
  rootDepthCm: number
): number {
  const rootDepthMeters = rootDepthCm / 100;
  const depletion = 10 * (fieldCapacityPct - currentVwcPct) * rootDepthMeters;
  return Math.max(0, Number(depletion.toFixed(1)));
}

/**
 * Converts VWC % to approximate soil matric tension in kPa (Van Genuchten approximation for sandy-loam)
 */
export function vwcToSoilTensionKpa(vwc: number, fc: number = 32, wp: number = 12): number {
  if (vwc >= fc) {
    // Saturated to near field capacity: 0 - 33 kPa
    const ratio = Math.max(0, 1 - (vwc - fc) / 10);
    return Math.max(5, Math.round(33 * ratio));
  } else if (vwc <= wp) {
    // Wilting point or below: > 1500 kPa
    const factor = Math.max(1, (wp - vwc) * 50);
    return Math.min(2500, Math.round(1500 + factor));
  } else {
    // Available water range (33 kPa to 1500 kPa log curve)
    const normalized = (fc - vwc) / (fc - wp);
    const kpa = 33 * Math.pow(1500 / 33, normalized);
    return Math.round(kpa);
  }
}

/**
 * Calculates optimal irrigation pulse duration in minutes given:
 * - Depletion mm
 * - Zone area in hectares (1 ha = 10,000 m²)
 * - System flow rate in Liters per minute
 * - Irrigation system efficiency (e.g. 0.90 for drip)
 */
export function calculateRequiredRuntimeMinutes(
  depletionMm: number,
  areaHectares: number,
  systemFlowRateLpm: number,
  efficiency: number = 0.90
): { minutes: number; totalLiters: number } {
  // 1 mm of water over 1 m² = 1 Liter
  // 1 ha = 10,000 m²
  const targetLiters = (depletionMm * (areaHectares * 10000)) / efficiency;
  const minutes = Math.ceil(targetLiters / systemFlowRateLpm);
  return {
    minutes: Math.min(180, Math.max(5, minutes)),
    totalLiters: Math.round(targetLiters),
  };
}

/**
 * Evaluates water stress index (0 = optimal, 1 = extreme stress)
 */
export function calculateWaterStressIndex(
  currentVwc: number,
  fieldCapacity: number,
  wiltingPoint: number,
  madThreshold: number
): number {
  if (currentVwc >= fieldCapacity) return 0;
  if (currentVwc <= wiltingPoint) return 1.0;
  if (currentVwc >= madThreshold) {
    // No stress within safe depletion range
    return Number(((fieldCapacity - currentVwc) / (fieldCapacity - madThreshold) * 0.2).toFixed(2));
  }
  // Stress starts between MAD and Wilting Point
  const stress = 0.2 + 0.8 * ((madThreshold - currentVwc) / (madThreshold - wiltingPoint));
  return Number(Math.min(1.0, Math.max(0, stress)).toFixed(2));
}
