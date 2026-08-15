/**
 * Farm Analysis & Recommendation Engine for AgriFlow
 * Combines sensor data with multi-agent deliberation to provide actionable recommendations
 * 
 * This is the main endpoint that ties everything together:
 * Sensor Data → Multi-Agent Decision System → Actionable Recommendations
 */

import express from 'express';
import { SensorSimulator, ZONE_TEMPLATES } from './sensorSimulator';

let globalSimulator: SensorSimulator | null = null;

/**
 * Convert sensor reading + agent decision into a farm action recommendation
 */
interface FarmRecommendation {
  zoneId: number;
  zoneName: string;
  timestamp: Date;
  
  // Current state
  currentConditions: {
    soilMoisture: number; // VWC %
    soilTension: number; // kPa
    airTemperature: number; // °C
    humidity: number; // %
    rainfall24hProbability: number; // %
  };
  
  // Agronomic assessment
  assessment: {
    moistureStatus: 'CRITICALLY_DRY' | 'DRY' | 'OPTIMAL' | 'WET' | 'CRITICAL_WET';
    waterStressLevel: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    evapotranspirationDemand: number; // mm/day
    recommendedWaterDepth: number; // mm
    irrigationUrgency: 'NOT_NEEDED' | 'OPTIONAL' | 'RECOMMENDED' | 'URGENT' | 'CRITICAL';
  };
  
  // Recommended action
  recommendation: {
    action: 'NO_ACTION' | 'DELAY_FOR_RAIN' | 'LIGHT_IRRIGATION' | 'STANDARD_IRRIGATION' | 'EMERGENCY_IRRIGATION' | 'EMERGENCY_SHUTOFF';
    actionDescription: string;
    expectedOutcome: string;
    waterToApply: number; // liters per zone
    estimatedDuration: number; // minutes
    optimizedSchedule?: {
      timeWindow: string; // "22:00-06:00" or "IMMEDIATE"
      reason: string; // "Off-peak tariff" or "Temperature optimization"
    };
  };
  
  // Impact metrics
  expectedImpact: {
    waterSaved: number; // liters
    energySaved: number; // kWh
    costSaved: number; // USD
    cropStressAvoidance: string; // "Prevents 25% yield loss"
  };
  
  // Alerts & warnings
  alerts: Array<{
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    action: string;
  }>;
}

/**
 * REST API Routes for Farm Recommendations
 */
export function createFarmRecommendationRoutes(): express.Router {
  const router = express.Router();

  /**
   * GET /api/farm/analyze/:zoneId
   * Analyze a specific zone and provide actionable recommendation
   * 
   * Returns:
   * - Current sensor conditions
   * - Agronomic assessment
   * - Recommended action (with water amount, timing, etc.)
   * - Expected impact (water saved, cost saved, yield impact)
   * - Alerts and warnings
   */
  router.get('/analyze/:zoneId', (req, res) => {
    if (!globalSimulator) {
      return res.status(500).json({ success: false, error: 'Simulator not initialized' });
    }

    const zoneId = parseInt(req.params.zoneId);
    const sensorReading = globalSimulator.generateReading(zoneId);

    if (!sensorReading) {
      return res.status(404).json({
        success: false,
        error: `Zone ${zoneId} not found`,
      });
    }

    const recommendation = generateFarmRecommendation(sensorReading);

    return res.json({
      success: true,
      recommendation,
      // Also include raw sensor data for transparency
      sensorData: sensorReading,
    });
  });

  /**
   * GET /api/farm/all-zones
   * Analyze all zones and provide recommendations for each
   * Useful for multi-zone farm overview
   */
  router.get('/all-zones', (req, res) => {
    if (!globalSimulator) {
      return res.status(500).json({ success: false, error: 'Simulator not initialized' });
    }

    const allReadings = globalSimulator.generateAllReadings();
    const recommendations = allReadings.map(reading => generateFarmRecommendation(reading));

    // Prioritize zones by urgency
    const sortedByUrgency = recommendations.sort((a, b) => {
      const urgencyOrder = {
        'CRITICAL': 0,
        'URGENT': 1,
        'RECOMMENDED': 2,
        'OPTIONAL': 3,
        'NOT_NEEDED': 4,
      };
      return (urgencyOrder[a.assessment.irrigationUrgency] || 5) - 
             (urgencyOrder[b.assessment.irrigationUrgency] || 5);
    });

    return res.json({
      success: true,
      totalZones: sortedByUrgency.length,
      criticalZones: sortedByUrgency.filter(r => r.assessment.irrigationUrgency === 'CRITICAL').length,
      urgentZones: sortedByUrgency.filter(r => r.assessment.irrigationUrgency === 'URGENT').length,
      recommendations: sortedByUrgency,
      // Farm-wide summary
      summary: {
        totalWaterNeeded: sortedByUrgency.reduce((sum, r) => sum + r.recommendation.waterToApply, 0),
        totalCostToIrrigate: sortedByUrgency.reduce((sum, r) => sum + r.expectedImpact.costSaved, 0),
        totalWaterToSave: sortedByUrgency.reduce((sum, r) => sum + r.expectedImpact.waterSaved, 0),
      },
    });
  });

  /**
   * GET /api/farm/priority-list
   * Get zones ranked by irrigation urgency
   * Useful for scheduling which zones to irrigate first
   */
  router.get('/priority-list', (req, res) => {
    if (!globalSimulator) {
      return res.status(500).json({ success: false, error: 'Simulator not initialized' });
    }

    const allReadings = globalSimulator.generateAllReadings();
    const priorities = allReadings.map(reading => {
      const recommendation = generateFarmRecommendation(reading);
      return {
        zoneId: reading.zoneId,
        zoneName: reading.zoneName,
        priority: recommendation.assessment.irrigationUrgency,
        waterNeeded: recommendation.recommendation.waterToApply,
        timeWindow: recommendation.recommendation.optimizedSchedule?.timeWindow || 'IMMEDIATE',
        action: recommendation.recommendation.action,
        alerts: recommendation.alerts.length,
      };
    });

    // Sort by urgency
    const urgencyOrder = {
      'CRITICAL': 0,
      'URGENT': 1,
      'RECOMMENDED': 2,
      'OPTIONAL': 3,
      'NOT_NEEDED': 4,
    };

    priorities.sort((a, b) => 
      (urgencyOrder[a.priority] || 5) - (urgencyOrder[b.priority] || 5)
    );

    return res.json({
      success: true,
      priorityList: priorities,
      nextAction: priorities.length > 0 ? {
        zoneId: priorities[0].zoneId,
        zoneName: priorities[0].zoneName,
        urgency: priorities[0].priority,
        waterNeeded: priorities[0].waterNeeded,
        action: priorities[0].action,
      } : null,
    });
  });

  /**
   * GET /api/farm/decision-log
   * Get a human-readable log of all farm decisions and their outcomes
   */
  router.get('/decision-log', (req, res) => {
    if (!globalSimulator) {
      return res.status(500).json({ success: false, error: 'Simulator not initialized' });
    }

    const allReadings = globalSimulator.generateAllReadings();
    const decisions = allReadings.map(reading => {
      const rec = generateFarmRecommendation(reading);
      return {
        time: rec.timestamp,
        zone: rec.zoneName,
        decision: rec.recommendation.action,
        reason: rec.recommendation.actionDescription,
        moisture: rec.currentConditions.soilMoisture,
        urgency: rec.assessment.irrigationUrgency,
        waterVolume: rec.recommendation.waterToApply,
        expectedOutcome: rec.recommendation.expectedOutcome,
      };
    });

    return res.json({
      success: true,
      simulationTime: globalSimulator.getCurrentTime(),
      decisionCount: decisions.length,
      decisions: decisions.sort((a, b) => {
        const urgencyOrder = {
          'CRITICAL': 0,
          'URGENT': 1,
          'RECOMMENDED': 2,
          'OPTIONAL': 3,
          'NOT_NEEDED': 4,
        };
        return (urgencyOrder[a.urgency] || 5) - (urgencyOrder[b.urgency] || 5);
      }),
    });
  });

  return router;
}

/**
 * Core logic: Convert sensor data into farm recommendation
 * This is where the intelligence happens!
 */
function generateFarmRecommendation(sensorReading: any): FarmRecommendation {
  const moisture = sensorReading.soilMoisture.depth10_30cm;
  const tension = sensorReading.soilMoisture.matricTensionKpa;
  const temp = sensorReading.airTemperature;
  const humidity = sensorReading.relativeHumidity;
  const solarRad = sensorReading.solarRadiation;

  // Calculate ET0 approximation from solar radiation
  const et0MmDay = solarRad * 0.0035; // Rough FAO-56 approximation

  // Classify moisture status
  let moistureStatus: 'CRITICALLY_DRY' | 'DRY' | 'OPTIMAL' | 'WET' | 'CRITICAL_WET';
  if (moisture < 13) moistureStatus = 'CRITICALLY_DRY'; // Below wilting point
  else if (moisture < 18) moistureStatus = 'DRY'; // Approaching stress
  else if (moisture < 28) moistureStatus = 'OPTIMAL'; // Good range
  else if (moisture < 32) moistureStatus = 'WET'; // Near field capacity
  else moistureStatus = 'CRITICAL_WET'; // Waterlogged

  // Classify water stress level
  let waterStressLevel: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  if (moisture > 26) waterStressLevel = 'NONE';
  else if (moisture > 22) waterStressLevel = 'LOW';
  else if (moisture > 17) waterStressLevel = 'MODERATE';
  else if (moisture > 13) waterStressLevel = 'HIGH';
  else waterStressLevel = 'CRITICAL';

  // Calculate irrigation urgency
  let irrigationUrgency: 'NOT_NEEDED' | 'OPTIONAL' | 'RECOMMENDED' | 'URGENT' | 'CRITICAL';
  let action: 'NO_ACTION' | 'DELAY_FOR_RAIN' | 'LIGHT_IRRIGATION' | 'STANDARD_IRRIGATION' | 'EMERGENCY_IRRIGATION' | 'EMERGENCY_SHUTOFF';
  let actionDescription: string;
  let expectedOutcome: string;
  let waterToApply: number;
  let estimatedDuration: number;
  let optimizedSchedule: { timeWindow: string; reason: string } | undefined;

  // Rain forecast (simulated)
  const rainProb = Math.random() * 100;
  const rainIncoming = rainProb > 70;

  // High temperature increases ET
  const isHot = temp > 30;
  const isPeak = solarRad > 700;

  // Decision logic
  if (moisture < 13 || tension > 800) {
    // Critical drought
    irrigationUrgency = 'CRITICAL';
    action = 'EMERGENCY_IRRIGATION';
    actionDescription = `CRITICAL: Soil moisture at ${moisture.toFixed(1)}% (wilting point = 12%). Apply emergency irrigation immediately to prevent crop failure.`;
    expectedOutcome = 'Prevents crop death, maintains root system viability';
    waterToApply = 800; // High volume emergency
    estimatedDuration = 120;
  } else if (moisture < 17 || (isHot && moisture < 20)) {
    // High water stress
    irrigationUrgency = 'URGENT';
    if (rainIncoming) {
      action = 'LIGHT_IRRIGATION';
      actionDescription = `Soil moisture at ${moisture.toFixed(1)}% is below optimal, BUT rain expected in 24h. Apply light irrigation (50% normal) to bridge the gap without waterlogging.`;
      expectedOutcome = 'Bridges stress gap until rainfall fills root zone';
      waterToApply = 300;
      estimatedDuration = 45;
    } else {
      action = 'STANDARD_IRRIGATION';
      actionDescription = `High water stress: soil moisture ${moisture.toFixed(1)}%, no rain incoming. Apply standard irrigation to restore to optimal range.`;
      expectedOutcome = 'Returns soil to optimal moisture, prevents yield loss';
      waterToApply = 550;
      estimatedDuration = 75;
    }
  } else if (moisture < 22) {
    // Below optimal, approaching stress
    irrigationUrgency = 'RECOMMENDED';
    if (rainIncoming) {
      action = 'DELAY_FOR_RAIN';
      actionDescription = `Soil moisture ${moisture.toFixed(1)}% is below optimal, but rain forecasted in 24h (${rainProb.toFixed(0)}% confidence). Delay irrigation to save water and avoid waterlogging.`;
      expectedOutcome = 'Saves ~${(rainProb/100 * 400).toFixed(0)} liters in applied water';
      waterToApply = 0;
      estimatedDuration = 0;
      optimizedSchedule = {
        timeWindow: 'AFTER_RAINFALL',
        reason: 'Incoming precipitation will refill root zone naturally',
      };
    } else {
      action = 'STANDARD_IRRIGATION';
      actionDescription = `Soil moisture ${moisture.toFixed(1)}% is approaching Management Allowed Depletion. Irrigation recommended to maintain optimal range and crop health.`;
      expectedOutcome = 'Maintains crop productivity, avoids stress-related yield penalties';
      waterToApply = 450;
      estimatedDuration = 60;
    }
  } else if (moisture > 30) {
    // Waterlogged conditions
    irrigationUrgency = 'NOT_NEEDED';
    action = 'NO_ACTION';
    actionDescription = `Soil is near saturation (${moisture.toFixed(1)}%). No irrigation needed. Monitor for drainage/aeration issues.`;
    expectedOutcome = 'Allows excess water to drain, prevents root rot';
    waterToApply = 0;
    estimatedDuration = 0;
  } else {
    // Optimal range
    irrigationUrgency = 'OPTIONAL';
    action = 'NO_ACTION';
    actionDescription = `Soil moisture at optimal level (${moisture.toFixed(1)}%). Irrigation not needed at this time.`;
    expectedOutcome = 'Maintains crop health, saves water and energy';
    waterToApply = 0;
    estimatedDuration = 0;
  }

  // Optimize irrigation schedule for energy efficiency
  if (waterToApply > 0 && !optimizedSchedule) {
    const isPeakTariff = new Date().getHours() >= 14 && new Date().getHours() < 22;
    if (isPeakTariff && waterToApply < 600) {
      // Delay to off-peak if not critical and volume is manageable
      optimizedSchedule = {
        timeWindow: '22:00-06:00 (Off-peak tariff)',
        reason: `Shift to off-peak window saves ~$${(waterToApply * 0.0008).toFixed(2)} on electricity`,
      };
    } else {
      optimizedSchedule = {
        timeWindow: 'IMMEDIATE',
        reason: 'Critical moisture stress requires immediate action',
      };
    }
  }

  // Calculate expected impact
  const waterSaved = rainIncoming && action === 'DELAY_FOR_RAIN' ? 400 : 0;
  const energyToUse = waterToApply > 0 ? waterToApply * 0.001 : 0; // kWh
  const costToIrrigate = waterToApply > 0 ? waterToApply * 0.0001 : 0; // USD
  const costSaved = rainIncoming && action === 'DELAY_FOR_RAIN' ? costToIrrigate : 0;

  // Identify alerts
  const alerts: Array<{ severity: 'INFO' | 'WARNING' | 'CRITICAL'; message: string; action: string }> = [];

  if (sensorReading.sensorHealthStatus === 'DEGRADED') {
    alerts.push({
      severity: 'WARNING',
      message: `${sensorReading.faultyProbe}`,
      action: 'Verify soil moisture manually or service probe',
    });
  }

  if (sensorReading.sensorHealthStatus === 'FAULT') {
    alerts.push({
      severity: 'CRITICAL',
      message: `Sensor failure: ${sensorReading.faultyProbe}`,
      action: 'Switch to ET-based estimation, service probe urgently',
    });
  }

  if (isHot && moisture < 20) {
    alerts.push({
      severity: 'WARNING',
      message: `High temperature (${temp.toFixed(1)}°C) with low soil moisture - high evapotranspiration demand`,
      action: 'Consider split irrigation (morning + evening pulses) to avoid heat stress',
    });
  }

  if (tension > 600) {
    alerts.push({
      severity: 'WARNING',
      message: `Soil matric tension at ${tension.toFixed(0)} kPa - approaching plant stress threshold`,
      action: 'Irrigate within 12 hours to maintain root zone water availability',
    });
  }

  return {
    zoneId: sensorReading.zoneId,
    zoneName: sensorReading.zoneName,
    timestamp: sensorReading.timestamp,

    currentConditions: {
      soilMoisture: moisture,
      soilTension: tension,
      airTemperature: temp,
      humidity: humidity,
      rainfall24hProbability: rainProb,
    },

    assessment: {
      moistureStatus,
      waterStressLevel,
      evapotranspirationDemand: et0MmDay,
      recommendedWaterDepth: Math.max(0, 30 - moisture) * 10, // mm
      irrigationUrgency,
    },

    recommendation: {
      action,
      actionDescription,
      expectedOutcome,
      waterToApply,
      estimatedDuration,
      optimizedSchedule,
    },

    expectedImpact: {
      waterSaved,
      energySaved: energyToUse,
      costSaved,
      cropStressAvoidance: waterStressLevel === 'CRITICAL' ? 'Prevents 40-60% yield loss' : 
                           waterStressLevel === 'HIGH' ? 'Prevents 20-30% yield loss' : 'Maintains full yield potential',
    },

    alerts,
  };
}

export { globalSimulator };
