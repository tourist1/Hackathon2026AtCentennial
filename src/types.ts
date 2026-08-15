export type AgentRole = 'sensor' | 'weather' | 'crop' | 'strategy' | 'actuator';

export type ZoneValveStatus = 'IDLE' | 'IRRIGATING' | 'PAUSED' | 'ALERT';

export interface SoilLayerMoisture {
  depthCm: number;
  vwc: number; // Volumetric Water Content %
  tensionKpa: number; // Matric potential kPa
  tempC: number;
}

export interface FarmZone {
  id: number;
  name: string;
  cropType: string;
  soilType: string;
  areaHectares: number;
  rootDepthCm: number;
  fieldCapacity: number; // e.g. 32%
  wiltingPoint: number; // e.g. 12%
  madThreshold: number; // Management Allowed Depletion, e.g. 24%
  currentVwc: number; // e.g. 23.5%
  soilTensionKpa: number; // e.g. 55 kPa
  soilTempC: number;
  valveStatus: ZoneValveStatus;
  valveProgressPct: number;
  valveDurationMinutes: number;
  flowRateLpm: number;
  targetKc: number;
  currentStage: string;
  stageProgressDays: number;
  layers: SoilLayerMoisture[];
  lastIrrigated: string;
  accumulatedWaterTodayLiters: number;
}

export interface WeatherCondition {
  locationName: string;
  country: string;
  lat: number;
  lon: number;
  tempC: number;
  humidityPct: number;
  windSpeedKmh: number;
  solarRadiationWm2: number;
  rainProbability24h: number;
  precipExpectedMm: number;
  et0MmDay: number;
  hourly: {
    time: string;
    temp: number;
    humidity: number;
    rainProb: number;
    rainMm: number;
    et0: number;
    solarRad: number;
    gridTariffRate: number; // $/kWh
  }[];
}

export interface AgentDecisionChain {
  sensorAgent: {
    status: string;
    confidence: number;
    findings: string;
  };
  weatherAgent: {
    status: string;
    et0MmDay: number;
    rainDelayFactor: number;
    findings: string;
  };
  cropAgent: {
    crop: string;
    growthStage: string;
    kc: number;
    findings: string;
  };
  strategyAgent: {
    action: string;
    durationMinutes: number;
    waterVolumeLiters: number;
    energyScheduleWindow: string;
    reasoning: string;
    waterSavedLitersVsTimer: number;
    costSavedUsd: number;
  };
  actuatorAgent: {
    relayCommand: string;
    pin: string;
    hydraulicSafetyPass: boolean;
    mqttPayload: {
      zoneId: number;
      command: string;
      duration_s: number;
      target_liters: number;
      safety_token: string;
    };
  };
  synthesis: string;
}

export interface AgentLogMessage {
  id: string;
  timestamp: string;
  agentRole: AgentRole;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'alert' | 'success';
  payload?: any;
}

export type ScenarioType =
  | 'normal'
  | 'rainstorm'
  | 'heatwave'
  | 'sensor_fault'
  | 'pipe_leak'
  | 'peak_tariff'
  | 'flowering_stage';

export interface SustainabilityMetrics {
  totalWaterSavedLiters: number;
  totalEnergySavedDollars: number;
  co2OffsetKg: number;
  wueScore: number; // Water Use Efficiency %
  nitrateLeachingPreventedPct: number;
  offPeakPumpPct: number;
}
