import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GitCommit, Clock, Server, AlertOctagon } from 'lucide-react';
import { api } from '../services/api';
import { TraceSpan } from '../types';

export const Traces: React.FC = () => {
  const [searchParams] = useSearchParams();
  const traceId = searchParams.get('trace_id') || 'tr-8901249-payment';
  const [traceData, setTraceData] = useState<any>(null);
  const [selectedSpan, setSelectedSpan] = useState<TraceSpan | null>(null);

  useEffect(() => {
    api.getTraceWaterfall(traceId).then(data => {
      setTraceData(data);
      setSelectedSpan(data.spans[0] || null);
    }).catch(err => {
      console.error(err);
    });
  }, [traceId]);

  if (!traceData) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 bg-[#111820] rounded w-64 animate-pulse" />
        <div className="h-64 bg-[#111820] rounded-xl animate-pulse" />
      </div>
    );
  }

  const maxDuration = traceData.total_duration_ms;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Distributed Trace Waterfall</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">OpenTelemetry end-to-end request latency propagation</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-blue-400 bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded">
            Trace ID: {traceId}
          </span>
        </div>
      </div>

      {/* Main Grid: Waterfall Spans (2 cols) & Span Attributes (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Waterfall Timeline */}
        <div className="lg:col-span-2 bg-[#111820] border border-[#202833] rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#202833] pb-3 text-[11px] text-slate-400 font-bold uppercase">
            <span>Service & Operation</span>
            <span>Duration Waterfall (Total: {maxDuration}ms)</span>
          </div>

          <div className="space-y-3">
            {traceData.spans.map((span: TraceSpan, idx: number) => {
              const widthPct = Math.max(10, Math.min(100, (span.duration_ms / maxDuration) * 100));
              const isSelected = selectedSpan?.id === span.id;
              return (
                <div
                  key={span.id}
                  onClick={() => setSelectedSpan(span)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1A232E] border-blue-500'
                      : 'bg-[#0B0F14] border-[#202833] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-400">[{span.service_name}]</span>
                      <span className="text-slate-200">{span.operation_name}</span>
                    </div>
                    <span className="text-rose-400 font-bold">{span.duration_ms}ms</span>
                  </div>

                  {/* Waterfall Bar */}
                  <div className="mt-2.5 h-3 bg-[#111820] rounded-full overflow-hidden border border-[#202833]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        span.status_code === 'ERROR' ? 'bg-rose-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Span Details */}
        {selectedSpan && (
          <div className="bg-[#111820] border border-[#202833] rounded-xl p-5 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-[#202833] pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Span Inspector</h3>
              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {selectedSpan.status_code}
              </span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Span ID:</span>
                <span className="text-slate-200 font-bold">{selectedSpan.span_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="text-blue-400 font-bold">{selectedSpan.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operation:</span>
                <span className="text-slate-200">{selectedSpan.operation_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="text-rose-400 font-bold">{selectedSpan.duration_ms}ms</span>
              </div>
            </div>

            {selectedSpan.error_message && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 space-y-1">
                <p className="text-[10px] font-bold uppercase text-rose-400">Error Exception:</p>
                <p>{selectedSpan.error_message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
