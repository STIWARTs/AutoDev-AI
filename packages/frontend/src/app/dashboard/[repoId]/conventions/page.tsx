"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import DemoDashboardLayout from "@/components/DemoDashboardLayout";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useProgressTracker } from "@/hooks/useProgressTracker";
import type { Convention } from "@autodev/shared";
import { Loader2, AlertCircle, Wand2, CheckCircle2, AlertTriangle, Info, Search, Tag } from "lucide-react";

const SEVERITY_CONFIG: Record<string, { icon: typeof CheckCircle2; className: string; label: string }> = {
  "must-follow":   { icon: CheckCircle2,   className: "text-red-400 bg-red-500/10 border-red-500/20",     label: "Must Follow" },
  "should-follow": { icon: AlertTriangle,  className: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "Should Follow" },
  "nice-to-have":  { icon: Info,           className: "text-brand bg-brand/10 border-brand/20", label: "Nice to Have" },
};

const CATEGORY_COLORS: Record<string, string> = {
  Architecture:       "text-brand bg-brand/10 border-brand/20",
  "Error Handling":   "text-red-400 bg-red-500/10 border-red-500/20",
  Naming:             "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Testing:            "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "API Design":       "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  Security:           "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Styling:            "text-pink-400 bg-pink-500/10 border-pink-500/20",
  "State Management": "text-violet-400 bg-violet-500/10 border-violet-500/20",
};

export default function ConventionsPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [conventions, setConventions] = useState<Convention[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { getToken } = useAuth();
  const { track } = useProgressTracker(decodedRepoId);

  const fetchConventions = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetchApi(
        `${getApiBase(decodedRepoId)}/conventions/${owner}/${repo}`,
        {},
        token
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setConventions(data.conventions || []);
      if ((data.conventions || []).length > 0) {
        track({ eventType: "convention_viewed", targetLabel: `${decodedRepoId} conventions` });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conventions");
    } finally {
      setLoading(false);
    }
  }, [owner, repo, decodedRepoId]);

  useEffect(() => { fetchConventions(); }, [fetchConventions]);

  async function detectConventions() {
    try {
      setDetecting(true);
      const token = await getToken();
      await fetchApi(`${getApiBase(decodedRepoId)}/conventions/${owner}/${repo}`, { method: "POST" }, token);
      await fetchConventions();
    } catch { /* ignore */ } finally {
      setDetecting(false);
    }
  }

  const categories = ["all", ...Array.from(new Set(conventions.map((c) => c.category)))];
  const filtered = conventions.filter((c) => {
    const matchCat = filter === "all" || c.category === filter;
    const matchSearch = !search || c.pattern.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    total:        conventions.length,
    mustFollow:   conventions.filter((c) => c.severity === "must-follow").length,
    shouldFollow: conventions.filter((c) => c.severity === "should-follow").length,
  };

  return (
    <DemoDashboardLayout
      title="Conventions"
      subtitle="Coding patterns and rules detected in this codebase"
      action={
        <button
          onClick={detectConventions}
          disabled={detecting}
          className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand/90 disabled:opacity-50 text-brand-bg text-sm font-mono font-semibold transition-colors"
        >
          {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {detecting ? "Detecting..." : "Re-detect"}
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Conventions", value: stats.total,        color: "text-brand-text" },
          { label: "Must Follow",        value: stats.mustFollow,   color: "text-red-400" },
          { label: "Should Follow",      value: stats.shouldFollow, color: "text-amber-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-brand-surface border border-brand-border p-4 group hover:border-brand/30 transition-colors relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold mb-1">{s.label}</p>
            <p className={`text-3xl font-heading font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conventions..."
            className="w-full pl-9 pr-3 py-2 bg-brand-surface border border-brand-border text-xs text-brand-text placeholder-brand-muted font-mono focus:outline-none focus:border-brand/60 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-xs font-mono transition-all capitalize border ${
                filter === cat
                  ? "bg-brand/10 text-brand border-brand/20"
                  : "bg-brand-surface border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 p-4 border border-red-500/20 bg-red-500/5 text-red-300 text-sm font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Convention cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-brand-surface border border-brand-border p-5 animate-pulse">
              <div className="flex gap-2 mb-3">
                <div className="h-5 w-20 bg-brand-card" />
                <div className="h-5 w-24 bg-brand-card" />
              </div>
              <div className="h-4 w-48 bg-brand-card mb-2" />
              <div className="h-3 w-full bg-brand-card" />
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((conv, i) => {
            const sevConf = SEVERITY_CONFIG[conv.severity || "should-follow"] || SEVERITY_CONFIG["should-follow"];
            const SevIcon = sevConf.icon;
            const catColor = CATEGORY_COLORS[conv.category] || "text-brand-muted bg-brand-surface border-brand-border";
            return (
              <div
                key={i}
                className="bg-brand-surface border border-brand-border p-5 hover:border-brand/30 transition-colors relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2.5 py-1 border font-semibold uppercase tracking-wide font-mono ${catColor}`}>
                      <Tag className="w-2.5 h-2.5 inline mr-0.5" />
                      {conv.category}
                    </span>
                    <span className={`text-[10px] px-2.5 py-1 border font-semibold font-mono flex items-center gap-1 ${sevConf.className}`}>
                      <SevIcon className="w-2.5 h-2.5" />
                      {sevConf.label}
                    </span>
                    {conv.confidence && (
                      <span className="text-[10px] px-2 py-0.5 border border-brand-border text-brand-muted font-mono">
                        {Math.round(conv.confidence * 100)}% confident
                      </span>
                    )}
                  </div>
                </div>
                <code className="text-sm font-mono text-brand mb-2 block">{conv.pattern}</code>
                <p className="text-sm text-brand-text mb-3 font-body">{conv.description}</p>
                {(conv.doExample || conv.dontExample) && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {conv.doExample && (
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/15">
                        <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wide mb-1.5 font-mono">Do</p>
                        <code className="text-xs text-brand-muted font-mono whitespace-pre-wrap">{conv.doExample}</code>
                      </div>
                    )}
                    {conv.dontExample && (
                      <div className="p-3 bg-red-500/5 border border-red-500/15">
                        <p className="text-[10px] text-red-500 font-semibold uppercase tracking-wide mb-1.5 font-mono">Don&apos;t</p>
                        <code className="text-xs text-brand-muted font-mono whitespace-pre-wrap">{conv.dontExample}</code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-brand-surface border border-brand-border border-dashed flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
            <Wand2 className="w-6 h-6 text-brand" />
          </div>
          <p className="text-brand-text font-heading font-semibold mb-1">No conventions found</p>
          <p className="text-brand-muted text-sm font-mono">Click Re-detect to analyze this codebase.</p>
        </div>
      )}
    </DemoDashboardLayout>
  );
}
