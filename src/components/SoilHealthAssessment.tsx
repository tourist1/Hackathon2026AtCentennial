import React from 'react';
import { AlertTriangle, Beaker, Bug, CircleGauge, Sprout, TestTube2, Waves } from 'lucide-react';
import { AgentDecisionChain, FarmZone } from '../types';

interface SoilHealthAssessmentProps {
  zone: FarmZone;
  decisionChain: AgentDecisionChain | null;
}

export const SoilHealthAssessment: React.FC<SoilHealthAssessmentProps> = ({ zone, decisionChain }) => {
  const assessment = decisionChain?.soilHealthAssessment;
  const impact = decisionChain?.cropImpact;
  const actions = decisionChain?.recommendedActions || [];

  const cards = assessment
    ? [
        { label: 'Texture', value: assessment.texture.value, detail: assessment.texture.finding, icon: Waves },
        { label: 'pH', value: `${assessment.ph.value} · ${assessment.ph.status}`, detail: assessment.ph.finding, icon: TestTube2 },
        { label: 'EC / Sodium Risk', value: `${assessment.salinitySodicity.ecDsM} dS/m · SAR ${assessment.salinitySodicity.sar}`, detail: assessment.salinitySodicity.finding, icon: Beaker },
        { label: 'Nutrients', value: assessment.nutrientAvailability.status, detail: assessment.nutrientAvailability.finding, icon: Sprout },
        { label: 'Moisture & Drainage', value: assessment.moistureDrainage.status, detail: assessment.moistureDrainage.finding, icon: Waves },
        { label: 'Organic Matter & Microbes', value: assessment.organicMatterMicrobes.status, detail: assessment.organicMatterMicrobes.finding, icon: Bug },
        { label: 'Compaction & Aeration', value: assessment.compactionAeration.status, detail: assessment.compactionAeration.finding, icon: CircleGauge },
      ]
    : [];

  return (
    <section className="bg-[#12141A] border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Soil Health & Crop Impact</h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-mono">{zone.name} · interpreted from demo soil telemetry and the latest decision cycle</p>
        </div>
        <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold ${assessment?.overallStatus === 'HEALTHY' ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-300 border-amber-500/30 bg-amber-500/10'}`}>
          {assessment ? assessment.overallStatus : 'AWAITING ANALYSIS'}
        </span>
      </div>

      {!assessment ? (
        <p className="text-sm text-slate-400">Run an agent consensus cycle to generate the full soil-health assessment.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {cards.map(({ label, value, detail, icon: Icon }) => (
              <div key={label} className="rounded-lg bg-black/35 border border-slate-800 p-3">
                <div className="flex items-center gap-2 text-emerald-400"><Icon className="w-3.5 h-3.5" /><span className="text-[10px] font-mono uppercase">{label}</span></div>
                <p className="mt-1.5 text-xs font-semibold text-slate-200">{value}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-800 bg-black/35 p-3">
              <div className="flex items-center gap-2 text-amber-300"><AlertTriangle className="w-3.5 h-3.5" /><span className="text-[10px] font-mono uppercase">Crop impact · {impact?.risk || 'UNKNOWN'} risk</span></div>
              <p className="mt-2 text-xs text-slate-200">{impact?.summary}</p>
              <ul className="mt-2 space-y-1 text-[11px] text-slate-400">{impact?.impacts.map((item) => <li key={item}>• {item}</li>)}</ul>
            </div>
            <div className="rounded-lg border border-slate-800 bg-black/35 p-3">
              <span className="text-[10px] font-mono uppercase text-emerald-300">Recommended actions</span>
              <ul className="mt-2 space-y-2">{actions.map((item) => <li key={`${item.priority}-${item.action}`} className="text-[11px]"><span className="mr-1.5 rounded border border-slate-700 px-1 py-0.5 text-[9px] font-mono text-amber-300">{item.priority}</span><span className="text-slate-200">{item.action}</span><p className="mt-1 text-slate-500">{item.reason}</p></li>)}</ul>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-slate-500">Sodium is shown as a salinity/sodicity risk indicator, not a crop requirement. Confirm amendment, fertilizer, and leaching decisions with calibrated sensors and a laboratory soil test.</p>
        </>
      )}
    </section>
  );
};
