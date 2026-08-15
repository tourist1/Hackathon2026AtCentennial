import React from 'react';
import { Droplets, Activity, Cpu, Sparkles, MapPin, Play, Pause, RotateCcw, Presentation } from 'lucide-react';
import { LocationPreset, FARM_LOCATION_PRESETS } from '../data/mockFarmData';

interface NavbarProps {
  currentLocation: LocationPreset;
  onSelectLocation: (loc: LocationPreset) => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onOpenPitch: () => void;
  onOpenHardware: () => void;
  activeAgentsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  onSelectLocation,
  isRunning,
  onTogglePlay,
  onReset,
  onOpenPitch,
  onOpenHardware,
  activeAgentsCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0A0B0E]/95 backdrop-blur-md text-slate-300 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Logo matching Elegant Dark */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Droplets className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                AgriFlow <span className="text-emerald-500 underline decoration-2 underline-offset-4">AI</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                Multi-Agent OS
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest font-mono mt-0.5">
              Autonomous Irrigation & Resource Orchestration
            </p>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Location Selector */}
          <div className="flex items-center bg-[#12141A] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-700 transition">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
            <select
              aria-label="Select farm location"
              value={currentLocation.id}
              onChange={(e) => {
                const found = FARM_LOCATION_PRESETS.find((p) => p.id === e.target.value);
                if (found) onSelectLocation(found);
              }}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
            >
              {FARM_LOCATION_PRESETS.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-[#12141A] text-slate-200">
                  {loc.name} ({loc.country})
                </option>
              ))}
            </select>
          </div>

          {/* Engine Status / Agent Pulse in Elegant Dark style */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full bg-emerald-500 ${isRunning ? 'animate-pulse' : 'opacity-40'}`} />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {isRunning ? 'System Active' : 'System Paused'}
            </span>
          </div>

          {/* Simulation Toggle */}
          <button
            id="btn-simulation-toggle"
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              isRunning
                ? 'bg-[#12141A] text-amber-300 border-amber-500/30 hover:bg-amber-950/20'
                : 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 hover:bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Loop
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Start Auto-Loop
              </>
            )}
          </button>

          {/* Reset button */}
          <button
            id="btn-simulation-reset"
            onClick={onReset}
            title="Reset Simulation State"
            className="p-2 text-slate-400 hover:text-white bg-[#12141A] border border-slate-800 rounded-lg hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Hardware Serial Modal Button */}
          <button
            id="btn-hardware-modal"
            onClick={onOpenHardware}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#12141A] border border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Hardware Relay Prop</span>
          </button>

          {/* Pitch Deck Button */}
          <button
            id="btn-pitch-modal"
            onClick={onOpenPitch}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400"
          >
            <Presentation className="w-3.5 h-3.5 text-slate-950" />
            <span>Pitch Deck</span>
          </button>
        </div>
      </div>
    </header>
  );
};
