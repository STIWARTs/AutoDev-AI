"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import ArchitectureMap from "@/components/ArchitectureMap";
import DemoDashboardLayout from "@/components/DemoDashboardLayout";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useProgressTracker } from "@/hooks/useProgressTracker";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { ArchitectureMap as ArchMapType } from "@autodev/shared";
import { Play, RefreshCw, Loader2, AlertCircle, Cpu, GitBranch, Layers, Code2 } from "lucide-react";

type AnalysisStatus = "pending" | "analyzing" | "completed" | "failed";

export default function RepoDetailPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");
  const isDemo = decodedRepoId.startsWith("demo/");

  const [archMap, setArchMap] = useState<ArchMapType | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const { track } = useProgressTracker(decodedRepoId);

  const fetchArchitecture = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetchApi(
        `${getApiBase(decodedRepoId)}/analysis/${owner}/${repo}/architecture`,
        {},
        token
      );
      if (res.status === 404) {
        setStatus("pending");
        setArchMap(null);
        setError(null);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.content) {
        setArchMap(data.content as ArchMapType);
        setStatus("completed");
        track({ eventType: "module_explored", targetLabel: `${decodedRepoId} architecture` });
      } else if (data.nodes) {
        setArchMap(data as ArchMapType);
        setStatus("completed");
        track({ eventType: "module_explored", targetLabel: `${decodedRepoId} architecture` });
      } else {
        setStatus("analyzing");
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load architecture");
      setStatus("failed");
    } finally {
      setLoading(false);
    }
  }, [owner, repo, decodedRepoId]);

  useEffect(() => { fetchArchitecture(); }, [fetchArchitecture]);
  useEffect(() => {
    if (status !== "analyzing") return;
    const interval = setInterval(fetchArchitecture, 10_000);
    return () => clearInterval(interval);
  }, [status, fetchArchitecture]);

  async function triggerAnalysis() {
    try {
      setStatus("analyzing");
      const token = await getToken();
      await fetchApi(`${getApiBase(decodedRepoId)}/repos/${owner}/${repo}/analyze`, {
        method: "POST",
      }, token);
      setTimeout(fetchArchitecture, 5000);
    } catch {
      setError("Failed to trigger analysis");
      setStatus("failed");
    }
  }

  const statusColors: Record<AnalysisStatus, string> = {
    completed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    analyzing: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    failed: "text-red-400 bg-red-500/10 border-red-500/20",
    pending: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  };

  const statsCards = [
    { icon: Layers, label: "Modules", value: archMap ? archMap.nodes.length : "—", color: "text-indigo-400" },
    { icon: GitBranch, label: "Dependencies", value: archMap ? archMap.edges.length : "—", color: "text-purple-400" },
    { icon: Cpu, label: "Status", value: status, color: statusColors[status].split(" ")[0] },
    { icon: Code2, label: "Entry Points", value: archMap ? ((archMap as any).entryPoints?.length ?? "—") : "—", color: "text-cyan-400" },
  ];

  return (
    <DemoDashboardLayout
      title="Architecture Map"
      subtitle="Visual representation of your codebase structure and module dependencies"
      action={
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[status]}`}>
            {status}
          </span>
          {status === "completed" ? (
            <button onClick={triggerAnalysis} className="flex items-center gap-2 px-4 py-2 glass-hover rounded-lg text-sm font-medium text-brand-text-secondary hover:text-white transition-all border border-white/[0.08]">
              <RefreshCw className="w-3.5 h-3.5" />
              Re-analyze
            </button>
          ) : (status === "pending" || status === "failed") && !isDemo ? (
            <button onClick={triggerAnalysis} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-500/20">
              <Play className="w-3.5 h-3.5" fill="white" />
              Run Analysis
            </button>
          ) : null}
        </div>
      }
    >
      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-400/5 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statsCards.map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <p className="text-xs text-brand-muted font-medium uppercase tracking-wide">{s.label}</p>
            </div>
            <p className={`text-2xl font-bold capitalize ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Architecture map panel */}
      <div className="glass rounded-xl border border-white/[0.06] overflow-hidden" style={{ minHeight: 520 }}>
        {loading && !archMap ? (
          <div className="flex items-center justify-center h-[520px]">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
              <p className="text-brand-text-secondary font-medium">Loading architecture...</p>
            </div>
          </div>
        ) : archMap ? (
          <ErrorBoundary>
            <ArchitectureMap repoId={decodedRepoId} data={archMap} />
          </ErrorBoundary>
        ) : status === "analyzing" ? (
          <div className="flex items-center justify-center h-[520px]">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-5">
                <Loader2 className="w-16 h-16 text-amber-400/20 absolute" />
                <Loader2 className="w-16 h-16 text-amber-400 animate-spin absolute" style={{ clipPath: "inset(0 75% 0 0)" }} />
              </div>
              <p className="text-white font-semibold text-lg mb-2">Analyzing codebase...</p>
              <p className="text-brand-muted text-sm max-w-xs mx-auto">This takes 1-3 minutes for large repositories. The page will update automatically.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[520px]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
                <Play className="w-7 h-7 text-indigo-400" />
              </div>
              <p className="text-white font-semibold text-lg mb-2">No architecture analysis yet</p>
              <p className="text-brand-muted text-sm mb-6 max-w-sm mx-auto">Connect your repository and run analysis to generate an interactive architecture map.</p>
              {!isDemo && (
                <button onClick={triggerAnalysis} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-500/20">
                  Run Analysis
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tech stack */}
      {archMap?.techStack && Object.keys(archMap.techStack).length > 0 && (
        <div className="mt-4 glass rounded-xl border border-white/[0.06] p-5">
          <p className="text-xs text-brand-muted uppercase tracking-widest font-semibold mb-3">Tech Stack</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(archMap.techStack).map(([key, value]) => (
              <span key={key} className="text-xs px-3 py-1.5 rounded-lg bg-brand-surface border border-white/[0.06] text-brand-text-secondary">
                <span className="text-brand-muted">{key}:</span> {value}
              </span>
            ))}
          </div>
        </div>
      )}
    </DemoDashboardLayout>
  );
}
