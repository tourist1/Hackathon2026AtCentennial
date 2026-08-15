/**
 * Sensor Data Injection Endpoints for AgriFlow Server
 * Provides REST API for simulator-generated sensor data and testing scenarios
 * 
 * Add these endpoints to your server.ts file
 */

import express from 'express';
import { SensorSimulator, ZONE_TEMPLATES, SCENARIO_GENERATORS } from '../utils/sensorSimulator';

// Global simulator instance (shared across requests)
let globalSimulator: SensorSimulator | null = null;

/**
 * Initialize sensor simulator with pre-configured zones
 */
export function initializeSensorSimulator(): SensorSimulator {
  const simulator = new SensorSimulator(2); // 2x time acceleration
  
  // Register all zone templates
  simulator.registerZone(ZONE_TEMPLATES.ALMOND_LETHBRIDGE);
  simulator.registerZone(ZONE_TEMPLATES.CORN_TORONTO);
  simulator.registerZone(ZONE_TEMPLATES.TOMATO_VANCOUVER);
  simulator.registerZone(ZONE_TEMPLATES.GRAPE_MONTREAL);
  simulator.registerZone(ZONE_TEMPLATES.AVOCADO_WINNIPEG);
  
  globalSimulator = simulator;
  return simulator;
}

/**
 * Get or initialize global simulator
 */
function getSimulator(): SensorSimulator {
  if (!globalSimulator) {
    globalSimulator = initializeSensorSimulator();
  }
  return globalSimulator;
}

/**
 * Convert sensor reading to AgriFlow zone format
 */
function sensorReadingToZoneData(reading: any) {
  return {
    id: reading.zoneId,
    name: reading.zoneName,
    cropType: reading.cropType || 'Unknown',
    currentStage: 'Mid-Season Growth',
    currentVwc: reading.soilMoisture.depth10_30cm, // Use middle layer as representative
    soilTensionKpa: reading.soilMoisture.matricTensionKpa,
    fieldCapacity: 32,
    wiltingPoint: 12,
    madThreshold: 25,
    targetKc: 1.05,
    soilType: 'Sandy Loam',
    sensorHealthStatus: reading.sensorHealthStatus,
    lastUpdateTime: reading.timestamp,
    depthProfile: {
      layer0_10cm: reading.soilMoisture.depth0_10cm,
      layer10_30cm: reading.soilMoisture.depth10_30cm,
      layer30_60cm: reading.soilMoisture.depth30_60cm,
    },
  };
}

/**
 * Convert sensor reading to weather data format
 */
function sensorReadingToWeatherData(reading: any) {
  return {
    temp: reading.airTemperature,
    humidity: reading.relativeHumidity,
    windSpeed: reading.windSpeed,
    solarRad: reading.solarRadiation,
    rainProb24h: Math.random() * 40, // Simulated rain probability
    precip24h: Math.random() < 0.3 ? Math.random() * 15 : 0, // 30% chance of rain
    et0: 0.1 * reading.solarRadiation / 100, // Rough ET0 estimation from solar radiation
    flowRate: reading.pumpFlowRate,
    pipelinePressure: reading.pipelinePressure,
  };
}

/**
 * REST API Endpoints for Sensor Simulator
 * Mount these in your server.ts with: app.use('/api/sensors', createSensorRoutes());
 */
export function createSensorRoutes(): express.Router {
  const router = express.Router();

  /**
   * GET /api/sensors/telemetry
   * Get current sensor readings for all zones or specific zone
   * Query params: ?zoneId=1 (optional)
   */
  router.get('/telemetry', (req, res) => {
    const simulator = getSimulator();
    const zoneId = req.query.zoneId ? parseInt(String(req.query.zoneId)) : null;

    let readings;
    if (zoneId) {
      const reading = simulator.generateReading(zoneId);
      readings = reading ? [reading] : [];
    } else {
      readings = simulator.generateAllReadings();
    }

    return res.json({
      success: true,
      timestamp: simulator.getCurrentTime(),
      sourceType: 'simulated-sensors',
      readingCount: readings.length,
      readings,
      // Convert to AgriFlow zone format for easy integration
      zones: readings.map(r => sensorReadingToZoneData(r)),
      weather: readings.map(r => sensorReadingToWeatherData(r)),
    });
  });

  /**
   * GET /api/sensors/zone/:zoneId
   * Get detailed sensor data for a specific zone
   */
  router.get('/zone/:zoneId', (req, res) => {
    const simulator = getSimulator();
    const zoneId = parseInt(req.params.zoneId);
    const reading = simulator.generateReading(zoneId);

    if (!reading) {
      return res.status(404).json({
        success: false,
        error: `Zone ${zoneId} not found in simulator`,
      });
    }

    return res.json({
      success: true,
      reading,
      zoneData: sensorReadingToZoneData(reading),
      weatherData: sensorReadingToWeatherData(reading),
    });
  });

  /**
   * POST /api/sensors/advance-time
   * Advance simulation time by N minutes
   * Body: { "minutesElapsed": 15 }
   */
  router.post('/advance-time', (req, res) => {
    const simulator = getSimulator();
    const { minutesElapsed = 15 } = req.body;

    simulator.advanceTime(minutesElapsed);

    return res.json({
      success: true,
      message: `Simulation time advanced by ${minutesElapsed} minutes`,
      currentTime: simulator.getCurrentTime(),
      newReadings: simulator.generateAllReadings(),
    });
  });

  /**
   * POST /api/sensors/reset
   * Reset simulation to start time
   */
  router.post('/reset', (req, res) => {
    const simulator = getSimulator();
    simulator.resetSimulation();

    return res.json({
      success: true,
      message: 'Simulation reset to initial time',
      currentTime: simulator.getCurrentTime(),
    });
  });

  /**
   * POST /api/sensors/scenario/rainstorm
   * Simulate rainfall event
   * Body: { "zoneId": 1, "rainfallMm": 35 }
   */
  router.post('/scenario/rainstorm', (req, res) => {
    const simulator = getSimulator();
    const { zoneId, rainfallMm = 25 } = req.body;

    SCENARIO_GENERATORS.rainstormScenario(simulator, zoneId, rainfallMm);

    return res.json({
      success: true,
      scenario: 'rainstorm',
      zoneId,
      rainfallMm,
      message: `Simulated ${rainfallMm}mm rainfall in zone ${zoneId}`,
      updatedReading: simulator.generateReading(zoneId),
    });
  });

  /**
   * POST /api/sensors/scenario/heatwave
   * Simulate extreme heat event
   * Body: { "zoneId": 1, "tempIncreaseCelsius": 8 }
   */
  router.post('/scenario/heatwave', (req, res) => {
    const simulator = getSimulator();
    const { zoneId, tempIncreaseCelsius = 8 } = req.body;

    SCENARIO_GENERATORS.heatwaveScenario(simulator, zoneId, tempIncreaseCelsius);

    return res.json({
      success: true,
      scenario: 'heatwave',
      zoneId,
      tempIncrease: tempIncreaseCelsius,
      message: `Simulated +${tempIncreaseCelsius}°C heatwave in zone ${zoneId}`,
      updatedReading: simulator.generateReading(zoneId),
    });
  });

  /**
   * POST /api/sensors/scenario/fault
   * Inject sensor fault for testing fallback mechanisms
   * Body: { "zoneId": 1, "faultType": "complete_failure" | "sensor_drift" | "intermittent" }
   */
  router.post('/scenario/fault', (req, res) => {
    const simulator = getSimulator();
    const { zoneId, faultType = 'sensor_drift' } = req.body;

    SCENARIO_GENERATORS.injectSensorFault(simulator, zoneId, faultType);

    return res.json({
      success: true,
      scenario: 'sensor_fault',
      zoneId,
      faultType,
      message: `Injected ${faultType} fault in zone ${zoneId}`,
      updatedReading: simulator.generateReading(zoneId),
    });
  });

  /**
   * POST /api/sensors/scenario/pipe-leak
   * Simulate pipe leak (pressure drops without flow increase)
   * Body: { "zoneId": 1 }
   */
  router.post('/scenario/pipe-leak', (req, res) => {
    const simulator = getSimulator();
    const { zoneId } = req.body;

    // Inject sensor fault that will trigger leak detection
    SCENARIO_GENERATORS.injectSensorFault(simulator, zoneId, 'intermittent');

    return res.json({
      success: true,
      scenario: 'pipe_leak',
      zoneId,
      message: `Simulated pipe leak detection in zone ${zoneId}`,
      updatedReading: simulator.generateReading(zoneId),
    });
  });

  /**
   * POST /api/sensors/clear-faults
   * Clear all injected faults across all zones
   */
  router.post('/clear-faults', (req, res) => {
    const simulator = getSimulator();
    SCENARIO_GENERATORS.clearFaults(simulator);

    return res.json({
      success: true,
      message: 'All sensor faults cleared',
      allReadings: simulator.generateAllReadings(),
    });
  });

  /**
   * GET /api/sensors/status
   * Get simulator status and configuration
   */
  router.get('/status', (req, res) => {
    const simulator = getSimulator();

    return res.json({
      success: true,
      simulatorStatus: 'RUNNING',
      currentTime: simulator.getCurrentTime(),
      totalZones: 5,
      zones: [
        ZONE_TEMPLATES.ALMOND_LETHBRIDGE,
        ZONE_TEMPLATES.CORN_TORONTO,
        ZONE_TEMPLATES.TOMATO_VANCOUVER,
        ZONE_TEMPLATES.GRAPE_MONTREAL,
        ZONE_TEMPLATES.AVOCADO_WINNIPEG,
      ].map(z => ({
        zoneId: z.zoneId,
        zoneName: z.zoneName,
        cropType: z.cropType,
      })),
      apiEndpoints: {
        'GET /api/sensors/telemetry': 'Get all zone readings',
        'GET /api/sensors/zone/:zoneId': 'Get specific zone reading',
        'POST /api/sensors/advance-time': 'Advance simulation time',
        'POST /api/sensors/reset': 'Reset simulation',
        'POST /api/sensors/scenario/rainstorm': 'Simulate rainfall',
        'POST /api/sensors/scenario/heatwave': 'Simulate heatwave',
        'POST /api/sensors/scenario/fault': 'Inject sensor fault',
        'POST /api/sensors/scenario/pipe-leak': 'Simulate pipe leak',
        'POST /api/sensors/clear-faults': 'Clear all faults',
      },
    });
  });

  return router;
}
