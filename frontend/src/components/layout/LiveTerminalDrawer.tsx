import React, { useEffect, useState } from 'react';
import { Terminal, X, CheckCircle2, Play, ShieldCheck } from 'lucide-react';

interface LiveTerminalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId: string;
}

export const LiveTerminalDrawer: React.FC<LiveTerminalDrawerProps> = ({ isOpen, onClose, incidentId }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLogs([]);
      setIsDone(false);

      const sequence = [
        `[14:28:15 UTC] SentinelOps AI Operator Approval Received: User 'Ankit (SRE Lead)'`,
        `[14:28:16 UTC] Initiating safe Kubernetes deployment rollback...`,
        `$ kubectl rollout undo deployment/payment-service -n production`,
        `[14:28:18 UTC] deployment.apps/payment-service rolled back to revision 240`,
        `$ kubectl get pods -n production -l app=payment-service`,
        `[14:28:20 UTC] payment-service-7f8a92c-98a12   1/1   Terminating   0s`,
        `[14:28:21 UTC] payment-service-8b9f10d-12b90   1/1   ContainerCreating   1s`,
        `[14:28:23 UTC] payment-service-8b9f10d-12b90   1/1   Running       3s`,
        `[14:28:25 UTC] Launching SentinelOps Verification Agent metric health polling...`,
        `[14:28:27 UTC] Verification Cycle 1/3: p95 Latency = 240ms, Error Rate = 0.4% [PASS]`,
        `[14:28:29 UTC] Verification Cycle 2/3: p95 Latency = 190ms, Error Rate = 0.2% [PASS]`,
        `[14:28:31 UTC] Verification Cycle 3/3: p95 Latency = 185ms, Error Rate = 0.2% [PASS]`,
        `[14:28:32 UTC] ✅ RECOVERY VERIFIED. Incident ${incidentId} status updated to RESOLVED.`
      ];

      sequence.forEach((line, index) => {
        setTimeout(() => {
          setLogs(prev => [...prev, line]);
          if (index === sequence.length - 1) {
            setIsDone(true);
          }
        }, (index + 1) * 600);
      });
    }
  }, [isOpen, incidentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-[#0B0F14]/95 backdrop-blur-md border-t border-[#202833] shadow-2xl font-mono text-xs max-h-96 flex flex-col select-none">
      {/* Drawer Header */}
      <div className="p-3 bg-[#111820] border-b border-[#202833] flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-100 font-bold">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Live SRE Remediation Console Output</span>
          {isDone ? (
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              ✓ Execution Complete
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono animate-pulse">
              ● Running Rollback...
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Terminal Console Logs */}
      <div className="p-4 overflow-y-auto space-y-1.5 font-mono text-slate-200 text-xs max-h-80">
        {logs.map((log, i) => (
          <div
            key={i}
            className={`${
              log.startsWith('$')
                ? 'text-yellow-400 font-bold'
                : log.includes('RECOVERY VERIFIED')
                ? 'text-emerald-400 font-bold bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20'
                : 'text-slate-300'
            }`}
          >
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};
