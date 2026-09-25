import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Bot,
  Bell,
  Shield,
  CheckCircle2,
  SlidersHorizontal,
  Cpu,
  Zap,
  Globe,
  Lock,
  Key,
  Database
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'llm' | 'integrations' | 'slo' | 'security'>('llm');
  const [llmProvider, setLlmProvider] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.1);
  const [slackUrl, setSlackUrl] = useState('https://hooks.slack.com/services/T00/B00/XXXX');
  const [pagerdutyToken, setPagerdutyToken] = useState('pd_token_live_891234');
  const [latencyThreshold, setLatencyThreshold] = useState(500);
  const [errorThreshold, setErrorThreshold] = useState(2.0);
  const [autoInvestigate, setAutoInvestigate] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 select-none max-w-5xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1E2632] pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 shadow-lg shadow-blue-500/10">
            <SettingsIcon className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">System Control & AI Settings</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                v1.0 Production
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Manage LLM model providers, alert webhooks, SLO guardrails, & security policies
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all border border-blue-400"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-400 flex items-center justify-between shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">Settings saved successfully! Configuration active across all agents.</span>
          </div>
          <span className="text-[10px] text-emerald-500">Updated just now</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E2632] pb-1 font-mono text-xs">
        {[
          { id: 'llm', label: 'AI LLM Providers', icon: Bot },
          { id: 'integrations', label: 'Webhooks & Alerting', icon: Bell },
          { id: 'slo', label: 'SLO Guardrails', icon: Shield },
          { id: 'security', label: 'Security & Access', icon: Lock }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-blue-600/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#111820]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: LLM PROVIDERS */}
      {activeTab === 'llm' && (
        <div className="space-y-6">
          <div className="p-6 bg-[#111820] border border-[#1E2632] rounded-xl space-y-5 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-[#1E2632] pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-slate-100 text-sm">Primary Multi-Agent LLM Engine</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                🟢 API Connected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'gpt-4o-mini', title: 'OpenAI GPT-4o Mini', desc: 'Fast, cost-effective, ideal for parallel investigation nodes.', latency: '120ms', cost: '$0.00015/1k' },
                { id: 'claude-3-5-sonnet', title: 'Anthropic Claude 3.5 Sonnet', desc: 'Deep SRE reasoning & root cause hypothesis generation.', latency: '340ms', cost: '$0.003/1k' },
                { id: 'gemini-1-5-pro', title: 'Google Gemini 1.5 Pro', desc: '1M token context for massive log & trace correlation.', latency: '280ms', cost: '$0.00125/1k' },
                { id: 'llama-3-local', title: 'Llama-3 70B (Local Ollama)', desc: '100% offline privacy execution on local infrastructure.', latency: '450ms', cost: '$0.00 (Self-hosted)' }
              ].map(provider => (
                <div
                  key={provider.id}
                  onClick={() => setLlmProvider(provider.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    llmProvider === provider.id
                      ? 'bg-blue-600/15 border-blue-500 text-slate-100 shadow-md shadow-blue-500/5'
                      : 'bg-[#0B0F14] border-[#1E2632] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="llm_provider"
                          checked={llmProvider === provider.id}
                          onChange={() => setLlmProvider(provider.id)}
                          className="accent-blue-500"
                        />
                        <span className="font-bold text-xs text-slate-100">{provider.title}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 font-sans pl-6">{provider.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-[#1E2632] flex items-center justify-between text-[10px] text-slate-500">
                    <span>Est. Latency: <strong className="text-slate-300">{provider.latency}</strong></span>
                    <span>Cost: <strong className="text-slate-300">{provider.cost}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Temperature Slider */}
            <div className="pt-4 border-t border-[#1E2632] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">LLM Temperature (Sampling Randomness):</span>
                <span className="text-blue-400 font-bold">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-500 bg-[#0B0F14]"
              />
              <p className="text-[11px] text-slate-500 font-sans">Lower temperature (0.1) enforces deterministic, evidence-grounded agent reasoning.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEBHOOKS & ALERTING */}
      {activeTab === 'integrations' && (
        <div className="p-6 bg-[#111820] border border-[#1E2632] rounded-xl space-y-5 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-[#1E2632] pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-slate-100 text-sm">Notification Webhooks & Escalation</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
              ✓ 2 Channels Verified
            </span>
          </div>

          <div className="space-y-4 font-sans">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-mono font-bold">Slack Incoming Webhook URL:</label>
              <input
                type="text"
                value={slackUrl}
                onChange={(e) => setSlackUrl(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#1E2632] text-slate-200 rounded-xl p-3 text-xs font-mono outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-mono font-bold">PagerDuty Events API v2 Token:</label>
              <input
                type="text"
                value={pagerdutyToken}
                onChange={(e) => setPagerdutyToken(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#1E2632] text-slate-200 rounded-xl p-3 text-xs font-mono outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SLO GUARDRAILS */}
      {activeTab === 'slo' && (
        <div className="p-6 bg-[#111820] border border-[#1E2632] rounded-xl space-y-5 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-[#1E2632] pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-slate-100 text-sm">SLO Target Breach Guardrails</h3>
            </div>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-bold">
              Auto-Trigger Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-mono font-bold">p95 Latency Breach Threshold (ms):</label>
              <input
                type="number"
                value={latencyThreshold}
                onChange={(e) => setLatencyThreshold(Number(e.target.value))}
                className="w-full bg-[#0B0F14] border border-[#1E2632] text-slate-200 rounded-xl p-3 text-xs font-mono outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-mono font-bold">Error Rate Breach Threshold (%):</label>
              <input
                type="number"
                value={errorThreshold}
                onChange={(e) => setErrorThreshold(Number(e.target.value))}
                className="w-full bg-[#0B0F14] border border-[#1E2632] text-slate-200 rounded-xl p-3 text-xs font-mono outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="p-4 bg-[#0B0F14] rounded-xl border border-[#1E2632] flex items-center justify-between font-sans">
            <div>
              <p className="text-xs font-bold text-slate-100">Automatically Trigger Multi-Agent Workflow on Breach</p>
              <p className="text-[11px] text-slate-400 font-mono">Launches LangGraph telemetry nodes immediately upon Prometheus alert trigger.</p>
            </div>
            <input
              type="checkbox"
              checked={autoInvestigate}
              onChange={(e) => setAutoInvestigate(e.target.checked)}
              className="w-5 h-5 accent-blue-500"
            />
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY */}
      {activeTab === 'security' && (
        <div className="p-6 bg-[#111820] border border-[#1E2632] rounded-xl space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-[#1E2632] pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-slate-100 text-sm">Human Approval & Safety Enforcement</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
              🛡️ Zero Unapproved Execution
            </span>
          </div>

          <p className="text-slate-300 font-sans leading-relaxed">
            SentinelOps AI strictly enforces a <strong>Human-in-the-Loop Approval Gate</strong>. AI agents draft evidence-backed remediation plans, but destructive production actions (rollbacks, pod restarts, config shifts) require explicit operator authorization.
          </p>
        </div>
      )}
    </div>
  );
};
