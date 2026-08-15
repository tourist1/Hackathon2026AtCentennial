import { FarmZone, WeatherCondition } from '../types';

export interface LocationPreset {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  climateDesc: string;
}

export const FARM_LOCATION_PRESETS: LocationPreset[] = [
  {
    id: 'toronto-on',
    name: 'Greater Toronto Area Farms',
    region: 'Ontario',
    country: 'Canada',
    lat: 43.6629,
    lon: -79.3957,
    climateDesc: 'Temperate Humid (Lake Moderation, Diverse Crops, Urban Fringe)',
  },
  {
    id: 'vancouver-bc',
    name: 'Lower Mainland Agricultural Zone',
    region: 'British Columbia',
    country: 'Canada',
    lat: 49.2827,
    lon: -123.1207,
    climateDesc: 'Temperate Oceanic (High Rainfall, Mild Winters, Specialty Crops)',
  },
  {
    id: 'montreal-qc',
    name: 'Montreal Agricultural Belt',
    region: 'Quebec',
    country: 'Canada',
    lat: 45.5017,
    lon: -73.5673,
    climateDesc: 'Cool Temperate (Moderate Rainfall, Frost Risk, Dairy & Grains)',
  },
  {
    id: 'ottawa-on',
    name: 'Ottawa Valley Fields',
    region: 'Ontario',
    country: 'Canada',
    lat: 45.4215,
    lon: -75.6972,
    climateDesc: 'Continental (Seasonal Variation, Moderate Precipitation)',
  },
  {
    id: 'winnipeg-mb',
    name: 'Winnipeg Prairie Grain Belt',
    region: 'Manitoba',
    country: 'Canada',
    lat: 49.8951,
    lon: -97.1384,
    climateDesc: 'Continental Prairie (Low Humidity, Seasonal Extremes, Grain Crops)',
  },
];

export interface CropProfile {
  name: string;
  variety: string;
  soilSuitability: string;
  stages: {
    stageName: string;
    durationDays: number;
    kc: number;
    rootDepthCm: number;
    madThresholdPct: number; // VWC trigger
    stressTolerance: 'Low' | 'Medium' | 'High';
  }[];
}

export const CROP_DATABASE: Record<string, CropProfile> = {
  Almonds: {
    name: 'Almonds',
    variety: 'Nonpareil',
    soilSuitability: 'Deep well-drained Sandy Loam',
    stages: [
      { stageName: 'Budburst & Bloom', durationDays: 30, kc: 0.55, rootDepthCm: 90, madThresholdPct: 22, stressTolerance: 'Low' },
      { stageName: 'Rapid Shoot Growth', durationDays: 45, kc: 0.85, rootDepthCm: 110, madThresholdPct: 24, stressTolerance: 'Medium' },
      { stageName: 'Nut Sizing & Shell Hardening', durationDays: 60, kc: 1.15, rootDepthCm: 120, madThresholdPct: 26, stressTolerance: 'Low' },
      { stageName: 'Kernel Fill', durationDays: 45, kc: 1.10, rootDepthCm: 120, madThresholdPct: 25, stressTolerance: 'Medium' },
      { stageName: 'Hull Split & Pre-Harvest Deficit', durationDays: 30, kc: 0.70, rootDepthCm: 120, madThresholdPct: 20, stressTolerance: 'High' },
    ],
  },
  'Field Corn': {
    name: 'Field Corn',
    variety: 'Pioneer P1197',
    soilSuitability: 'Silt Loam to Clay Loam',
    stages: [
      { stageName: 'Vegetative Seedling (V2-V6)', durationDays: 25, kc: 0.40, rootDepthCm: 45, madThresholdPct: 22, stressTolerance: 'High' },
      { stageName: 'Rapid Canopy (V8-VT)', durationDays: 35, kc: 0.80, rootDepthCm: 75, madThresholdPct: 25, stressTolerance: 'Medium' },
      { stageName: 'Tasseling & Silking (R1)', durationDays: 20, kc: 1.20, rootDepthCm: 100, madThresholdPct: 27, stressTolerance: 'Low' },
      { stageName: 'Grain Fill / Dough (R4)', durationDays: 35, kc: 1.05, rootDepthCm: 100, madThresholdPct: 24, stressTolerance: 'Medium' },
      { stageName: 'Black Layer / Maturity (R6)', durationDays: 20, kc: 0.60, rootDepthCm: 100, madThresholdPct: 18, stressTolerance: 'High' },
    ],
  },
  'Processing Tomatoes': {
    name: 'Processing Tomatoes',
    variety: 'Heinz 1015',
    soilSuitability: 'Clay Loam / Loam',
    stages: [
      { stageName: 'Transplant Establishment', durationDays: 20, kc: 0.50, rootDepthCm: 35, madThresholdPct: 23, stressTolerance: 'Low' },
      { stageName: 'Vegetative & First Flower', durationDays: 30, kc: 0.85, rootDepthCm: 60, madThresholdPct: 25, stressTolerance: 'Medium' },
      { stageName: 'Fruit Set & Sizing', durationDays: 40, kc: 1.15, rootDepthCm: 80, madThresholdPct: 28, stressTolerance: 'Low' },
      { stageName: 'Fruit Ripening (Controlled Deficit)', durationDays: 25, kc: 0.75, rootDepthCm: 80, madThresholdPct: 22, stressTolerance: 'High' },
    ],
  },
  'Wine Grapes': {
    name: 'Wine Grapes',
    variety: 'Cabernet Sauvignon',
    soilSuitability: 'Gravelly Loam / Calcareous',
    stages: [
      { stageName: 'Budbreak & Shoot Growth', durationDays: 40, kc: 0.35, rootDepthCm: 120, madThresholdPct: 19, stressTolerance: 'High' },
      { stageName: 'Flowering & Fruit Set', durationDays: 30, kc: 0.65, rootDepthCm: 140, madThresholdPct: 22, stressTolerance: 'Medium' },
      { stageName: 'Véraison (Color Change)', durationDays: 40, kc: 0.75, rootDepthCm: 150, madThresholdPct: 21, stressTolerance: 'Medium' },
      { stageName: 'Pre-Harvest Regulated Deficit (RDI)', durationDays: 35, kc: 0.45, rootDepthCm: 150, madThresholdPct: 18, stressTolerance: 'High' },
    ],
  },
  Avocados: {
    name: 'Avocados',
    variety: 'Hass on Dusa',
    soilSuitability: 'Sandy Loam with High Aeration',
    stages: [
      { stageName: 'Flowering & Spring Flush', durationDays: 45, kc: 0.65, rootDepthCm: 50, madThresholdPct: 26, stressTolerance: 'Low' },
      { stageName: 'Fruit Sizing & Summer Flush', durationDays: 75, kc: 0.85, rootDepthCm: 60, madThresholdPct: 28, stressTolerance: 'Low' },
      { stageName: 'Autumn Accumulation', durationDays: 60, kc: 0.75, rootDepthCm: 60, madThresholdPct: 25, stressTolerance: 'Medium' },
      { stageName: 'Winter Dormancy / Slow Growth', durationDays: 90, kc: 0.50, rootDepthCm: 60, madThresholdPct: 22, stressTolerance: 'Medium' },
    ],
  },
};

export const INITIAL_FARM_ZONES: FarmZone[] = [
  {
    id: 1,
    name: 'North Orchard (Zone A)',
    cropType: 'Almonds',
    soilType: 'Sandy Loam',
    areaHectares: 4.2,
    rootDepthCm: 120,
    fieldCapacity: 32.0,
    wiltingPoint: 12.0,
    madThreshold: 24.5,
    currentVwc: 23.1, // Near trigger
    soilTensionKpa: 58,
    soilTempC: 22.4,
    valveStatus: 'IDLE',
    valveProgressPct: 0,
    valveDurationMinutes: 35,
    flowRateLpm: 120,
    targetKc: 1.15,
    currentStage: 'Nut Sizing & Shell Hardening',
    stageProgressDays: 28,
    lastIrrigated: '28h ago',
    accumulatedWaterTodayLiters: 0,
    layers: [
      { depthCm: 15, vwc: 21.2, tensionKpa: 72, tempC: 24.8 },
      { depthCm: 45, vwc: 23.1, tensionKpa: 58, tempC: 22.4 },
      { depthCm: 90, vwc: 26.5, tensionKpa: 44, tempC: 20.1 },
      { depthCm: 120, vwc: 29.8, tensionKpa: 36, tempC: 18.5 },
    ],
  },
  {
    id: 2,
    name: 'South Valley Plot (Zone B)',
    cropType: 'Field Corn',
    soilType: 'Silt Loam',
    areaHectares: 6.8,
    rootDepthCm: 100,
    fieldCapacity: 35.0,
    wiltingPoint: 14.0,
    madThreshold: 26.0,
    currentVwc: 27.8, // Adequate
    soilTensionKpa: 42,
    soilTempC: 21.8,
    valveStatus: 'IDLE',
    valveProgressPct: 0,
    valveDurationMinutes: 40,
    flowRateLpm: 180,
    targetKc: 1.20,
    currentStage: 'Tasseling & Silking (R1)',
    stageProgressDays: 8,
    lastIrrigated: '14h ago',
    accumulatedWaterTodayLiters: 7200,
    layers: [
      { depthCm: 15, vwc: 25.0, tensionKpa: 52, tempC: 23.5 },
      { depthCm: 45, vwc: 27.8, tensionKpa: 42, tempC: 21.8 },
      { depthCm: 80, vwc: 31.2, tensionKpa: 36, tempC: 19.8 },
      { depthCm: 100, vwc: 33.5, tensionKpa: 33, tempC: 18.2 },
    ],
  },
  {
    id: 3,
    name: 'West Drip Block (Zone C)',
    cropType: 'Processing Tomatoes',
    soilType: 'Clay Loam',
    areaHectares: 3.5,
    rootDepthCm: 80,
    fieldCapacity: 36.0,
    wiltingPoint: 15.0,
    madThreshold: 27.5,
    currentVwc: 25.4, // Below MAD trigger -> Needs pulse
    soilTensionKpa: 68,
    soilTempC: 23.1,
    valveStatus: 'IDLE',
    valveProgressPct: 0,
    valveDurationMinutes: 30,
    flowRateLpm: 95,
    targetKc: 1.15,
    currentStage: 'Fruit Set & Sizing',
    stageProgressDays: 19,
    lastIrrigated: '38h ago',
    accumulatedWaterTodayLiters: 0,
    layers: [
      { depthCm: 15, vwc: 22.8, tensionKpa: 88, tempC: 25.6 },
      { depthCm: 40, vwc: 25.4, tensionKpa: 68, tempC: 23.1 },
      { depthCm: 65, vwc: 29.0, tensionKpa: 48, tempC: 21.0 },
      { depthCm: 80, vwc: 32.4, tensionKpa: 37, tempC: 19.5 },
    ],
  },
  {
    id: 4,
    name: 'Hillside Vineyard (Zone D)',
    cropType: 'Wine Grapes',
    soilType: 'Gravelly Loam',
    areaHectares: 5.0,
    rootDepthCm: 150,
    fieldCapacity: 28.0,
    wiltingPoint: 10.0,
    madThreshold: 19.0,
    currentVwc: 20.2, // Controlled Deficit
    soilTensionKpa: 82,
    soilTempC: 20.5,
    valveStatus: 'IDLE',
    valveProgressPct: 0,
    valveDurationMinutes: 20,
    flowRateLpm: 60,
    targetKc: 0.75,
    currentStage: 'Véraison (Color Change)',
    stageProgressDays: 22,
    lastIrrigated: '52h ago',
    accumulatedWaterTodayLiters: 0,
    layers: [
      { depthCm: 20, vwc: 17.5, tensionKpa: 110, tempC: 23.0 },
      { depthCm: 60, vwc: 20.2, tensionKpa: 82, tempC: 20.5 },
      { depthCm: 100, vwc: 23.8, tensionKpa: 56, tempC: 18.2 },
      { depthCm: 150, vwc: 26.0, tensionKpa: 39, tempC: 16.8 },
    ],
  },
];

export const INITIAL_WEATHER: WeatherCondition = {
  locationName: 'San Joaquin Valley Farm',
  country: 'United States',
  lat: 36.7468,
  lon: -119.7726,
  tempC: 29.4,
  humidityPct: 38,
  windSpeedKmh: 12.5,
  solarRadiationWm2: 740,
  rainProbability24h: 12,
  precipExpectedMm: 0.0,
  et0MmDay: 5.4,
  hourly: [
    { time: '06:00', temp: 18.2, humidity: 62, rainProb: 5, rainMm: 0, et0: 0.15, solarRad: 120, gridTariffRate: 0.09 },
    { time: '08:00', temp: 21.5, humidity: 55, rainProb: 5, rainMm: 0, et0: 0.28, solarRad: 380, gridTariffRate: 0.12 },
    { time: '10:00', temp: 25.8, humidity: 46, rainProb: 8, rainMm: 0, et0: 0.48, solarRad: 620, gridTariffRate: 0.18 },
    { time: '12:00', temp: 29.4, humidity: 38, rainProb: 12, rainMm: 0, et0: 0.65, solarRad: 850, gridTariffRate: 0.24 },
    { time: '14:00', temp: 31.8, humidity: 32, rainProb: 15, rainMm: 0, et0: 0.72, solarRad: 880, gridTariffRate: 0.45 },
    { time: '16:00', temp: 32.5, humidity: 30, rainProb: 12, rainMm: 0, et0: 0.68, solarRad: 720, gridTariffRate: 0.48 },
    { time: '18:00', temp: 29.8, humidity: 36, rainProb: 10, rainMm: 0, et0: 0.42, solarRad: 390, gridTariffRate: 0.38 },
    { time: '20:00', temp: 25.1, humidity: 48, rainProb: 8, rainMm: 0, et0: 0.18, solarRad: 40, gridTariffRate: 0.16 },
    { time: '22:00', temp: 22.0, humidity: 56, rainProb: 8, rainMm: 0, et0: 0.08, solarRad: 0, gridTariffRate: 0.08 },
    { time: '00:00', temp: 19.8, humidity: 62, rainProb: 5, rainMm: 0, et0: 0.05, solarRad: 0, gridTariffRate: 0.08 },
    { time: '02:00', temp: 18.0, humidity: 66, rainProb: 5, rainMm: 0, et0: 0.04, solarRad: 0, gridTariffRate: 0.08 },
    { time: '04:00', temp: 17.2, humidity: 68, rainProb: 5, rainMm: 0, et0: 0.04, solarRad: 0, gridTariffRate: 0.08 },
  ],
};
