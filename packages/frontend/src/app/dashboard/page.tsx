"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  RefreshCw,
  Github,
  AlertCircle,
  Loader2,
  FolderGit2,
  Play,
  ChevronRight,
  LayoutDashboard,
  Zap,
  Plus,
  Sparkles,
  Code2,
  GitBranch,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface RepoItem {
  repoId: string;
  analysisStatus: "pending" | "analyzing" | "completed" | "failed";
  lastAnalyzedAt?: string;
  fileCount?: number;
  techStack?: Record<string, string | undefined>;
}

const STATUS_CONFIG = {
  completed: {
    label: "Ready",
    text: "#34d399",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.2)",
    dot: "#34d399",
    glow: "rgba(52,211,153,0.3)",
  },
  analyzing: {
    label: "Analyzing",
    text: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.2)",
    dot: "#fbbf24",
    glow: "rgba(251,191,36,0.3)",
  },
  failed: {
    label: "Failed",
    text: "#fb7185",
    bg: "rgba(251,113,133,0.08)",
    border: "rgba(251,113,133,0.2)",
    dot: "#fb7185",
    glow: "rgba(251,113,133,0.3)",
  },
  pending: {
    label: "Pending",
    text: "#9ba8c5",
    bg: "rgba(155,168,197,0.06)",
    border: "rgba(155,168,197,0.15)",
    dot: "#4f5e80",
    glow: "transparent",
  },
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const fetchRepos = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const endpoint = isDemo ? `${API_BASE}/demo/repos` : `${API_BASE}/repos`;
      const res = await fetchApi(endpoint, {}, token);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRepos(Array.isArray(data) ? data : data.repos ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load repos");
    } finally {
      setLoading(false);
    }
  }, [isDemo, getToken]);

  useEffect(() => {
    fetchRepos();
    const interval = setInterval(fetchRepos, 15_000);
    return () => clearInterval(interval);
  }, [fetchRepos]);

  const demoSuffix = isDemo ? "?demo=true" : "";

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-mid)" }}>

      {/* ── Animated background orbs ─────────────────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="orb orb-indigo animate-float" style={{ width: 600, height: 600, left: -200, top: -200, opacity: 0.08 }} />
        <div className="orb orb-purple animate-float" style={{ width: 500, height: 500, right: -150, top: 100, opacity: 0.06, animationDelay: "2s" }} />
        <div className="orb orb-cyan animate-float" style={{ width: 400, height: 400, left: "40%", bottom: -100, opacity: 0.05, animationDelay: "1s" }} />
      </div>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <nav className="fixed left-0 top-0 w-[220px] h-full flex flex-col z-40 sidebar">
        <div className="h-[1px] w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)" }} />

        {/* Logo */}
        <div className="px-4 pt-5 pb-5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
            >
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-heading font-semibold text-sm gradient-text-indigo">
              AutoDev
            </span>
          </Link>
        </div>

        <div className="h-[1px] mx-4" style={{ background: "rgba(255,255,255,0.05)" }} />

        {/* Nav items */}
        <div className="flex-1 p-3 overflow-y-auto">
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Workspace
          </p>
          <Link
            href={`/dashboard${demoSuffix}`}
            className="nav-item"
            style={{ background: "rgba(99,102,241,0.12)", color: "#a5b4fc", boxShadow: "inset 2px 0 0 rgba(99,102,241,0.7)" }}
          >
            <LayoutDashboard className="w-[15px] h-[15px]" style={{ color: "#818cf8" }} />
            <span>Repositories</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="dot-live" />
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#9ba8c5" }}>Connected</span>
            </div>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              v0.1.0
            </span>
          </div>
        </div>
      </nav>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="ml-[220px] flex-1 relative z-10">

        {/* Demo Banner */}
        {isDemo && (
          <div
            className="flex items-center justify-center gap-3 py-2.5 text-xs font-semibold"
            style={{
              background: "linear-gradient(90deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)",
              borderBottom: "1px solid rgba(99,102,241,0.2)",
              color: "#a5b4fc",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Demo Mode — Exploring pre-analyzed repositories
            <Link href="/dashboard" className="ml-2 underline opacity-70 hover:opacity-100 transition-opacity">
              Exit
            </Link>
          </div>
        )}

        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-8 py-4"
          style={{
            background: "rgba(8,12,24,0.9)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="page-header-line" />
            <div>
              <h1 className="font-heading font-semibold text-lg tracking-tight" style={{ color: "var(--text-primary)" }}>
                {isDemo ? "Demo Repositories" : "Connected Repositories"}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {isDemo ? "Pre-analyzed repos for exploring AutoDev." : "Manage your connected GitHub repositories."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchRepos}
              className="btn-ghost flex items-center gap-2 px-3 py-2 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            {!isDemo && (
              <a
                href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL || "https://github.com/apps/autodev/installations/new"}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2 px-4 py-2 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Connect Repo
              </a>
            )}
          </div>
        </div>

        <div className="p-8">

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm"
              style={{ background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.2)", color: "#fb7185" }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Failed to load repositories: {error}</span>
            </div>
          )}

          {/* Loading */}
          {loading && repos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 animate-glow-pulse"
                style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}
              >
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#818cf8" }} />
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Fetching repositories…</p>
            </div>

          ) : repos.length === 0 ? (
            /* ── Empty state ──────────────────────────────────────────────── */
            <div className="flex flex-col items-center justify-center py-24">

              {/* Glowing icon */}
              <div className="relative mb-8">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center animate-glow-pulse"
                  style={{
                    background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.12) 100%)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    boxShadow: "0 0 40px rgba(99,102,241,0.12)",
                  }}
                >
                  <FolderGit2 className="w-9 h-9" style={{ color: "#818cf8" }} />
                </div>
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)", boxShadow: "0 2px 8px rgba(99,102,241,0.4)" }}
                >
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>

              <h3 className="font-heading font-semibold text-xl mb-3" style={{ color: "var(--text-primary)" }}>
                No repositories connected
              </h3>
              <p className="text-sm text-center mb-8 max-w-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Install the AutoDev GitHub App to start analyzing your codebase structure, conventions, and architecture.
              </p>

              <div className="flex items-center gap-3">
                <a
                  href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL || "https://github.com/apps/autodev/installations/new"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm cursor-pointer"
                >
                  <Github className="w-4 h-4" />
                  Install GitHub App
                </a>
                <Link href="/dashboard?demo=true">
                  <button className="btn-ghost flex items-center gap-2 px-5 py-2.5 text-sm cursor-pointer">
                    <Play className="w-4 h-4" />
                    Try Demo Mode
                  </button>
                </Link>
              </div>

              {/* Feature hints */}
              <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg">
                {[
                  { icon: Code2, label: "Architecture Map", desc: "Visualize module structure" },
                  { icon: GitBranch, label: "Q&A", desc: "Ask about your codebase" },
                  { icon: Zap, label: "Walkthroughs", desc: "Step-by-step code guides" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center text-center p-4 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <Icon className="w-5 h-5 mb-2" style={{ color: "#818cf8" }} />
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>{label}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>

          ) : (
            /* ── Repo grid ─────────────────────────────────────────────────── */
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {repos.map((repo, i) => {
                const status = STATUS_CONFIG[repo.analysisStatus] ?? STATUS_CONFIG.pending;
                return (
                  <Link
                    key={repo.repoId}
                    href={`/dashboard/${encodeURIComponent(repo.repoId)}${demoSuffix}`}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="glass-card rounded-xl p-5 cursor-pointer group h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.15)" }}
                        >
                          <FolderGit2 className="w-5 h-5" style={{ color: "#818cf8" }} />
                        </div>
                        <ChevronRight
                          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                          style={{ color: "var(--text-muted)" }}
                        />
                      </div>

                      {/* Repo name */}
                      <h3 className="font-heading font-semibold text-sm leading-tight mb-3 group-hover:text-indigo-300 transition-colors" style={{ color: "var(--text-primary)" }}>
                        {repo.repoId}
                      </h3>

                      {/* Status badge */}
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                          style={{ background: status.bg, border: `1px solid ${status.border}`, color: status.text }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{
                              background: status.dot,
                              boxShadow: `0 0 6px ${status.glow}`,
                              ...(repo.analysisStatus === "analyzing" ? { animation: "pulse-dot 2s infinite" } : {}),
                            }}
                          />
                          {status.label}
                        </span>
                        {repo.fileCount && (
                          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                            {repo.fileCount.toLocaleString()} files
                          </span>
                        )}
                      </div>

                      {/* Tech stack pills */}
                      {repo.techStack && Object.keys(repo.techStack).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                          {Object.entries(repo.techStack)
                            .filter(([, v]) => v)
                            .slice(0, 4)
                            .map(([k, v]) => (
                              <span
                                key={k}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "var(--text-secondary)" }}
                              >
                                {v}
                              </span>
                            ))}
                        </div>
                      )}

                      {/* Footer */}
                      {repo.lastAnalyzedAt && (
                        <div className="mt-auto pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            Last analyzed {new Date(repo.lastAnalyzedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-mid)" }}>
          <div
            className="flex flex-col items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center animate-glow-pulse"
              style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}
            >
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#818cf8" }} />
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
