import React from 'react';
import { Sun, CloudRain, Wind, Droplets, Zap, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { WeatherCondition } from '../types';

interface WeatherAndETDashboardProps {
  weather: WeatherCondition;
  selectedCropKc: number;
}

export const WeatherAndETDashboard: React.FC<WeatherAndETDashboardProps> = ({
  weather,
  selectedCropKc,
}) => {
  const dailyETc = Number((weather.et0MmDay * selectedCropKc).toFixed(2));

  return (
    <div className="bg-[#12141A] border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sun className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Micro-Climate & FAO-56 Evapotranspiration</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-mono">
            Atmospheric demand telemetry via Open-Meteo & Penman-Monteith model
          </p>
        </div>

        {/* Live Rain Pre-emption Badge */}
        <div
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 ${
            weather.rainProbability24h > 50
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5 text-blue-400" />
          <span>24h Rain Prob: {weather.rainProbability24h}% ({weather.precipExpectedMm}mm)</span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Temp */}
        <div className="p-3.5 rounded-lg bg-[#0F1117] border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold mb-1">
            <span>Air Temp</span>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{weather.tempC}°C</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Humidity: {weather.humidityPct}%</div>
        </div>

        {/* Solar Radiation */}
        <div className="p-3.5 rounded-lg bg-[#0F1117] border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold mb-1">
            <span>Solar Rad</span>
            <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{weather.solarRadiationWm2} W/m²</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">High Photoperiod</div>
        </div>

        {/* Reference ET0 */}
        <div className="p-3.5 rounded-lg bg-[#0F1117] border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold mb-1">
            <span>Reference ET₀</span>
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-blue-400 font-mono">{weather.et0MmDay} mm/d</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Baseline Grass Evap</div>
        </div>

        {/* Crop Demand ETc */}
        <div className="p-3.5 rounded-lg bg-[#0F1117] border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold mb-1">
            <span>Crop ETc (Kc × ET₀)</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">{dailyETc} mm/d</div>
          <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">Target Demand (Kc={selectedCropKc})</div>
        </div>
      </div>

      {/* Hourly Timeline with Tariff & ET0 demand */}
      <div className="p-3.5 rounded-lg bg-black/40 border border-slate-800">
        <div className="flex items-center justify-between mb-2.5 text-xs font-mono">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Hourly Grid Tariff & Solar Evaporative Curve
          </span>
          <span className="text-[10px] text-slate-500 uppercase">Peak Tariff ($0.48/kWh) vs Off-Peak ($0.08/kWh)</span>
        </div>

        {/* Timeline Horizontal Scroll */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 text-center">
          {weather.hourly.map((h, i) => {
            const isPeak = h.gridTariffRate >= 0.35;
            const hasRain = h.rainProb >= 40;

            return (
              <div
                key={i}
                className={`p-1.5 rounded-lg border text-[10px] font-mono transition-all ${
                  hasRain
                    ? 'bg-blue-950/50 border-blue-600/60 text-blue-200'
                    : isPeak
                    ? 'bg-rose-950/30 border-rose-700/50 text-rose-300'
                    : 'bg-[#0F1117] border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-bold">{h.time}</div>
                <div className="text-slate-400 my-0.5">{h.temp}°</div>
                <div
                  className={`text-[9px] font-semibold px-1 py-0.2 rounded mt-1 ${
                    isPeak ? 'bg-rose-900/60 text-rose-200' : 'bg-emerald-900/40 text-emerald-300'
                  }`}
                >
                  ${h.gridTariffRate}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
