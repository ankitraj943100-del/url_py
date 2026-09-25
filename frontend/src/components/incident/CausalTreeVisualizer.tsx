import React from 'react';
import { GitCommit, Database, Activity, AlertOctagon, ArrowDown } from 'lucide-react';

export const CausalTreeVisualizer: React.FC = () => {
  const nodes = [
    { title: 'Deployment payment-service v2.4.1', detail: 'Deployed 14:19 UTC by GitHub Actions (SHA: 9f8a3c1)', icon: GitCommit, color: 'text-blue-400 border-blue-500/40 bg-blue-950/20' },
    { title: 'Unclosed Async DB Session Context Block', detail: 'Commit 9f8a3c1 omitted context manager release in payment retry loop', icon: Database, color: 'text-purple-400 border-purple-500/40 bg-purple-950/20' },
    { title: 'Postgres Connection Pool Saturation', detail: 'Active connections increased 82 → 497 (QueuePool limit reached)', icon: Database, color: 'text-amber-400 border-amber-500/40 bg-amber-950/20' },
    { title: 'p95 Request Latency Degradation', detail: 'API latency jumped 210ms → 4,820ms (4.8s wait time on DB pool)', icon: Activity, color: 'text-amber-400 border-amber-500/40 bg-amber-950/20' },
    { title: 'HTTP 5xx Error Rate Spike (38.2%)', detail: '327 error timeouts logged in payment-api; Sentinel Alert triggered', icon: AlertOctagon, color: 'text-rose-400 border-rose-500/40 bg-rose-950/20' }
  ];

  return (
    <div className="p-5 bg-[#111820] border border-[#202833] rounded-xl space-y-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#202833] pb-3">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
          Interactive Causal Root Cause Tree
        </h3>
        <span className="px-2.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
          5-Node Evidence Chain
        </span>
      </div>

      <div className="flex flex-col items-center space-y-2 py-2">
        {nodes.map((n, idx) => {
          const Icon = n.icon;
          return (
            <React.Fragment key={idx}>
              <div className={`w-full p-3.5 rounded-xl border flex items-center gap-3.5 ${n.color}`}>
                <div className="p-2 rounded-lg bg-[#0B0F14] border border-[#202833] shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-100 text-xs">{n.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{n.detail}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-500 border border-slate-700 px-2 py-0.5 rounded">
                  Step {idx + 1}
                </span>
              </div>
              {idx < nodes.length - 1 && (
                <ArrowDown className="w-4 h-4 text-slate-600 animate-bounce" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
