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
import { Play, RefreshCw, AlertCircle, Cpu, GitBranch, Layers, Code2 } from "lucide-react";

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
    analyzing:  "text-amber-400 bg-amber-500/10 border-amber-500/20",
    failed:     "text-red-400 bg-red-500/10 border-red-500/20",
    pending:    "text-brand-muted bg-brand-surface border-brand-border",
  };

  const statsCards = [
    { icon: Layers,    label: "Modules",      value: archMap ? archMap.nodes.length : "—" },
    { icon: GitBranch, label: "Dependencies",  value: archMap ? archMap.edges.length : "—" },
    { icon: Cpu,       label: "Status",        value: status,  statusKey: status },
    { icon: Code2,     label: "Entry Points",  value: archMap ? ((archMap as any).entryPoints?.length ?? "—") : "—" },
  ];

  return (
    <DemoDashboardLayout
      title="Architecture Map"
      subtitle="Visual representation of your codebase structure and module dependencies"
      action={
        <div className="flex items-center gap-3">
          <span className={`text-[10px] px-2.5 py-1 border font-mono uppercase tracking-wide ${statusColors[status]}`}>
            {status}
          </span>
          {status === "completed" ? (
            <button
              onClick={triggerAnalysis}
              className="flex items-center gap-2 px-4 py-2 border border-brand-border text-brand-muted hover:border-brand-muted hover:text-brand-text text-sm font-mono transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-analyze
            </button>
          ) : (status === "pending" || status === "failed") && !isDemo ? (
            <button
              onClick={triggerAnalysis}
              className="flex items-center gap-2 px-4 py-2 bg-brand-DEFAULT hover:bg-brand-DEFAULT/90 text-brand-bg text-sm font-mono font-semibold transition-colors"
            >
              <Play className="w-3.5 h-3.5" fill="currentColor" />
              Run Analysis
            </button>
          ) : null}
        </div>
      }
    >
      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 border border-red-500/20 bg-red-500/5 text-red-300 text-sm font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statsCards.map((s) => (
          <div
            key={s.label}
            className="bg-brand-surface border border-brand-border p-4 relative overflow-hidden group hover:border-brand-DEFAULT/30 transition-colors"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-DEFAULT opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-brand-DEFAULT" />
              <p className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold">{s.label}</p>
            </div>
            <p className={`text-2xl font-heading font-bold capitalize ${
              s.statusKey ? statusColors[s.statusKey as AnalysisStatus].split(" ")[0] : "text-brand-text"
            }`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Architecture map panel */}
      <div className="bg-brand-surface border border-brand-border overflow-hidden" style={{ minHeight: 520 }}>
        {loading && !archMap ? (
          <div className="flex items-center justify-center h-[520px]">
            <div className="text-center">
              {/* 5-bar equalizer */}
              <div className="flex items-end gap-1 mx-auto mb-5" style={{ width: 52, height: 40 }}>
                {[0.45, 0.75, 1.0, 0.75, 0.45].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-brand-DEFAULT eq-bar"
                    style={{
                      height: `${h * 100}%`,
                      animationDelay: `${i * 0.12}s`,
                    }}
                  />
                ))}
              </div>
              <p className="text-brand-muted text-sm font-mono">Loading architecture...</p>
            </div>
          </div>
        ) : archMap ? (
          <ErrorBoundary>
            <ArchitectureMap repoId={decodedRepoId} data={archMap} />
          </ErrorBoundary>
        ) : status === "analyzing" ? (
          <div className="flex items-center justify-center h-[520px]">
            <div className="text-center">
              {/* Equalizer with amber tint while analyzing */}
              <div className="flex items-end gap-1 mx-auto mb-5" style={{ width: 52, height: 40 }}>
                {[0.45, 0.75, 1.0, 0.75, 0.45].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-amber-400 eq-bar"
                    style={{ height: `${h * 100}%`, animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
              <p className="text-brand-text font-heading font-semibold text-lg mb-2">Analyzing codebase...</p>
              <p className="text-brand-muted text-sm font-mono max-w-xs mx-auto">
                This takes 1–3 minutes for large repositories. The page will update automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[520px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-DEFAULT/10 border border-brand-DEFAULT/20 flex items-center justify-center mx-auto mb-5">
                <Play className="w-7 h-7 text-brand-DEFAULT" />
              </div>
              <p className="text-brand-text font-heading font-semibold text-lg mb-2">No architecture analysis yet</p>
              <p className="text-brand-muted text-sm font-mono mb-6 max-w-sm mx-auto">
                Connect your repository and run analysis to generate an interactive architecture map.
              </p>
              {!isDemo && (
                <button
                  onClick={triggerAnalysis}
                  className="px-5 py-2.5 bg-brand-DEFAULT hover:bg-brand-DEFAULT/90 text-brand-bg text-sm font-mono font-semibold transition-colors"
                >
                  Run Analysis
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tech stack */}
      {archMap?.techStack && Object.keys(archMap.techStack).length > 0 && (
        <div className="mt-4 bg-brand-surface border border-brand-border p-5">
          <p className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold mb-3">Tech Stack</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(archMap.techStack).map(([key, value]) => (
              <span
                key={key}
                className="text-xs px-3 py-1.5 bg-brand-bg border border-brand-border text-brand-muted font-mono"
              >
                <span className="text-brand-DEFAULT">{key}:</span> {value}
              </span>
            ))}
          </div>
        </div>
      )}
    </DemoDashboardLayout>
  );
}
