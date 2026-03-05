"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import WalkthroughViewer from "@/components/WalkthroughViewer";
import DemoDashboardLayout from "@/components/DemoDashboardLayout";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useProgressTracker } from "@/hooks/useProgressTracker";
import type { Walkthrough } from "@autodev/shared";
import { BookOpen, Sparkles, Clock, ChevronRight, Loader2, AlertCircle, Search } from "lucide-react";

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
      <div className="glass rounded-xl border border-white/[0.06] p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <p className="text-sm font-semibold text-white">Generate a walkthrough</p>
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
              className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-white/[0.06] rounded-lg text-sm text-white placeholder-brand-muted focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500/40 transition-all"
            />
          </div>
          <button
            onClick={generateWalkthrough}
            disabled={!question.trim() || generating}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
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
              className="text-xs px-3 py-1.5 rounded-full border border-white/[0.06] bg-brand-surface text-brand-text-secondary hover:border-indigo-500/30 hover:text-indigo-300 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-400/5 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
            <p className="text-brand-text-secondary">Loading walkthroughs...</p>
          </div>
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
              className="text-left p-5 glass rounded-xl border border-white/[0.06] hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                </div>
                {w.difficulty && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide ${DIFFICULTY_COLORS[w.difficulty] || ""}`}>
                    {w.difficulty}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-white mb-1.5 group-hover:text-indigo-300 transition-colors">
                {w.title || `Walkthrough ${i + 1}`}
              </h3>
              {w.description && (
                <p className="text-sm text-brand-text-secondary mb-3 line-clamp-2">{w.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-brand-muted">
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{w.steps?.length || 0} steps</span>
                {w.estimatedMinutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{w.estimatedMinutes} min</span>}
                <span className="ml-auto flex items-center gap-1 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Start <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl border border-white/[0.06] flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-indigo-400" />
          </div>
          <p className="text-white font-semibold mb-1">No walkthroughs yet</p>
          <p className="text-brand-muted text-sm text-center max-w-xs">Ask a question above to generate your first walkthrough.</p>
        </div>
      )}
    </DemoDashboardLayout>
  );
}
