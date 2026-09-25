import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, Database, Radio, Activity, CheckCircle2 } from 'lucide-react';

interface InitialSplashLoaderProps {
  onComplete: () => void;
}

export const InitialSplashLoader: React.FC<InitialSplashLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const steps = [
    'Connecting to SentinelOps Engine (localhost:8000)...',
    'Mounting OpenTelemetry Metric & Trace Pipeline...',
    'Initializing LangGraph Multi-Agent State Checkpointer...',
    'Loading PostgreSQL + pgvector Runbook Knowledge Index...',
    'Telemetry Workspace Ready'
  ];

  useEffect(() => {
    // Progress counter animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setFadeOut(true);
          setTimeout(() => {
            onComplete();
          }, 400);
          return 100;
        }
        return prev + 5;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    if (progress < 25) setStepIndex(0);
    else if (progress < 50) setStepIndex(1);
    else if (progress < 75) setStepIndex(2);
    else if (progress < 95) setStepIndex(3);
    else setStepIndex(4);
  }, [progress]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#0B0F14] flex flex-col items-center justify-center select-none transition-opacity duration-500 font-mono ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Animated Radial Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E2632_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />

      {/* Main Loader Container */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 space-y-6 text-center">
        {/* Glowing Radar Logo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-4 rounded-full bg-blue-600/20 blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-2xl bg-[#111820] border-2 border-blue-500/50 flex items-center justify-center text-blue-400 shadow-2xl shadow-blue-500/20 glow-blue">
            <ShieldCheck className="w-10 h-10 text-blue-400 animate-pulse-glow" />
          </div>
        </div>

        {/* Brand Title */}
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-slate-100 tracking-wider uppercase font-sans">
            SentinelOps AI
          </h1>
          <p className="text-xs text-blue-400 flex items-center justify-center gap-1.5 font-bold">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Agentic SRE Observability Platform</span>
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full space-y-2">
          <div className="h-2 w-full bg-[#111820] rounded-full overflow-hidden border border-[#202833]">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-400 transition-all duration-75 rounded-full shadow-lg shadow-blue-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="text-[11px] text-slate-500">System Boot</span>
            <span className="font-bold text-blue-400">{progress}%</span>
          </div>
        </div>

        {/* Telemetry Initialization Checklist Log */}
        <div className="w-full p-3.5 bg-[#111820]/90 border border-[#202833] rounded-xl text-left text-[11px] space-y-1.5 text-slate-300">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{steps[stepIndex]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
