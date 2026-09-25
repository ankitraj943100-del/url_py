import React, { useEffect, useState } from 'react';
import { FileCheck2, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Postmortem } from '../types';

export const Postmortems: React.FC = () => {
  const [postmortem, setPostmortem] = useState<Postmortem | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.getPostmortem('INC-1042').then(data => {
      setPostmortem(data);
    }).catch(err => {
      console.error(err);
    });
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const pm = await api.generatePostmortem('INC-1042');
      setPostmortem(pm);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">AI Postmortem Generator</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Automated post-incident retrospectives, timelines, & preventive action tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Generating...' : 'Generate Postmortem'}</span>
          </button>
        </div>
      </div>

      {postmortem ? (
        <div className="max-w-4xl bg-[#111820] border border-[#202833] rounded-xl p-6 space-y-6 text-xs leading-relaxed">
          <div className="border-b border-[#202833] pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100">{postmortem.title}</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">Incident ID: INC-1042 · Created: {new Date(postmortem.created_at).toLocaleDateString()}</p>
            </div>
            <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
              ✓ Verified & Export Ready
            </span>
          </div>

          <div className="space-y-4">
            <section className="space-y-1">
              <h4 className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">1. Executive Summary</h4>
              <p className="p-3 bg-[#0B0F14] rounded border border-[#202833] text-slate-200">{postmortem.summary}</p>
            </section>

            <section className="space-y-1">
              <h4 className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">2. Business Impact</h4>
              <p className="p-3 bg-[#0B0F14] rounded border border-[#202833] text-slate-200">{postmortem.impact_analysis}</p>
            </section>

            <section className="space-y-1">
              <h4 className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">3. Root Cause Analysis</h4>
              <p className="p-3 bg-[#0B0F14] rounded border border-[#202833] text-slate-200 font-mono">{postmortem.root_cause_analysis}</p>
            </section>

            <section className="space-y-1">
              <h4 className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">4. Timeline of Events</h4>
              <pre className="p-3 bg-[#0B0F14] rounded border border-[#202833] text-slate-300 font-mono text-[11px] whitespace-pre-wrap">
                {postmortem.timeline_markdown}
              </pre>
            </section>

            <section className="space-y-1">
              <h4 className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">5. Preventive Action Items</h4>
              <div className="space-y-1.5 font-mono text-xs">
                {postmortem.preventive_actions.map((act, i) => (
                  <div key={i} className="p-2.5 bg-[#0B0F14] rounded border border-[#202833] flex items-center justify-between">
                    <span className="text-slate-200">{act.action}</span>
                    <span className="text-slate-400 text-[10px]">[{act.owner} · {act.status}]</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-[#111820] border border-[#202833] rounded-xl space-y-4">
          <FileCheck2 className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-sm font-medium text-slate-300">No postmortem generated for INC-1042 yet.</p>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs"
          >
            Generate Postmortem Now
          </button>
        </div>
      )}
    </div>
  );
};
