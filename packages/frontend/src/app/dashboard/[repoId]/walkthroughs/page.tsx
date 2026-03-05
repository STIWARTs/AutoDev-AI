"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import WalkthroughViewer from "@/components/WalkthroughViewer";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useProgressTracker } from "@/hooks/useProgressTracker";
import type { Walkthrough } from "@autodev/shared";

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
      const res = await fetchApi(`${getApiBase(decodedRepoId)}/walkthroughs/${owner}/${repo}`, {}, token);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWalkthroughs(data.walkthroughs || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load walkthroughs");
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    fetchWalkthroughs();
  }, [fetchWalkthroughs]);

  async function generateWalkthrough() {
    if (!question.trim()) return;
    try {
      setGenerating(true);
      const token = await getToken();
      const res = await fetchApi(`${getApiBase(decodedRepoId)}/walkthroughs/${owner}/${repo}`, {
        method: "POST",
        body: JSON.stringify({ question: question.trim() }),
      }, token);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.walkthrough) {
        setSelected(data.walkthrough);
        setWalkthroughs((prev) => [...prev, data.walkthrough]);
        track({
          eventType: "walkthrough_viewed",
          targetId: data.walkthrough.id,
          targetLabel: data.walkthrough.title || question,
        });
      }
      setQuestion("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate walkthrough");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 w-64 h-full glass-strong border-r border-white/[0.06] p-6">
        <Link
          href="/dashboard"
          className="text-xl font-bold mb-6 block text-gradient font-heading"
        >
          AutoDev
        </Link>
        <p className="text-sm text-brand-text-secondary mb-4">{decodedRepoId}</p>
        <ul className="space-y-1">
          <li>
            <Link href={`/dashboard/${repoId}`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
              Architecture Map
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/${repoId}/animated`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
              Animated Map
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/${repoId}/walkthroughs`} className="block px-3 py-2 rounded-lg bg-white/[0.06] text-brand-text text-sm font-medium">
              Walkthroughs
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/${repoId}/conventions`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
              Conventions
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/${repoId}/env-setup`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
              Env Setup
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/${repoId}/qa`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
              Q&A
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/${repoId}/progress`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
              My Progress
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/${repoId}/team`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
              Team
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main content */}
      <main className="ml-64 p-8">
        {selected ? (
          <WalkthroughViewer
            walkthrough={selected}
            onBack={() => setSelected(null)}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold font-heading">Walkthroughs</h1>
            </div>

            {/* Generate custom walkthrough */}
            <div className="mb-8 p-5 glass rounded-xl">
              <h2 className="text-sm font-medium font-heading text-brand-text-secondary uppercase tracking-wide mb-3">
                Ask a question to generate a walkthrough
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && generateWalkthrough()}
                  placeholder="e.g., How does the authentication flow work?"
                  className="flex-1 px-4 py-2.5 bg-brand-surface border border-white/[0.06] rounded-lg text-sm text-white placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={generateWalkthrough}
                  disabled={!question.trim() || generating}
                  className="px-5 py-2.5 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90 shadow-glow rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate"
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 border border-red-500/20 bg-red-400/10 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Walkthrough list */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="inline-block w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-brand-text-secondary">Loading walkthroughs...</p>
                </div>
              </div>
            ) : walkthroughs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {walkthroughs.map((w, i) => (
                  <button
                    key={w.id || i}
                    onClick={() => {
                      setSelected(w);
                      track({
                        eventType: "walkthrough_viewed",
                        targetId: w.id,
                        targetLabel: w.title || w.question,
                      });
                    }}
                    className="text-left p-5 glass rounded-xl hover:border-white/[0.06] hover:bg-white/[0.04] transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                        {w.title || `Walkthrough ${i + 1}`}
                      </h3>
                      {w.difficulty && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            w.difficulty === "beginner"
                              ? "text-accent-green bg-accent-green/10"
                              : w.difficulty === "intermediate"
                              ? "text-accent-amber bg-accent-amber/10"
                              : "text-red-400 bg-red-400/10"
                          }`}
                        >
                          {w.difficulty}
                        </span>
                      )}
                    </div>
                    {w.description && (
                      <p className="text-sm text-brand-text-secondary mb-3 line-clamp-2">{w.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-brand-muted">
                      <span>{w.steps?.length || 0} steps</span>
                      {w.estimatedMinutes && <span>~{w.estimatedMinutes} min</span>}
                      {w.question && <span className="truncate">Q: {w.question}</span>}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 glass rounded-xl">
                <p className="text-brand-text-secondary text-lg mb-2">No walkthroughs yet</p>
                <p className="text-brand-muted text-sm">
                  Ask a question above to generate your first walkthrough, or run analysis to auto-generate them.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
