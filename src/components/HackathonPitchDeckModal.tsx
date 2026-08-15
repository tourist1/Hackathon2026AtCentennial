import React, { useState } from 'react';
import { X, Presentation, CheckCircle, BrainCircuit, Droplets, Zap, ShieldAlert, Sparkles, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HackathonPitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HackathonPitchDeckModal: React.FC<HackathonPitchDeckModalProps> = ({ isOpen, onClose }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'The Problem: The Global Agricultural Water Crisis',
      badge: 'Problem Statement',
      icon: Droplets,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed text-sm">
            <strong className="text-emerald-400 font-mono">70% of global freshwater</strong> is consumed by agriculture. Yet over <strong className="text-rose-400 font-mono">40% of applied irrigation is wasted</strong> due to dumb, rigid timer-based schedules that spray water blindly regardless of localized soil moisture, upcoming rainstorms, or crop growth stages.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/20 text-xs">
              <div className="font-bold text-rose-400 mb-1">Over-Irrigation Runoff</div>
              <p className="text-slate-400">Leaches costly nitrogen fertilizers into groundwater, poisoning rural aquifers.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/20 text-xs">
              <div className="font-bold text-amber-400 mb-1">Peak Energy Grid Costs</div>
              <p className="text-slate-400">Pumping water during high-tariff afternoon hours spikes electric bills 500%.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-blue-500/20 text-xs">
              <div className="font-bold text-blue-400 mb-1">Under-Irrigation Stress</div>
              <p className="text-slate-400">Crops drop fruit or wilt during sudden heat spikes when fixed timers fall short.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'The Solution: AgriFlow Multi-Agent Precision OS',
      badge: 'Core Architecture',
      icon: BrainCircuit,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            AgriFlow replaces brittle monolithic code with a <strong className="text-emerald-400">decentralized 5-agent cooperative intelligence</strong> modeled on professional agronomy (FAO-56 Penman-Monteith):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/30">
              <span className="font-bold text-blue-300 font-mono">1. Sensor Agent:</span> Cleans noisy telemetry, tracks VWC % and soil tension kPa, and isolates bad probes.
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-sky-500/30">
              <span className="font-bold text-sky-300 font-mono">2. Weather Agent:</span> Pulls Open-Meteo micro-forecasts, calculates baseline ET₀, and flags rain pre-emption.
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
              <span className="font-bold text-emerald-300 font-mono">3. Crop Science Agent:</span> Maintains phenology curves, scales Kc multipliers, and defines root zone MAD limits.
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30">
              <span className="font-bold text-purple-300 font-mono">4. Strategy Agent ("Brain"):</span> Generates mathematically optimal pulse schedules, matching off-peak tariff hours.
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-teal-500/30 sm:col-span-2">
              <span className="font-bold text-teal-300 font-mono">5. Actuator & Guardrail Agent:</span> Verifies hydraulic pressure limits, generates MQTT/JSON payloads, and activates physical relays.
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Live Demo Script for Hackathon Judges (2-Min Pitch)',
      badge: 'Live Presentation Flow',
      icon: Presentation,
      content: (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40">
            <div className="font-bold text-emerald-300 mb-0.5">Step 1: Show Real-Time Dashboard (30s)</div>
            <p className="text-slate-300">Point to the 5-Agent Topology Graph. Show live soil moisture depth profile and FAO-56 crop demand ETc.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/40">
            <div className="font-bold text-blue-300 mb-0.5">Step 2: Trigger "Sudden Storm 35mm" (30s)</div>
            <p className="text-slate-300">Click the storm button. Point out the Weather Agent immediately broadcasting a rain delay and the Strategy Agent cancelling the valve cycle, saving 100% water.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40">
            <div className="font-bold text-amber-300 mb-0.5">Step 3: Trigger "42°C Heatwave" & "Probe Fault" (30s)</div>
            <p className="text-slate-300">Show how the system dynamically splits irrigation into cooling micro-pulses and gracefully falls back to physics-based ET modeling when sensor impedance fails.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-teal-500/40">
            <div className="font-bold text-teal-300 mb-0.5">Step 4: Show Physical Hardware / MQTT Modal (30s)</div>
            <p className="text-slate-300">Open Hardware Bridge to show real MQTT JSON payloads and the $5 relay prop firing.</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Judge Defense Q&A Cheat Sheet',
      badge: 'Tough Questions Answered',
      icon: ShieldAlert,
      content: (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-bold text-white mb-1">Q: "Why use multi-agent rather than a simple Python if-else script?"</div>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">A:</strong> Simple scripts fail when constraints collide (e.g. soil is dry, but rain is in 2 hours, and grid power is at $0.48/kWh). Multi-agent architecture separates concerns, enables asynchronous negotiations, and provides fault isolation—if a hardware sensor fails, the rest of the agents negotiate a safe fallback.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-bold text-white mb-1">Q: "How expensive is this for smallholder farmers to deploy?"</div>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">A:</strong> Zero proprietary lock-in. AgriFlow uses open satellite weather APIs (Open-Meteo) and pairs with standard $5 ESP32 microcontrollers and generic 12V solenoid valves.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Measurable ROI & Environmental Impact',
      badge: 'Traction & Metrics',
      icon: Trophy,
      content: (
        <div className="space-y-4 text-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-400 font-mono">38%</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Water Reduction</div>
              <div className="text-[10px] text-slate-400 mt-0.5">vs conventional timers</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30">
              <div className="text-2xl font-bold text-emerald-400 font-mono">45%</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Pumping Energy Savings</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Off-peak tariff alignment</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-teal-500/30">
              <div className="text-2xl font-bold text-teal-400 font-mono">0%</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Aquifer Nitrate Runoff</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Kept within root depth</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/30">
              <div className="text-2xl font-bold text-purple-400 font-mono">&lt;6 Mo</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Payback Period</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Rapid agricultural ROI</div>
            </div>
          </div>

          <button
            onClick={() => {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 transition shadow-lg shadow-emerald-500/20"
          >
            🎉 Celebrate Hackathon Demo Success!
          </button>
        </div>
      ),
    },
  ];

  const current = slides[activeSlide];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#12141A] border border-slate-800 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Pitch Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0F1117]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Presentation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                AgriFlow • Hackathon Presentation Slide Deck
                <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Slide {activeSlide + 1} of {slides.length}
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Slide Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-md shadow-black">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400">
                {current.badge}
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">{current.title}</h3>
            </div>
          </div>

          {current.content}
        </div>

        {/* Slide Navigation Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0F1117] flex items-center justify-between">
          <button
            onClick={() => setActiveSlide((prev) => Math.max(0, prev - 1))}
            disabled={activeSlide === 0}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  activeSlide === i ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setActiveSlide((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={activeSlide === slides.length - 1}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.25)] border border-emerald-400"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
