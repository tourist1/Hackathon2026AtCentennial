import React from 'react';
import { Droplets, DollarSign, Leaf, Zap, Award, ArrowUpRight, TrendingDown } from 'lucide-react';
import { SustainabilityMetrics } from '../types';

interface SustainabilityImpactCardProps {
  metrics: SustainabilityMetrics;
}

export const SustainabilityImpactCard: React.FC<SustainabilityImpactCardProps> = ({ metrics }) => {
  const gallonsSaved = Math.round(metrics.totalWaterSavedLiters * 0.264172);

  return (
    <div className="bg-[#12141A] border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Sustainability & Resource Conservation ROI
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-mono">
            Autonomous dynamic scheduling vs conventional timer waste
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
          <span>WUE Score: {metrics.wueScore}%</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 4 Hero Counters matching Elegant Dark */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Water Saved */}
        <div className="p-4 rounded-lg bg-[#0F1117] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold mb-2">
            <span>Water Conserved</span>
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-blue-400 font-mono">
              {metrics.totalWaterSavedLiters.toLocaleString()} <span className="text-xs font-normal">L</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              ~{gallonsSaved.toLocaleString()} gal (38% reduction)
            </div>
          </div>
        </div>

        {/* Energy Cost Saved */}
        <div className="p-4 rounded-lg bg-[#0F1117] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold mb-2">
            <span>Energy Bill Savings</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
              ${metrics.totalEnergySavedDollars.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              {metrics.offPeakPumpPct}% pumped at off-peak tariff
            </div>
          </div>
        </div>

        {/* Nitrate Leaching Prevented */}
        <div className="p-4 rounded-lg bg-[#0F1117] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold mb-2">
            <span>Runoff & Leaching</span>
            <Leaf className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-teal-400 font-mono">
              +{metrics.nitrateLeachingPreventedPct}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Zero water lost below root depth
            </div>
          </div>
        </div>

        {/* Carbon Offset */}
        <div className="p-4 rounded-lg bg-[#0F1117] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold mb-2">
            <span>CO₂e Avoided</span>
            <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">
              {metrics.co2OffsetKg.toFixed(1)} <span className="text-xs font-normal">kg</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Reduced grid pumping emissions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
