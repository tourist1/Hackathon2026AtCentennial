import React, { useState } from 'react';
import { Terminal, Filter, Trash2, CheckCircle, AlertTriangle, AlertOctagon, Info, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { AgentLogMessage, AgentRole } from '../types';

interface AgentTerminalFeedProps {
  logs: AgentLogMessage[];
  onClearLogs: () => void;
  selectedRoleFilter: AgentRole | 'all';
  onFilterRole: (role: AgentRole | 'all') => void;
}

export const AgentTerminalFeed: React.FC<AgentTerminalFeedProps> = ({
  logs,
  onClearLogs,
  selectedRoleFilter,
  onFilterRole,
}) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = selectedRoleFilter === 'all'
    ? logs
    : logs.filter((l) => l.agentRole === selectedRoleFilter);

  const copyLog = (log: AgentLogMessage) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRoleBadge = (role: AgentRole) => {
    switch (role) {
      case 'sensor':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/60';
      case 'weather':
        return 'bg-sky-950/60 text-sky-300 border-sky-800/60';
      case 'crop':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      case 'strategy':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
      case 'actuator':
        return 'bg-teal-950/60 text-teal-300 border-teal-800/60';
    }
  };

  const getSeverityIcon = (sev: AgentLogMessage['severity']) => {
    switch (sev) {
      case 'alert':
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-[#12141A] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-[480px]">
      {/* Terminal Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Terminal className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              Agent Deliberation Terminal
              <span className="text-xs font-mono font-normal text-slate-500">({filteredLogs.length} events)</span>
            </h2>
          </div>
        </div>

        {/* Filter Badges & Clear */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0F1117] border border-slate-800 rounded-lg p-0.5 text-[10px] font-mono">
            {(['all', 'sensor', 'weather', 'crop', 'strategy', 'actuator'] as const).map((r) => (
              <button
                key={r}
                onClick={() => onFilterRole(r)}
                className={`px-2 py-1 rounded uppercase tracking-wider transition ${
                  selectedRoleFilter === r
                    ? 'bg-slate-800 text-white font-semibold shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={onClearLogs}
            title="Clear Feed"
            className="p-1.5 text-slate-400 hover:text-white bg-[#0F1117] border border-slate-800 rounded-lg hover:bg-slate-800 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Terminal Output */}
      <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs pr-1 scrollbar-thin scrollbar-thumb-slate-700">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No agent deliberation records logged for this filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;

            return (
              <div
                key={log.id}
                className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="mt-0.5">{getSeverityIcon(log.severity)}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold uppercase ${getRoleBadge(log.agentRole)}`}>
                          {log.agentRole} Agent
                        </span>
                        <span className="font-semibold text-slate-200 truncate">{log.title}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">{log.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {log.payload && (
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="p-1 text-slate-400 hover:text-slate-200 text-[10px] flex items-center gap-0.5 bg-[#0F1117] border border-slate-800 rounded"
                      >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        <span>JSON</span>
                      </button>
                    )}

                    <button
                      onClick={() => copyLog(log)}
                      title="Copy JSON Payload"
                      className="p-1 text-slate-400 hover:text-slate-200 bg-[#0F1117] border border-slate-800 rounded"
                    >
                      {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Expandable JSON Payload */}
                {isExpanded && log.payload && (
                  <div className="mt-2.5 p-2 rounded-lg bg-black/70 border border-slate-800 text-[10px] text-emerald-400 overflow-x-auto">
                    <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
