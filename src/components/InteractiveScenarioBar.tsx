import React from 'react';
import { CloudLightning, Flame, AlertOctagon, Wrench, Zap, Sprout, Check } from 'lucide-react';
import { ScenarioType } from '../types';

interface InteractiveScenarioBarProps {
  activeScenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType) => void;
}

export const InteractiveScenarioBar: React.FC<InteractiveScenarioBarProps> = ({
  activeScenario,
  onSelectScenario,
}) => {
  const scenarios: {
    id: ScenarioType;
    label: string;
    icon: React.ElementType;
    desc: string;
    badge: string;
    color: string;
  }[] = [
    {
      id: 'normal',
      label: 'Normal Operation',
      icon: Check,
      desc: 'Baseline multi-agent equilibrium',
      badge: 'FAO-56 Baseline',
      color: 'border-slate-700 hover:border-slate-500',
    },
    {
      id: 'rainstorm',
      label: 'Torrential Storm (35mm)',
      icon: CloudLightning,
      desc: 'Weather Agent triggers rain delay cancel',
      badge: '100% Water Saved',
      color: 'border-blue-500/50 hover:border-blue-400',
    },
    {
      id: 'heatwave',
      label: '42°C Scorching Heatwave',
      icon: Flame,
      desc: 'Crop Agent triggers split micro-pulses',
      badge: 'Thermal Stress Shield',
      color: 'border-amber-500/50 hover:border-amber-400',
    },
    {
      id: 'sensor_fault',
      label: 'Probe Impedance Fault',
      icon: AlertOctagon,
      desc: 'Sensor Agent flags noise, falls back to ET model',
      badge: 'Fail-Safe Fallback',
      color: 'border-rose-500/50 hover:border-rose-400',
    },
    {
      id: 'pipe_leak',
      label: 'Hydraulic Pressure Drop',
      icon: Wrench,
      desc: 'Actuator Guardrail triggers safety cutoff',
      badge: 'Emergency Shutoff',
      color: 'border-red-500/50 hover:border-red-400',
    },
    {
      id: 'peak_tariff',
      label: 'Grid Tariff Peak ($0.48/kWh)',
      icon: Zap,
      desc: 'Strategy Agent shifts pump to off-peak hour',
      badge: '65% Cost Cut',
      color: 'border-purple-500/50 hover:border-purple-400',
    },
  ];

  return (
    <div className="bg-[#12141A] border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CloudLightning className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Edge-Case Simulation Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-mono">
            Live multi-agent cooperative network perturbation triggers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {scenarios.map((sc) => {
          const isActive = activeScenario === sc.id;
          const Icon = sc.icon;

          return (
            <button
              key={sc.id}
              id={`btn-scenario-${sc.id}`}
              onClick={() => onSelectScenario(sc.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-[#161B22] border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/40'
                  : 'bg-[#0F1117] border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    {sc.badge}
                  </span>
                </div>
                <div className="text-xs font-bold text-white mb-1 tracking-tight">{sc.label}</div>
              </div>
              <div className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">{sc.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
