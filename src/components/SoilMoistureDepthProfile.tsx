import React from 'react';
import { Layers, AlertTriangle, CheckCircle2, Waves, ArrowDown } from 'lucide-react';
import { FarmZone } from '../types';

interface SoilMoistureDepthProfileProps {
  zone: FarmZone;
}

export const SoilMoistureDepthProfile: React.FC<SoilMoistureDepthProfileProps> = ({ zone }) => {
  // Check deep drainage leaching risk (if deepest layer > field capacity while irrigating)
  const deepestLayer = zone.layers[zone.layers.length - 1];
  const isDeepLeaching = deepestLayer && deepestLayer.vwc > zone.fieldCapacity - 2;

  return (
    <div className="bg-[#12141A] border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Root Zone Soil Strata</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-mono">
            {zone.name} • Effective Root Depth: {zone.rootDepthCm}cm
          </p>
        </div>

        {/* Leaching Guardrail Status */}
        <div
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 ${
            isDeepLeaching
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}
        >
          {isDeepLeaching ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Deep Leaching Risk
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Optimal Retention
            </>
          )}
        </div>
      </div>

      {/* Layered Soil Depth Visualization */}
      <div className="space-y-2.5">
        {zone.layers.map((layer, idx) => {
          const isRootLayer = layer.depthCm <= zone.rootDepthCm;
          const fillWidth = Math.min(100, Math.max(10, ((layer.vwc - 5) / 35) * 100));
          const isDry = layer.vwc < zone.madThreshold;

          return (
            <div
              key={layer.depthCm}
              className={`p-3 rounded-lg border transition-all ${
                isRootLayer
                  ? 'bg-[#0F1117] border-slate-800'
                  : 'bg-black/30 border-slate-850 opacity-75'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">
                    Depth: {layer.depthCm} cm
                  </span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                      idx === 0
                        ? 'bg-amber-900/40 text-amber-300 border border-amber-700/40'
                        : isRootLayer
                        ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40'
                        : 'bg-blue-900/40 text-blue-300 border border-blue-700/40'
                    }`}
                  >
                    {idx === 0 ? 'Topsoil Layer' : isRootLayer ? 'Active Root Zone' : 'Subsoil Drainage'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <span>
                    VWC: <strong className={isDry ? 'text-amber-400' : 'text-emerald-400'}>{layer.vwc}%</strong>
                  </span>
                  <span>
                    Tension: <strong className="text-slate-200">{layer.tensionKpa} kPa</strong>
                  </span>
                  <span className="text-slate-500">{layer.tempC}°C</span>
                </div>
              </div>

              {/* Moisture Bar */}
              <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    layer.vwc > zone.fieldCapacity
                      ? 'bg-blue-400'
                      : isDry
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${fillWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Agronomic Guide Legend */}
      <div className="mt-4 p-3 rounded-lg bg-black/40 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-mono uppercase">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Stress (&lt;{zone.madThreshold}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Optimal Available Water</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>Field Capacity ({zone.fieldCapacity}%)</span>
        </div>
      </div>
    </div>
  );
};
