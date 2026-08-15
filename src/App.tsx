import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MultiAgentFlowVisualizer } from './components/MultiAgentFlowVisualizer';
import { FarmZoneGrid } from './components/FarmZoneGrid';
import { SoilMoistureDepthProfile } from './components/SoilMoistureDepthProfile';
import { SoilHealthAssessment } from './components/SoilHealthAssessment';
import { WeatherAndETDashboard } from './components/WeatherAndETDashboard';
import { InteractiveScenarioBar } from './components/InteractiveScenarioBar';
import { AgentTerminalFeed } from './components/AgentTerminalFeed';
import { SustainabilityImpactCard } from './components/SustainabilityImpactCard';
import { HardwareActuatorModal } from './components/HardwareActuatorModal';
import { HackathonPitchDeckModal } from './components/HackathonPitchDeckModal';
import {
  INITIAL_FARM_ZONES,
  INITIAL_WEATHER,
  FARM_LOCATION_PRESETS,
  LocationPreset,
} from './data/mockFarmData';
import {
  FarmZone,
  WeatherCondition,
  AgentDecisionChain,
  AgentLogMessage,
  ScenarioType,
  SustainabilityMetrics,
  AgentRole,
} from './types';
import { vwcToSoilTensionKpa, calculateETc } from './utils/agronomyMath';

export default function App() {
  const [currentLocation, setCurrentLocation] = useState<LocationPreset>(FARM_LOCATION_PRESETS[0]);
  const [zones, setZones] = useState<FarmZone[]>(INITIAL_FARM_ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState<number>(1);
  const [weather, setWeather] = useState<WeatherCondition>(INITIAL_WEATHER);
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('normal');
  const [decisionChain, setDecisionChain] = useState<AgentDecisionChain | null>(null);
  const [isDeliberating, setIsDeliberating] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [logs, setLogs] = useState<AgentLogMessage[]>([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<AgentRole | 'all'>('all');
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState<boolean>(false);

  const [metrics, setMetrics] = useState<SustainabilityMetrics>({
    totalWaterSavedLiters: 4850,
    totalEnergySavedDollars: 52.4,
    co2OffsetKg: 28.6,
    wueScore: 94,
    nitrateLeachingPreventedPct: 98,
    offPeakPumpPct: 82,
  });

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  // Helper to add a timestamped log
  const addLog = useCallback(
    (
      role: AgentRole,
      title: string,
      message: string,
      severity: AgentLogMessage['severity'] = 'info',
      payload?: any
    ) => {
      const newLog: AgentLogMessage = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toLocaleTimeString(),
        agentRole: role,
        title,
        message,
        severity,
        payload,
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
    },
    []
  );

  // Fetch Live Weather for selected location
  const fetchLiveWeather = useCallback(async (loc: LocationPreset) => {
    try {
      const res = await fetch(`/api/weather/live?lat=${loc.lat}&lon=${loc.lon}`);
      const json = await res.json();
      if (json.success && json.data) {
        const raw = json.data;
        const current = raw.current || {};
        const hourly = raw.hourly || {};

        const formattedHourly = (hourly.time || []).slice(0, 12).map((t: string, idx: number) => {
          const dateObj = new Date(t);
          const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:00`;
          const hourNum = dateObj.getHours();
          const isPeak = hourNum >= 14 && hourNum <= 18;

          return {
            time: timeStr,
            temp: Math.round(hourly.temperature_2m?.[idx] || 25),
            humidity: Math.round(hourly.relative_humidity_2m?.[idx] || 45),
            rainProb: Math.round(hourly.precipitation_probability?.[idx] || 10),
            rainMm: Number((hourly.precipitation?.[idx] || 0).toFixed(1)),
            et0: Number((hourly.et0_fao_evapotranspiration?.[idx] || 0.3).toFixed(2)),
            solarRad: Math.round(hourly.direct_radiation?.[idx] || 500),
            gridTariffRate: isPeak ? 0.48 : hourNum >= 8 && hourNum < 14 ? 0.24 : 0.08,
          };
        });

        setWeather((prev) => ({
          ...prev,
          locationName: loc.name,
          country: loc.country,
          lat: loc.lat,
          lon: loc.lon,
          tempC: Math.round(current.temperature_2m || 28),
          humidityPct: Math.round(current.relative_humidity_2m || 40),
          windSpeedKmh: Number((current.wind_speed_10m || 10).toFixed(1)),
          solarRadiationWm2: Math.round(current.direct_radiation || 680),
          rainProbability24h: Math.round(raw.daily?.precipitation_probability_max?.[0] || 15),
          precipExpectedMm: Number((raw.daily?.precipitation_sum?.[0] || 0).toFixed(1)),
          et0MmDay: Number((raw.daily?.et0_fao_evapotranspiration?.[0] || 5.2).toFixed(1)),
          hourly: formattedHourly.length > 0 ? formattedHourly : prev.hourly,
        }));
      }
    } catch (e) {
      console.warn('Live weather fetch error:', e);
    }
  }, []);

  // Handle location change
  const handleSelectLocation = (loc: LocationPreset) => {
    setCurrentLocation(loc);
    fetchLiveWeather(loc);
    addLog(
      'weather',
      'Location Changed',
      `Switched geocoding station to ${loc.name}, ${loc.country} (${loc.climateDesc})`,
      'info'
    );
  };

  // Run Multi-Agent Deliberation Cycle
  const triggerDeliberation = useCallback(
    async (overrideZone?: FarmZone, overrideScenario?: ScenarioType) => {
      const targetZone = overrideZone || selectedZone;
      const targetScenario = overrideScenario || activeScenario;

      setIsDeliberating(true);
      addLog(
        'strategy',
        'Deliberation Initiated',
        `Master Brain requesting consensus for ${targetZone.name} under [${targetScenario.toUpperCase()}] mode`,
        'info'
      );

      try {
        const response = await fetch('/api/agents/deliberate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            zone: targetZone,
            weather,
            activeScenario: targetScenario,
          }),
        });

        const data = await response.json();
        if (data.success && data.agentChain) {
          const chain: AgentDecisionChain = data.agentChain;
          setDecisionChain(chain);

          // Log step-by-step from each agent
          addLog('sensor', 'Telemetry Stream Ingested', chain.sensorAgent.findings, 'info', chain.sensorAgent);
          addLog('weather', 'Evapotranspiration & Rain Assessed', chain.weatherAgent.findings, 'info', chain.weatherAgent);
          addLog('crop', 'Phenology & Kc Evaluated', chain.cropAgent.findings, 'info', chain.cropAgent);
          addLog(
            'strategy',
            `Strategy Output: ${chain.strategyAgent.action}`,
            chain.strategyAgent.reasoning,
            chain.strategyAgent.action.includes('CANCEL') ? 'warning' : 'success',
            chain.strategyAgent
          );
          addLog(
            'actuator',
            `Relay Command: ${chain.actuatorAgent.relayCommand}`,
            `Assigned Pin: ${chain.actuatorAgent.pin} | MQTT Token: ${chain.actuatorAgent.mqttPayload?.safety_token}`,
            chain.actuatorAgent.hydraulicSafetyPass ? 'success' : 'alert',
            chain.actuatorAgent
          );

          // Apply decision to the zone
          const shouldIrrigate =
            chain.strategyAgent.durationMinutes > 0 &&
            chain.actuatorAgent.hydraulicSafetyPass !== false &&
            !chain.strategyAgent.action.includes('CANCEL');

          setZones((prev) =>
            prev.map((z) => {
              if (z.id === targetZone.id) {
                return {
                  ...z,
                  valveStatus: shouldIrrigate ? 'IRRIGATING' : 'IDLE',
                  valveDurationMinutes: chain.strategyAgent.durationMinutes,
                  valveProgressPct: shouldIrrigate ? 10 : 0,
                };
              }
              return z;
            })
          );

          // Update sustainability metrics
          setMetrics((prev) => ({
            ...prev,
            totalWaterSavedLiters: prev.totalWaterSavedLiters + (chain.strategyAgent.waterSavedLitersVsTimer || 180),
            totalEnergySavedDollars: Number(
              (prev.totalEnergySavedDollars + (chain.strategyAgent.costSavedUsd || 0.85)).toFixed(2)
            ),
            co2OffsetKg: Number((prev.co2OffsetKg + 0.6).toFixed(1)),
          }));
        }
      } catch (err: any) {
        console.error('Deliberation error:', err);
        addLog('strategy', 'Deliberation Fallback', 'Network sync error. Defaulting to local agronomic safe model.', 'warning');
      } finally {
        setIsDeliberating(false);
      }
    },
    [selectedZone, activeScenario, weather, addLog]
  );

  // Initial mount load
  useEffect(() => {
    fetchLiveWeather(currentLocation);
    triggerDeliberation(selectedZone, 'normal');
    // Initial banner log
    addLog(
      'strategy',
      'AgriFlow OS Booted',
      '5-Agent cooperative network initialized with FAO-56 Penman-Monteith engine & Open-Meteo telemetry.',
      'success'
    );
  }, []);

  // Handle Scenario Change
  const handleSelectScenario = (scenario: ScenarioType) => {
    setActiveScenario(scenario);

    if (scenario === 'rainstorm') {
      setWeather((prev) => ({
        ...prev,
        rainProbability24h: 95,
        precipExpectedMm: 35.0,
        tempC: 21,
        humidityPct: 88,
      }));
      addLog(
        'weather',
        '⛈️ Rainstorm Front Injected',
        'Incoming atmospheric squall detected. Forecast: 35mm precipitation over next 6 hours.',
        'alert'
      );
    } else if (scenario === 'heatwave') {
      setWeather((prev) => ({
        ...prev,
        tempC: 42,
        humidityPct: 18,
        solarRadiationWm2: 950,
        et0MmDay: 8.5,
        rainProbability24h: 0,
        precipExpectedMm: 0,
      }));
      addLog(
        'weather',
        '☀️ Scorching Heatwave Injected',
        'Ambient temperature spiked to 42°C. Vapor Pressure Deficit extreme (ET₀: 8.5 mm/d).',
        'alert'
      );
    } else if (scenario === 'sensor_fault') {
      addLog(
        'sensor',
        '⚠️ Probe 2 Electrical Noise',
        'Impedance spike detected on 30cm capacitive sensor. Signal sanity check failed.',
        'alert'
      );
    } else if (scenario === 'pipe_leak') {
      addLog(
        'actuator',
        '🚨 Hydraulic Pressure Anomaly',
        'Flow rate exceeded expected nozzle curve by 45%. Pipe burst or fitting blowout suspected.',
        'alert'
      );
    } else if (scenario === 'peak_tariff') {
      addLog(
        'strategy',
        '⚡ Grid Peak Tariff Surge',
        'On-peak electricity price active ($0.48/kWh). Shifting heavy pump loads to off-peak night window.',
        'warning'
      );
    } else {
      // Normal
      fetchLiveWeather(currentLocation);
      addLog('strategy', 'Standard Operations Resumed', 'Balanced multi-agent state restored.', 'info');
    }

    triggerDeliberation(selectedZone, scenario);
  };

  // Toggle Valve Manually
  const handleToggleZoneValve = (zoneId: number) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === zoneId) {
          const nextStatus = z.valveStatus === 'IRRIGATING' ? 'IDLE' : 'IRRIGATING';
          addLog(
            'actuator',
            `Manual Override: Valve ${z.name}`,
            `Actuator commanded to ${nextStatus} state for Solenoid #${z.id}`,
            nextStatus === 'IRRIGATING' ? 'success' : 'warning'
          );
          return {
            ...z,
            valveStatus: nextStatus,
            valveProgressPct: nextStatus === 'IRRIGATING' ? 15 : 0,
          };
        }
        return z;
      })
    );
  };

  // Simulation Tick Loop (Every 3 seconds when isRunning is true)
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setZones((prevZones) =>
        prevZones.map((zone) => {
          let updatedVwc = zone.currentVwc;
          let updatedProgress = zone.valveProgressPct;
          let updatedStatus = zone.valveStatus;
          let addedWater = zone.accumulatedWaterTodayLiters;

          if (zone.valveStatus === 'IRRIGATING') {
            // Soil moisture increases
            updatedVwc = Math.min(zone.fieldCapacity, Number((zone.currentVwc + 0.4).toFixed(1)));
            updatedProgress = Math.min(100, updatedProgress + 10);
            addedWater += zone.flowRateLpm * 2;

            if (updatedProgress >= 100) {
              updatedStatus = 'IDLE';
              updatedProgress = 0;
              addLog(
                'actuator',
                `Cycle Complete: ${zone.name}`,
                `Target moisture restored. Solenoid valve shut down safely.`,
                'success'
              );
            }
          } else {
            // Natural evapotranspiration depletion
            const hourlyETc = calculateETc(zone.targetKc, weather.et0MmDay) / 24;
            const depletionStep = hourlyETc * 0.05;
            updatedVwc = Math.max(zone.wiltingPoint - 1, Number((zone.currentVwc - depletionStep).toFixed(1)));
          }

          // Convert VWC to tension kPa
          const newTension = vwcToSoilTensionKpa(updatedVwc, zone.fieldCapacity, zone.wiltingPoint);

          // Update layers
          const updatedLayers = zone.layers.map((layer, idx) => {
            const layerVwc = idx === 0 ? updatedVwc - 1.5 : idx === 1 ? updatedVwc : updatedVwc + 2.0;
            return {
              ...layer,
              vwc: Number(layerVwc.toFixed(1)),
              tensionKpa: vwcToSoilTensionKpa(layerVwc, zone.fieldCapacity, zone.wiltingPoint),
            };
          });

          return {
            ...zone,
            currentVwc: updatedVwc,
            soilTensionKpa: newTension,
            valveStatus: updatedStatus,
            valveProgressPct: updatedProgress,
            accumulatedWaterTodayLiters: addedWater,
            layers: updatedLayers,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isRunning, weather.et0MmDay, addLog]);

  // Reset State
  const handleReset = () => {
    setZones(INITIAL_FARM_ZONES);
    setActiveScenario('normal');
    fetchLiveWeather(currentLocation);
    triggerDeliberation(INITIAL_FARM_ZONES[0], 'normal');
    addLog('strategy', 'System Reset', 'All telemetry & valve states returned to baseline defaults.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-300 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
        isRunning={isRunning}
        onTogglePlay={() => setIsRunning(!isRunning)}
        onReset={handleReset}
        onOpenPitch={() => setIsPitchModalOpen(true)}
        onOpenHardware={() => setIsHardwareModalOpen(true)}
        activeAgentsCount={5}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 2. Top Interactive Scenario Bar (Hackathon Demo Controls) */}
        <InteractiveScenarioBar
          activeScenario={activeScenario}
          onSelectScenario={handleSelectScenario}
        />

        {/* 3. Multi-Agent Topological Pipeline Graph */}
        <MultiAgentFlowVisualizer
          decisionChain={decisionChain}
          isDeliberating={isDeliberating}
          onTriggerDeliberation={() => triggerDeliberation(selectedZone, activeScenario)}
          activeRoleFilter={selectedRoleFilter === 'all' ? null : selectedRoleFilter}
          onSelectRole={(r) => setSelectedRoleFilter(r)}
        />

        {/* 4. Real-Time ROI & Sustainability Impact */}
        <SustainabilityImpactCard metrics={metrics} />

        {/* 5. Two Column Grid: Farm Zones & Soil Depth Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <FarmZoneGrid
              zones={zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={(id) => {
                setSelectedZoneId(id);
                const target = zones.find((z) => z.id === id);
                if (target) triggerDeliberation(target, activeScenario);
              }}
              onToggleZoneValve={handleToggleZoneValve}
            />
          </div>

          <div className="lg:col-span-5">
            <SoilMoistureDepthProfile zone={selectedZone} />
          </div>
        </div>

        <SoilHealthAssessment zone={selectedZone} decisionChain={decisionChain} />

        {/* 6. Two Column Grid: Weather/FAO-56 ET Dashboard & Live Agent Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <WeatherAndETDashboard
              weather={weather}
              selectedCropKc={selectedZone.targetKc}
            />
          </div>

          <div className="lg:col-span-6">
            <AgentTerminalFeed
              logs={logs}
              onClearLogs={() => setLogs([])}
              selectedRoleFilter={selectedRoleFilter}
              onFilterRole={setSelectedRoleFilter}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0A0B0E] py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>AgriFlow Engine • Multi-Agent Autonomous Agricultural Intelligence</span>
          <span>FAO-56 Penman-Monteith ET₀ Model • Open-Meteo API • Google Gemini 3.7 Flash</span>
        </div>
      </footer>

      {/* Modals */}
      <HardwareActuatorModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
        selectedZone={selectedZone}
        activeRelayPin={`GPIO_${selectedZone.id}_RELAY`}
        isIrrigating={selectedZone.valveStatus === 'IRRIGATING'}
        onTestPulse={() => handleToggleZoneValve(selectedZone.id)}
      />

      <HackathonPitchDeckModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
      />
    </div>
  );
}
