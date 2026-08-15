import React from 'react';
import { Activity, CloudRain, Sprout, BrainCircuit, ShieldCheck, ArrowRight, Zap, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AgentDecisionChain, AgentRole } from '../types';

interface MultiAgentFlowVisualizerProps {
  decisionChain: AgentDecisionChain | null;
  isDeliberating: boolean;
  onTriggerDeliberation: () => void;
  activeRoleFilter?: AgentRole | null;
  onSelectRole?: (role: AgentRole) => void;
}

export const MultiAgentFlowVisualizer: React.FC<MultiAgentFlowVisualizerProps> = ({
  decisionChain,
  isDeliberating,
  onTriggerDeliberation,
  activeRoleFilter,
  onSelectRole,
}) => {
  const agents = [
    {
      id: 'sensor' as AgentRole,
      title: 'Sensor Agent',
      role: 'Telemetry Ingestion',
      icon: Activity,
      color: 'from-blue-600 to-cyan-500',
      borderColor: 'border-blue-500/40',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      glow: 'shadow-blue-500/20',
      status: decisionChain?.sensorAgent.status || 'INGESTING',
      confidence: decisionChain?.sensorAgent.confidence ? Math.round(decisionChain.sensorAgent.confidence * 100) : 98,
      keyMetric: decisionChain?.sensorAgent.findings || 'VWC 23.1% | Tension 58 kPa (Stable)',
    },
    {
      id: 'weather' as AgentRole,
      title: 'Weather Agent',
      role: 'Micro-Climate Forecast',
      icon: CloudRain,
      color: 'from-sky-600 to-indigo-500',
      borderColor: 'border-sky-500/40',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      glow: 'shadow-sky-500/20',
      status: decisionChain?.weatherAgent.status || 'MONITORING',
      confidence: 95,
      keyMetric: `ET₀: ${decisionChain?.weatherAgent.et0MmDay || 5.4} mm/d | Rain Delay: ${
        Math.round((decisionChain?.weatherAgent.rainDelayFactor || 0.05) * 100)
      }%`,
    },
    {
      id: 'crop' as AgentRole,
      title: 'Crop Science Agent',
      role: 'FAO-56 Phenology',
      icon: Sprout,
      color: 'from-emerald-600 to-green-500',
      borderColor: 'border-emerald-500/40',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      glow: 'shadow-emerald-500/20',
      status: 'OPTIMIZING',
      confidence: 99,
      keyMetric: `Crop: ${decisionChain?.cropAgent.crop || 'Almonds'} | Kc: ${decisionChain?.cropAgent.kc || 1.15}`,
    },
    {
      id: 'strategy' as AgentRole,
      title: 'Strategy Agent ("The Brain")',
      role: 'Multi-Objective Solver',
      icon: BrainCircuit,
      color: 'from-purple-600 to-pink-500',
      borderColor: 'border-purple-500/50',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      glow: 'shadow-purple-500/30',
      status: decisionChain?.strategyAgent.action || 'SYNTHESIS',
      confidence: 96,
      keyMetric: `${decisionChain?.strategyAgent.action?.replace(/_/g, ' ') || 'Optimal Irrigation'} (${
        decisionChain?.strategyAgent.durationMinutes || 35
      } min)`,
      isHub: true,
    },
    {
      id: 'actuator' as AgentRole,
      title: 'Actuator & Safety Agent',
      role: 'Relay Execution & Guardrails',
      icon: ShieldCheck,
      color: 'from-amber-600 to-teal-500',
      borderColor: 'border-teal-500/40',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      glow: 'shadow-teal-500/20',
      status: decisionChain?.actuatorAgent.relayCommand || 'ARMED_SAFE',
      confidence: decisionChain?.actuatorAgent.hydraulicSafetyPass ? 100 : 40,
      keyMetric: `Relay ${decisionChain?.actuatorAgent.pin || 'GPIO_1'} | Safe: ${
        decisionChain?.actuatorAgent.hydraulicSafetyPass !== false ? 'YES' : 'HALTED'
      }`,
    },
  ];

  return (
    <div className="bg-[#12141A] border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
      {/* Background Decorative SVG */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <BrainCircuit className="w-32 h-32 text-emerald-500" />
      </div>

      {/* Visualizer Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BrainCircuit className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Multi-Agent Orchestration Flow
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800/90 text-emerald-400 rounded border border-slate-700">
              Cooperative Consensus
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-mono">
            Decentralized real-time constraint solver & safety arbitration
          </p>
        </div>

        <button
          id="btn-re-deliberate"
          onClick={onTriggerDeliberation}
          disabled={isDeliberating}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0F1117] text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500 transition disabled:opacity-50 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.1)]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isDeliberating ? 'animate-spin' : ''}`} />
          <span>{isDeliberating ? 'Agents Deliberating...' : 'Force Agent Consensus Cycle'}</span>
        </button>
      </div>

      {/* Interactive Topology Graph */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative z-10">
        {agents.map((agent) => {
          const isSelected = activeRoleFilter === agent.id;
          const Icon = agent.icon;

          return (
            <div
              key={agent.id}
              onClick={() => onSelectRole && onSelectRole(agent.id)}
              className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                agent.isHub
                  ? isSelected
                    ? 'bg-emerald-500/15 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] ring-2 ring-emerald-400'
                    : 'bg-emerald-500/10 border-2 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.25)] md:scale-105 md:z-10'
                  : isSelected
                  ? 'bg-[#141822] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/50'
                  : 'bg-[#0F1117] border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              {/* Active data packet flow indicator */}
              {isDeliberating && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}

              <div>
                {/* Node Top: Icon & Role */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-lg shadow-black ${
                      agent.isHub
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border ${agent.badgeColor}`}>
                    {agent.status}
                  </span>
                </div>

                {/* Node Title & Subtitle */}
                <h3 className={`text-xs font-bold tracking-tight ${agent.isHub ? 'text-white font-extrabold uppercase' : 'text-slate-200'}`}>
                  {agent.title}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mb-2 uppercase">{agent.role}</p>

                {/* Metric Summary */}
                <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80 text-[11px] font-mono text-slate-300 line-clamp-2 leading-relaxed">
                  {agent.keyMetric}
                </div>
              </div>

              {/* Node Bottom: Confidence Bar */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>CONFIDENCE</span>
                <span className="font-mono font-bold text-emerald-400">{agent.confidence}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Consensus Summary Box matching Elegant Dark */}
      {decisionChain?.synthesis && (
        <div className="mt-4 p-4 rounded-lg bg-black/40 border border-slate-800 flex items-start gap-3 relative z-10 font-mono text-[11px]">
          <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-emerald-400 uppercase flex items-center gap-2 tracking-wider">
              <span>Strategy Brain • Action: {decisionChain.strategyAgent.action}</span>
            </div>
            <p className="text-slate-300 mt-1 leading-relaxed">{decisionChain.synthesis}</p>
          </div>
        </div>
      )}
    </div>
  );
};
