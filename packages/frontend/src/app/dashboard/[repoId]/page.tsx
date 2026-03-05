"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import ArchitectureMap from "@/components/ArchitectureMap";
import DashboardSidebar from "@/components/DashboardSidebar";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import type { ArchitectureMap as ArchMapType } from "@autodev/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2, RefreshCw, Play } from "lucide-react";

type AnalysisStatus = "pending" | "analyzing" | "completed" | "failed";

export default function RepoDetailPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [archMap, setArchMap] = useState<ArchMapType | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const fetchArchitecture = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetchApi(`${getApiBase(decodedRepoId)}/analysis/${owner}/${repo}/architecture`, {}, token);
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
      } else if (data.nodes) {
        setArchMap(data as ArchMapType);
        setStatus("completed");
      } else {
        setStatus("analyzing");
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load architecture");
    } finally {
      setLoading(false);
    }
  }, [owner, repo, decodedRepoId]);

  useEffect(() => {
    fetchArchitecture();
  }, [fetchArchitecture]);

  // Poll while analyzing
  useEffect(() => {
    if (status !== "analyzing") return;
    const interval = setInterval(fetchArchitecture, 10_000);
    return () => clearInterval(interval);
  }, [status, fetchArchitecture]);

  async function triggerAnalysis() {
    try {
      setStatus("analyzing");
      const token = await getToken();
      await fetchApi(`${getApiBase(decodedRepoId)}/repos/analyze`, {
        method: "POST",
        body: JSON.stringify({ repoId: decodedRepoId }),
      }, token);
      // Start polling
      setTimeout(fetchArchitecture, 5000);
    } catch {
      setError("Failed to trigger analysis");
    }
  }

  const statusConfig: Record<AnalysisStatus, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    completed: { variant: "outline", className: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
    analyzing: { variant: "outline", className: "text-amber-400 border-amber-500/20 bg-amber-500/10 animate-pulse" },
    failed: { variant: "destructive", className: "text-red-400 border-red-500/20 bg-red-500/10" },
    pending: { variant: "secondary", className: "text-brand-muted border-brand-border/30" },
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <DashboardSidebar repoId={repoId} decodedRepoId={decodedRepoId} />

      {/* Main content */}
      <main className="ml-[260px] p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-brand-text">Architecture Map</h1>
            <p className="text-brand-text-secondary text-sm mt-2">Visual representation of your codebase structure</p>
          </div>
          <div className="flex gap-3 items-center">
            <Badge variant={statusConfig[status].variant} className={statusConfig[status].className}>
              {status}
            </Badge>
            {(status === "pending" || status === "failed") && (
              <Button
                onClick={triggerAnalysis}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-glow hover:shadow-glow-lg text-white border-0"
              >
                <Play className="w-4 h-4 mr-2" />
                {status === "failed" ? "Retry Analysis" : "Run Analysis"}
              </Button>
            )}
            {status === "completed" && (
              <Button
                variant="outline"
                onClick={triggerAnalysis}
                className="glass-hover border-white/[0.08]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-analyze
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Card className="mb-6 glass border-red-500/20 bg-transparent">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Architecture Map */}
        {loading && !archMap ? (
          <Card className="glass border-white/[0.08] bg-transparent">
            <CardContent className="h-[500px] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
                <p className="text-brand-text-secondary font-medium">Loading architecture...</p>
              </div>
            </CardContent>
          </Card>
        ) : archMap ? (
          <Card className="glass border-white/[0.08] overflow-hidden bg-transparent">
            <ArchitectureMap data={archMap} />
          </Card>
        ) : status === "analyzing" ? (
          <Card className="glass border-white/[0.08] bg-transparent">
            <CardContent className="h-[500px] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-4" />
                <p className="text-brand-text text-lg mb-2 font-heading font-semibold">Analysis in progress...</p>
                <p className="text-brand-muted text-sm">This may take a few minutes for large repositories</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass border-white/[0.08] bg-transparent">
            <CardContent className="h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-5">
                  <Play className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-brand-text text-lg mb-2 font-heading font-semibold">No architecture analysis yet</p>
                <p className="text-brand-muted text-sm mb-8 max-w-md mx-auto">
                  Run analysis to generate the architecture map
                </p>
                <Button
                  onClick={triggerAnalysis}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-glow hover:shadow-glow-lg text-white border-0"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Card className="glass border-white/[0.08] bg-transparent">
            <CardContent className="p-5">
              <p className="text-brand-text-secondary text-sm mb-1">Status</p>
              <p className="text-xl font-heading font-semibold capitalize text-brand-text">{status}</p>
            </CardContent>
          </Card>
          <Card className="glass border-white/[0.08] bg-transparent">
            <CardContent className="p-5">
              <p className="text-brand-text-secondary text-sm mb-1">Modules Detected</p>
              <p className="text-xl font-heading font-semibold text-brand-text">{archMap ? archMap.nodes.length : "—"}</p>
            </CardContent>
          </Card>
          <Card className="glass border-white/[0.08] bg-transparent">
            <CardContent className="p-5">
              <p className="text-brand-text-secondary text-sm mb-1">Dependencies</p>
              <p className="text-xl font-heading font-semibold text-brand-text">{archMap ? archMap.edges.length : "—"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        {archMap?.techStack && Object.keys(archMap.techStack).length > 0 && (
          <Card className="mt-6 glass border-white/[0.08] bg-transparent">
            <CardContent className="p-5">
              <p className="text-brand-text-secondary text-sm mb-3 font-medium">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(archMap.techStack).map(([key, value]) => (
                  <Badge key={key} variant="outline" className="bg-white/[0.02] text-brand-text-secondary border-white/[0.06]">
                    <span className="text-brand-muted">{key}:</span> {value}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
