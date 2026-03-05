"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import DemoDashboardLayout from "@/components/DemoDashboardLayout";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useProgressTracker } from "@/hooks/useProgressTracker";
import {
  Loader2, AlertCircle, Terminal, CheckCircle2, AlertTriangle, Info, Copy, Check, ChevronDown, ChevronUp, Clock, Package, Wrench
} from "lucide-react";

interface SetupStep {
  order: number;
  category: string;
  title: string;
  command?: string;
  description: string;
  required: boolean;
  verifyCommand?: string;
  expectedOutput?: string;
}

interface EnvVariable {
  name: string;
  required: boolean;
  description: string;
  defaultValue?: string;
  sensitive: boolean;
  source: string;
}

interface Conflict {
  severity: "error" | "warning" | "info";
  description: string;
  sources: string[];
  resolution: string;
}

interface EnvSetupGuide {
  setupSteps: SetupStep[];
  envVariables: EnvVariable[];
  conflicts: Conflict[];
  missingPieces: { severity: string; description: string; suggestion: string }[];
  estimatedSetupTime: string;
  requiredTools: string[];
  summary: string;
  dockerSupport: { hasDockerfile: boolean; hasCompose: boolean; quickStart?: string };
}

const CATEGORY_ICON: Record<string, typeof Terminal> = {
  runtime: Package,
  "package-manager": Package,
  database: Terminal,
  cache: Terminal,
  "env-vars": Wrench,
  build: Terminal,
};

const SEVERITY_STYLES: Record<string, string> = {
  error: "border-red-500/20 bg-red-500/5 text-red-300",
  warning: "border-amber-500/20 bg-amber-500/5 text-amber-300",
  info: "border-blue-500/20 bg-blue-500/5 text-blue-300",
};

export default function EnvSetupPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [guide, setGuide] = useState<EnvSetupGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const { getToken } = useAuth();
  const { track } = useProgressTracker(decodedRepoId);

  const fetchGuide = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetchApi(`${getApiBase(decodedRepoId)}/env-setup/${owner}/${repo}`, {}, token);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setGuide(data.envSetup || null);
      if (data.envSetup) {
        track({ eventType: "env_setup_viewed", targetLabel: `${decodedRepoId} env-setup` });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load env setup guide");
    } finally {
      setLoading(false);
    }
  }, [owner, repo, decodedRepoId]);

  useEffect(() => { fetchGuide(); }, [fetchGuide]);

  async function triggerAnalysis() {
    try {
      setAnalyzing(true);
      const token = await getToken();
      await fetchApi(`${getApiBase(decodedRepoId)}/env-setup/${owner}/${repo}`, { method: "POST" }, token);
      await fetchGuide();
    } catch { /* ignore */ } finally {
      setAnalyzing(false);
    }
  }

  function copyCommand(cmd: string) {
    navigator.clipboard?.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  }

  return (
    <DemoDashboardLayout
      title="Environment Setup"
      subtitle="Step-by-step guide to set up this project locally"
      action={
        <button
          onClick={triggerAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2 px-4 py-2 glass-hover border border-white/[0.08] rounded-lg text-sm font-medium text-brand-text-secondary hover:text-white transition-all"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
          {analyzing ? "Analyzing..." : "Re-analyze"}
        </button>
      }
    >
      {error && (
        <div className="mb-5 flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-400/5 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : guide ? (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-xl border border-white/[0.06] p-4 col-span-2">
              <p className="text-xs text-brand-muted uppercase tracking-wide font-medium mb-2">Summary</p>
              <p className="text-sm text-brand-text-secondary">{guide.summary}</p>
            </div>
            <div className="glass rounded-xl border border-white/[0.06] p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-brand-muted">Est. setup time</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{guide.estimatedSetupTime}</p>
            </div>
          </div>

          {/* Docker quick start */}
          {guide.dockerSupport?.hasCompose && guide.dockerSupport.quickStart && (
            <div className="glass rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Docker Quick Start</p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <code className="flex-1 text-sm font-mono text-emerald-300 bg-emerald-500/10 px-4 py-2.5 rounded-lg border border-emerald-500/20">
                  {guide.dockerSupport.quickStart}
                </code>
                <button onClick={() => copyCommand(guide.dockerSupport.quickStart!)} className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors">
                  {copiedCmd === guide.dockerSupport.quickStart ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-brand-muted" />}
                </button>
              </div>
            </div>
          )}

          {/* Conflicts */}
          {(guide.conflicts.length > 0 || guide.missingPieces.length > 0) && (
            <div className="space-y-2">
              <h3 className="text-xs text-brand-muted uppercase tracking-widest font-semibold">Issues Detected</h3>
              {[...guide.conflicts, ...guide.missingPieces].map((item, i) => (
                <div key={i} className={`flex gap-3 p-4 rounded-xl border ${SEVERITY_STYLES[(item as any).severity]}`}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{(item as any).description}</p>
                    <p className="text-xs mt-1 opacity-80">{(item as any).resolution || (item as any).suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Setup steps */}
          <div>
            <h3 className="text-xs text-brand-muted uppercase tracking-widest font-semibold mb-3">Setup Steps</h3>
            <div className="space-y-2">
              {guide.setupSteps.map((step) => {
                const CatIcon = CATEGORY_ICON[step.category] || Terminal;
                const isOpen = expandedStep === step.order;
                return (
                  <div key={step.order} className="glass rounded-xl border border-white/[0.06] overflow-hidden">
                    <button
                      onClick={() => setExpandedStep(isOpen ? null : step.order)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-400">{step.order}</span>
                      </div>
                      <CatIcon className="w-4 h-4 text-brand-muted flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-white">{step.title}</p>
                        <p className="text-xs text-brand-muted truncate">{step.description}</p>
                      </div>
                      {step.required && <span className="text-[10px] px-2 py-0.5 rounded-full border border-red-500/20 text-red-400 bg-red-500/10 font-semibold">Required</span>}
                      {isOpen ? <ChevronUp className="w-4 h-4 text-brand-muted" /> : <ChevronDown className="w-4 h-4 text-brand-muted" />}
                    </button>
                    {isOpen && step.command && (
                      <div className="px-4 pb-4">
                        <div className="flex items-center gap-3 bg-[#0d0f17] border border-white/[0.06] rounded-xl p-3">
                          <span className="text-brand-muted text-sm select-none">$</span>
                          <code className="flex-1 text-sm font-mono text-emerald-300">{step.command}</code>
                          <button onClick={() => copyCommand(step.command!)} className="p-1.5 rounded-md hover:bg-white/[0.05] transition-colors">
                            {copiedCmd === step.command ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-brand-muted" />}
                          </button>
                        </div>
                        {step.verifyCommand && (
                          <p className="text-xs text-brand-muted mt-2">Verify: <code className="text-brand-text-secondary font-mono">{step.verifyCommand}</code></p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Env variables */}
          {guide.envVariables.length > 0 && (
            <div>
              <h3 className="text-xs text-brand-muted uppercase tracking-widest font-semibold mb-3">Environment Variables</h3>
              <div className="glass rounded-xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]">
                {guide.envVariables.map((v) => (
                  <div key={v.name} className="flex items-center gap-4 p-4">
                    <code className="text-sm font-mono text-indigo-300 min-w-0 flex-1">{v.name}</code>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${v.required ? "border-red-500/20 text-red-400 bg-red-500/10" : "border-white/[0.06] text-brand-muted"}`}>
                      {v.required ? "Required" : "Optional"}
                    </span>
                    {v.sensitive && <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/20 text-amber-400 bg-amber-500/10 font-semibold">Secret</span>}
                    <p className="text-xs text-brand-text-secondary text-right max-w-xs">{v.description}</p>
                    {v.defaultValue && <code className="text-xs text-brand-muted font-mono">{v.defaultValue}</code>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass rounded-xl border border-white/[0.06] flex flex-col items-center justify-center py-20">
          <Terminal className="w-10 h-10 text-brand-muted mb-4" />
          <p className="text-white font-semibold mb-1">No setup guide yet</p>
          <p className="text-brand-muted text-sm">Click Re-analyze to generate an environment setup guide.</p>
        </div>
      )}
    </DemoDashboardLayout>
  );
}
