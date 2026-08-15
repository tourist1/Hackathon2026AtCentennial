/**
 * Sensor Simulator for AgriFlow
 * Generates realistic farm sensor telemetry data (soil moisture, temperature, pressure, etc.)
 * Simulates continuous data streams from multiple zones with environmental variations
 */

export interface SensorReading {
  timestamp: Date;
  zoneId: number;
  zoneName: string;
  
  // Soil Moisture Sensors (capacitive probes at multiple depths)
  soilMoisture: {
    depth0_10cm: number; // VWC % (volumetric water content)
    depth10_30cm: number;
    depth30_60cm: number;
    matricTensionKpa: number; // Soil water potential (kPa)
  };
  
  // Soil Temperature Sensors (thermistors)
  soilTemperature: {
    depth5cm: number; // Celsius
    depth15cm: number;
  };
  
  // Air Environment
  airTemperature: number; // Celsius
  relativeHumidity: number; // %
  windSpeed: number; // m/s
  solarRadiation: number; // W/m²
  
  // Water Flow & Pressure
  pumpFlowRate: number; // L/min
  pipelinePressure: number; // bar
  pumpPowerConsumption: number; // kW
  
  // System Health
  sensorHealthStatus: 'HEALTHY' | 'DEGRADED' | 'FAULT';
  faultyProbe?: string; // e.g., "Probe #2 at 30cm depth"
}

export interface ZoneSimulationConfig {
  zoneId: number;
  zoneName: string;
  cropType: string;
  lat: number;
  lon: number;
  
  // Base environmental parameters
  baseAirTemp: number;
  baseHumidity: number;
  baseSoilMoisture: number;
  
  // Sensor noise & drift
  sensorNoise: number; // Standard deviation for random noise
  driftFactor: number; // Slow drift over time (0-1)
  
  // Fault injection for testing
  injectFault?: boolean;
  faultType?: 'sensor_drift' | 'complete_failure' | 'intermittent' | 'slow_drift';
}

/**
 * Core Sensor Simulator Class
 * Generates realistic multi-parameter sensor readings with diurnal cycles and anomalies
 */
export class SensorSimulator {
  private configs: Map<number, ZoneSimulationConfig> = new Map();
  private sensorState: Map<number, any> = new Map();
  private simulationTime: Date;
  private timeScale: number; // Time acceleration factor (1 = real-time, 24 = 24x speed)

  constructor(timeScale: number = 1) {
    this.simulationTime = new Date();
    this.timeScale = timeScale;
  }

  /**
   * Register a farm zone for simulation
   */
  registerZone(config: ZoneSimulationConfig): void {
    this.configs.set(config.zoneId, config);
    this.initializeSensorState(config.zoneId);
  }

  /**
   * Initialize internal state for a zone
   */
  private initializeSensorState(zoneId: number): void {
    const config = this.configs.get(zoneId);
    if (!config) return;

    this.sensorState.set(zoneId, {
      moistureBaseline: config.baseSoilMoisture,
      moistureVariation: 0,
      temperatureOffset: 0,
      humidityOffset: 0,
      pressureOffset: 0,
      faultCounter: 0,
      lastFaultTime: 0,
    });
  }

  /**
   * Advance simulation time
   */
  advanceTime(minutesElapsed: number): void {
    const scaled = minutesElapsed * this.timeScale;
    this.simulationTime = new Date(this.simulationTime.getTime() + scaled * 60 * 1000);
  }

  /**
   * Generate sensor reading for a specific zone
   */
  generateReading(zoneId: number): SensorReading | null {
    const config = this.configs.get(zoneId);
    if (!config) return null;

    const state = this.sensorState.get(zoneId);
    const hourOfDay = this.simulationTime.getHours() + this.simulationTime.getMinutes() / 60;

    // Diurnal cycle: temperature peaks at 2 PM, humidity lowest at 3 PM, solar radiation peaks at noon
    const diurnalTempAmplitude = 12; // ±12°C variation
    const airTempCycle = config.baseAirTemp + diurnalTempAmplitude * Math.sin((hourOfDay - 14) * Math.PI / 12);
    const humidityDrop = 35 * Math.sin((hourOfDay - 15) * Math.PI / 12);
    const solarCycle = Math.max(0, 800 * Math.sin((hourOfDay - 6) * Math.PI / 12));

    // Soil moisture decreases during day (evapotranspiration), increases after irrigation
    const etCycleDecline = 5 * Math.max(0, Math.sin((hourOfDay - 6) * Math.PI / 12)); // Peak ET at noon
    
    // Simulate irrigation pulse (e.g., at 6 AM and 6 PM)
    const irrigationPulse = this.isIrrigationTime(hourOfDay) ? 8 : 0;

    // Update moisture state with drift
    state.moistureVariation = (state.moistureVariation * 0.95) + (irrigationPulse - etCycleDecline) * 0.05;
    const currentMoisture = Math.max(8, Math.min(35, state.moistureBaseline + state.moistureVariation));

    // Matric tension (kPa): inverse relationship with VWC
    // At field capacity (32%): ~0 kPa, at wilting point (12%): ~1500 kPa
    const matricTensionKpa = Math.max(0, 1500 * Math.pow((35 - currentMoisture) / 23, 2.5));

    // Soil temperature lags air temperature by ~4 hours
    const laggedHour = hourOfDay - 4;
    const soilTempCycle = config.baseAirTemp + (diurnalTempAmplitude * 0.6) * Math.sin((laggedHour - 14) * Math.PI / 12);

    // Add sensor noise
    const moistureNoise = (Math.random() - 0.5) * 2 * config.sensorNoise;
    const tempNoise = (Math.random() - 0.5) * 2 * (config.sensorNoise * 0.5);
    const humidityNoise = (Math.random() - 0.5) * 2 * (config.sensorNoise * 2);

    // Handle fault injection
    let sensorHealth: 'HEALTHY' | 'DEGRADED' | 'FAULT' = 'HEALTHY';
    let faultyProbe: string | undefined;

    if (config.injectFault) {
      if (config.faultType === 'complete_failure') {
        sensorHealth = 'FAULT';
        faultyProbe = 'Probe #2 at 30cm depth (Complete Failure)';
      } else if (config.faultType === 'sensor_drift') {
        sensorHealth = 'DEGRADED';
        state.moistureVariation += 0.3; // Slow drift upward
        faultyProbe = 'Probe #1 at 10cm depth (Drift Detected)';
      } else if (config.faultType === 'intermittent') {
        // 10% chance of intermittent fault
        if (Math.random() < 0.1) {
          sensorHealth = 'FAULT';
          faultyProbe = 'Probe #3 at 60cm depth (Intermittent)';
        }
      }
    }

    // Flow rate simulation: pump on during irrigation, zero otherwise
    const isIrrigating = this.isIrrigationTime(hourOfDay);
    const pumpFlowRate = isIrrigating ? 45 + (Math.random() - 0.5) * 5 : 0.2; // L/min (small leak baseline)
    
    // Pipeline pressure: proportional to flow rate and elevation
    const pipelinePressure = isIrrigating ? 2.8 + (Math.random() - 0.5) * 0.3 : 0.1; // bar
    
    // Pump power consumption
    const pumpPowerConsumption = isIrrigating ? 0.75 + (Math.random() - 0.5) * 0.1 : 0.01; // kW

    // Detect pipe leak anomaly: unusual pressure-flow ratio
    if (pipelinePressure > 0.5 && pumpFlowRate < 20) {
      sensorHealth = 'DEGRADED';
      faultyProbe = 'Pressure anomaly detected - possible pipe leak';
    }

    return {
      timestamp: new Date(this.simulationTime),
      zoneId: config.zoneId,
      zoneName: config.zoneName,
      
      soilMoisture: {
        depth0_10cm: Math.max(8, Math.min(35, currentMoisture + moistureNoise * 0.5)),
        depth10_30cm: Math.max(8, Math.min(35, currentMoisture - 1.5 + moistureNoise)),
        depth30_60cm: Math.max(8, Math.min(35, currentMoisture - 3 + moistureNoise * 1.2)),
        matricTensionKpa: Math.max(0, matricTensionKpa + (Math.random() - 0.5) * 50),
      },
      
      soilTemperature: {
        depth5cm: Math.max(5, soilTempCycle + 1.5 + tempNoise),
        depth15cm: Math.max(5, soilTempCycle + tempNoise),
      },
      
      airTemperature: Math.max(5, airTempCycle + tempNoise),
      relativeHumidity: Math.max(20, Math.min(95, config.baseHumidity + humidityDrop + humidityNoise)),
      windSpeed: Math.max(0, 5 + Math.sin(hourOfDay / 4) * 3 + (Math.random() - 0.5) * 2),
      solarRadiation: Math.max(0, solarCycle + (Math.random() - 0.5) * 50),
      
      pumpFlowRate: Math.max(0, pumpFlowRate),
      pipelinePressure: Math.max(0, pipelinePressure),
      pumpPowerConsumption: Math.max(0, pumpPowerConsumption),
      
      sensorHealthStatus: sensorHealth,
      faultyProbe,
    };
  }

  /**
   * Check if irrigation should be active at given hour
   * Simulates typical morning (6 AM) and evening (6 PM) irrigation windows
   */
  private isIrrigationTime(hourOfDay: number): boolean {
    const morningStart = 6;
    const morningEnd = 8;
    const eveningStart = 18;
    const eveningEnd = 20;

    return (hourOfDay >= morningStart && hourOfDay < morningEnd) ||
           (hourOfDay >= eveningStart && hourOfDay < eveningEnd);
  }

  /**
   * Generate readings for all registered zones
   */
  generateAllReadings(): SensorReading[] {
    const readings: SensorReading[] = [];
    for (const zoneId of this.configs.keys()) {
      const reading = this.generateReading(zoneId);
      if (reading) readings.push(reading);
    }
    return readings;
  }

  /**
   * Get current simulation time
   */
  getCurrentTime(): Date {
    return new Date(this.simulationTime);
  }

  /**
   * Reset simulation to start time
   */
  resetSimulation(): void {
    this.simulationTime = new Date();
    for (const zoneId of this.configs.keys()) {
      this.initializeSensorState(zoneId);
    }
  }
}

/**
 * Pre-configured zone templates for common scenarios
 */
export const ZONE_TEMPLATES = {
  ALMOND_LETHBRIDGE: {
    zoneId: 1,
    zoneName: 'North Almond Orchard',
    cropType: 'Almonds',
    lat: 49.7324,
    lon: -112.8368,
    baseAirTemp: 24,
    baseHumidity: 35,
    baseSoilMoisture: 22,
    sensorNoise: 0.8,
    driftFactor: 0.01,
  } as ZoneSimulationConfig,

  CORN_TORONTO: {
    zoneId: 2,
    zoneName: 'East Corn Field',
    cropType: 'Field Corn',
    lat: 43.6629,
    lon: -79.3957,
    baseAirTemp: 22,
    baseHumidity: 55,
    baseSoilMoisture: 24,
    sensorNoise: 1.0,
    driftFactor: 0.01,
  } as ZoneSimulationConfig,

  TOMATO_VANCOUVER: {
    zoneId: 3,
    zoneName: 'West Greenhouse Tomatoes',
    cropType: 'Processing Tomatoes',
    lat: 49.2827,
    lon: -123.1207,
    baseAirTemp: 20,
    baseHumidity: 65,
    baseSoilMoisture: 26,
    sensorNoise: 0.6,
    driftFactor: 0.01,
  } as ZoneSimulationConfig,

  GRAPE_MONTREAL: {
    zoneId: 4,
    zoneName: 'South Vineyard',
    cropType: 'Wine Grapes',
    lat: 45.5017,
    lon: -73.5673,
    baseAirTemp: 20,
    baseHumidity: 48,
    baseSoilMoisture: 20,
    sensorNoise: 0.7,
    driftFactor: 0.01,
  } as ZoneSimulationConfig,

  AVOCADO_WINNIPEG: {
    zoneId: 5,
    zoneName: 'Greenhouse Avocados',
    cropType: 'Avocados',
    lat: 49.8951,
    lon: -97.1384,
    baseAirTemp: 25,
    baseHumidity: 60,
    baseSoilMoisture: 28,
    sensorNoise: 0.9,
    driftFactor: 0.01,
  } as ZoneSimulationConfig,
};

/**
 * Scenario generators for testing edge cases
 */
export const SCENARIO_GENERATORS = {
  /**
   * Simulate sudden rainfall event
   * Increases soil moisture rapidly, simulates lower ET
   */
  rainstormScenario: (simulator: SensorSimulator, zoneId: number, rainfallMm: number) => {
    const state = simulator['sensorState'].get(zoneId);
    if (state) {
      state.moistureVariation += rainfallMm / 10; // ~1% VWC per 10mm rain
    }
  },

  /**
   * Simulate extreme heat event
   * Increases air temp, reduces humidity, increases ET
   */
  heatwaveScenario: (simulator: SensorSimulator, zoneId: number, tempIncreaseCelsius: number) => {
    const config = simulator['configs'].get(zoneId);
    if (config) {
      config.baseAirTemp += tempIncreaseCelsius;
    }
  },

  /**
   * Simulate sensor fault for testing fallback mechanisms
   */
  injectSensorFault: (simulator: SensorSimulator, zoneId: number, faultType: 'sensor_drift' | 'complete_failure' | 'intermittent') => {
    const config = simulator['configs'].get(zoneId);
    if (config) {
      config.injectFault = true;
      config.faultType = faultType;
    }
  },

  /**
   * Clear all injected faults
   */
  clearFaults: (simulator: SensorSimulator) => {
    for (const config of simulator['configs'].values()) {
      config.injectFault = false;
    }
  },
};
