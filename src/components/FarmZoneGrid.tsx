import React from 'react';
import { Sprout, Droplet, Gauge, Flame, AlertCircle, Play, CheckCircle2, PauseCircle, Compass } from 'lucide-react';
import { FarmZone } from '../types';

interface FarmZoneGridProps {
  zones: FarmZone[];
  selectedZoneId: number;
  onSelectZone: (id: number) => void;
  onToggleZoneValve: (id: number) => void;
}

export const FarmZoneGrid: React.FC<FarmZoneGridProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
  onToggleZoneValve,
}) => {
  return (
    <div className="bg-[#12141A] border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Compass className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Farm Sectors & Actuator Relays</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-mono">
            Autonomous multi-zone valve regulation & phenological tracking
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg text-xs font-mono text-emerald-400 font-semibold">
          {zones.filter((z) => z.valveStatus === 'IRRIGATING').length} Valves Open
        </div>
      </div>

      {/* Grid of Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone) => {
          const isSelected = zone.id === selectedZoneId;
          const isIrrigating = zone.valveStatus === 'IRRIGATING';
          const isDeficit = zone.currentVwc < zone.madThreshold;
          const moisturePercentage = Math.round(
            ((zone.currentVwc - zone.wiltingPoint) / (zone.fieldCapacity - zone.wiltingPoint)) * 100
          );

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              className={`relative rounded-xl border p-4 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'bg-[#141822] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/50'
                  : 'bg-[#0F1117] border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              {/* Animated Irrigation Spray Effect if Active */}
              {isIrrigating && (
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-blue-500/10 rounded-xl pointer-events-none animate-pulse" />
              )}

              {/* Card Header: Zone Name, Crop, Valve Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${
                      zone.cropType.includes('Almond')
                        ? 'bg-amber-600'
                        : zone.cropType.includes('Corn')
                        ? 'bg-yellow-600'
                        : zone.cropType.includes('Tomato')
                        ? 'bg-red-600'
                        : 'bg-indigo-600'
                    }`}
                  >
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {zone.name}
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.8)]" title="Focused Zone" />
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {zone.cropType} • {zone.areaHectares} ha • {zone.soilType}
                    </p>
                  </div>
                </div>

                {/* Valve Status Badge */}
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                    isIrrigating
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                      : zone.valveStatus === 'ALERT'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isIrrigating ? 'bg-emerald-400' : zone.valveStatus === 'ALERT' ? 'bg-rose-400' : 'bg-slate-500'
                    }`}
                  />
                  {zone.valveStatus}
                </span>
              </div>

              {/* Phenology / Growth Stage */}
              <div className="mb-3 p-2.5 rounded-lg bg-black/40 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 uppercase text-[10px] font-bold">Phenology Stage</span>
                <span className="font-semibold text-emerald-400">{zone.currentStage}</span>
              </div>

              {/* Moisture Bar Gauge */}
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-blue-400" /> VWC:
                    <strong className="text-white">{zone.currentVwc}%</strong>
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" /> Tension:
                    <strong className="text-white">{zone.soilTensionKpa} kPa</strong>
                  </span>
                </div>

                {/* Custom Track with FC, MAD, WP lines */}
                <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                  {/* Fill */}
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDeficit ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(8, moisturePercentage))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>WP ({zone.wiltingPoint}%)</span>
                  <span className="text-amber-400/90 font-semibold">MAD ({zone.madThreshold}%)</span>
                  <span>FC ({zone.fieldCapacity}%)</span>
                </div>
              </div>

              {/* Footer Metrics & Valve Override Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <div className="text-[11px] text-slate-500 font-mono">
                  <span>Flow: {zone.flowRateLpm} L/min</span>
                  <span className="mx-2">•</span>
                  <span>Kc: {zone.targetKc}</span>
                </div>

                <button
                  id={`btn-valve-${zone.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleZoneValve(zone.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
                    isIrrigating
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  }`}
                >
                  {isIrrigating ? (
                    <>
                      <PauseCircle className="w-3.5 h-3.5" /> Stop Valve
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Pulse Valve
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
