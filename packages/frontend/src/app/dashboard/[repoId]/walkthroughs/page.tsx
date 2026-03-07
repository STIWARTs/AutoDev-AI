"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import WalkthroughViewer from "@/components/WalkthroughViewer";
import DemoDashboardLayout from "@/components/DemoDashboardLayout";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useProgressTracker } from "@/hooks/useProgressTracker";
import type { Walkthrough } from "@autodev/shared";
import { BookOpen, Sparkles, Clock, Loader2, AlertCircle, Search } from "lucide-react";

const DIFFICULTY_COLORS = {
  beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  advanced: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function WalkthroughsPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [walkthroughs, setWalkthroughs] = useState<Walkthrough[]>([]);
  const [selected, setSelected] = useState<Walkthrough | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const { track } = useProgressTracker(decodedRepoId);

  const fetchWalkthroughs = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetchApi(
        `${getApiBase(decodedRepoId)}/walkthroughs/${owner}/${repo}`,
        {},
        token
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWalkthroughs(data.walkthroughs || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load walkthroughs");
    } finally {
      setLoading(false);
    }
  }, [owner, repo, decodedRepoId]);

  useEffect(() => { fetchWalkthroughs(); }, [fetchWalkthroughs]);

  async function generateWalkthrough() {
    if (!question.trim()) return;
    try {
      setGenerating(true);
      const token = await getToken();
      const res = await fetchApi(
        `${getApiBase(decodedRepoId)}/walkthroughs/${owner}/${repo}`,
        { method: "POST", body: JSON.stringify({ question: question.trim() }) },
        token
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.walkthrough) {
        setSelected(data.walkthrough);
        setWalkthroughs((prev) => [data.walkthrough, ...prev]);
        track({ eventType: "walkthrough_viewed", targetId: data.walkthrough.id, targetLabel: data.walkthrough.title || question });
      }
      setQuestion("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate walkthrough");
    } finally {
      setGenerating(false);
    }
  }

  if (selected) {
    return (
      <DemoDashboardLayout title="Walkthrough" subtitle={selected.title}>
        <WalkthroughViewer walkthrough={selected} onBack={() => setSelected(null)} />
      </DemoDashboardLayout>
    );
  }

  const SUGGESTED = [
    "How does authentication work?",
    "What is the data flow?",
    "How are orders processed?",
  ];

  return (
    <DemoDashboardLayout
      title="Walkthroughs"
      subtitle="Step-by-step guided tours of complex code flows"
    >
      {/* Question input */}
      <div className="bg-brand-surface border border-brand-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-brand" />
          <p className="text-sm font-semibold text-brand-text">Generate a walkthrough</p>
        </div>
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateWalkthrough()}
              placeholder="e.g. How does the authentication flow work?"
              className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border focus:border-brand/60 text-sm text-brand-text placeholder-brand-muted focus:outline-none transition-all font-mono"
            />
          </div>
          <button
            onClick={generateWalkthrough}
            disabled={!question.trim() || generating}
            className="px-5 py-2.5 bg-brand text-brand-bg hover:bg-brand/90 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold transition-all flex items-center gap-2"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Generating..." : "Generate"}
          </button>
        </div>
        {/* Suggestions */}
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => setQuestion(s)}
              className="text-xs px-3 py-1.5 border border-brand-border bg-brand-surface text-brand-muted hover:border-brand/40 hover:text-brand transition-all font-mono"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 p-4 border border-red-500/20 bg-red-400/5 text-red-300 text-sm font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-5 bg-brand-surface border border-brand-border animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2">
                  <div className="w-8 h-4 bg-brand-card" />
                  <div className="w-8 h-8 bg-brand-card" />
                </div>
                <div className="w-16 h-4 bg-brand-card" />
              </div>
              <div className="h-3 bg-brand-card w-3/4 mb-2" />
              <div className="h-2.5 bg-brand-card w-full mb-1" />
              <div className="h-2.5 bg-brand-card w-2/3 mb-4" />
              <div className="flex gap-4">
                <div className="h-2.5 bg-brand-card w-14" />
                <div className="h-2.5 bg-brand-card w-10" />
              </div>
            </div>
          ))}
        </div>
      ) : walkthroughs.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {walkthroughs.map((w, i) => (
            <button
              key={w.id || i}
              onClick={() => {
                setSelected(w);
                track({ eventType: "walkthrough_viewed", targetId: w.id, targetLabel: w.title || w.question });
              }}
              className="text-left p-5 bg-brand-surface border border-brand-border hover:border-brand/40 hover:bg-brand-card transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-brand scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-brand-muted border border-brand-border px-1.5 py-0.5 bg-brand-bg">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-8 h-8 bg-brand-bg border border-brand-border flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-3.5 h-3.5 text-brand" />
                  </div>
                </div>
                {w.difficulty && (
                  <span className={`text-[10px] px-2 py-0.5 border font-semibold uppercase tracking-wide ${DIFFICULTY_COLORS[w.difficulty] || ""}`}>
                    {w.difficulty}
                  </span>
                )}
              </div>
              <h3 className="font-heading font-semibold text-sm text-brand-text mb-1.5 group-hover:text-brand transition-colors">
                {w.title || `Walkthrough ${i + 1}`}
              </h3>
              {w.description && (
                <p className="text-xs text-brand-muted mb-3 line-clamp-2 font-mono">{w.description}</p>
              )}
              <div className="flex items-center gap-4 text-[10px] text-brand-muted font-mono">
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{w.steps?.length || 0} steps</span>
                {w.estimatedMinutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{w.estimatedMinutes} min</span>}
                <span className="ml-auto text-brand opacity-0 group-hover:opacity-100 transition-opacity">Start →</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-brand-surface border border-brand-border border-dashed flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 bg-brand-bg border border-brand-border flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5 text-brand" />
          </div>
          <p className="font-heading font-semibold text-brand-text mb-1">No walkthroughs yet</p>
          <p className="text-brand-muted text-xs text-center max-w-xs font-mono">
            Ask a question above to generate your first guided walkthrough.
          </p>
        </div>
      )}
    </DemoDashboardLayout>
  );
}
