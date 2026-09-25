import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const Replay: React.FC = () => {
  const [replay, setReplay] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    api.getReplay('INC-1042').then(data => {
      setReplay(data);
    }).catch(err => {
      console.error(err);
    });
  }, []);

  useEffect(() => {
    let timer: any;
    if (isPlaying && replay) {
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= replay.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, replay]);

  if (!replay) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 bg-[#111820] rounded w-64 animate-pulse" />
        <div className="h-64 bg-[#111820] rounded-xl animate-pulse" />
      </div>
    );
  }

  const step = replay.steps[currentStep];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Incident Replay Studio</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Step-by-step playback of historical incident lifecycle and AI responses</p>
        </div>
      </div>

      {/* Playback Control Bar */}
      <div className="p-4 bg-[#111820] border border-[#202833] rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setCurrentStep(0)}
            className="p-2 rounded-lg bg-[#1A232E] border border-slate-700 text-slate-300"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs text-slate-300">
            Step {currentStep + 1} of {replay.steps.length}
          </span>
        </div>

        {/* Step Scrubber Pills */}
        <div className="flex items-center gap-1.5 bg-[#0B0F14] p-1.5 rounded-lg border border-[#202833]">
          {replay.steps.map((s: any, idx: number) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                setIsPlaying(false);
              }}
              className={`w-7 h-7 rounded text-xs font-mono font-bold transition-all ${
                currentStep === idx
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-[#1A232E]'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Frame Active Display */}
      {step && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 bg-[#111820] border border-blue-500/30 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#202833] pb-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {step.badge}
                </span>
                <span className="font-mono text-xs text-slate-400">{step.timestamp}</span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-100">{step.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">{step.description}</p>

            {/* Frame Telemetry Snapshot */}
            <div className="grid grid-cols-4 gap-3 pt-3">
              <div className="p-3 bg-[#0B0F14] rounded border border-[#202833]">
                <span className="text-[10px] text-slate-500 block">Error Rate</span>
                <span className="text-sm font-bold font-mono text-rose-400">{step.metrics.error_rate}%</span>
              </div>
              <div className="p-3 bg-[#0B0F14] rounded border border-[#202833]">
                <span className="text-[10px] text-slate-500 block">Latency</span>
                <span className="text-sm font-bold font-mono text-amber-400">{step.metrics.latency_ms}ms</span>
              </div>
              <div className="p-3 bg-[#0B0F14] rounded border border-[#202833]">
                <span className="text-[10px] text-slate-500 block">DB Conns</span>
                <span className="text-sm font-bold font-mono text-blue-400">{step.metrics.db_conn}</span>
              </div>
              <div className="p-3 bg-[#0B0F14] rounded border border-[#202833]">
                <span className="text-[10px] text-slate-500 block">CPU</span>
                <span className="text-sm font-bold font-mono text-emerald-400">{step.metrics.cpu}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
