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
  Code2,
  Plus,
  GitBranch,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const STATUS = {
  completed: { label: "Completed", color: "text-emerald-400", dot: "bg-emerald-400", border: "border-emerald-400/20", bg: "bg-emerald-400/5" },
  analyzing: { label: "Analyzing", color: "text-amber-400",   dot: "bg-amber-400 animate-pulse", border: "border-amber-400/20", bg: "bg-amber-400/5" },
  failed:    { label: "Failed",    color: "text-red-400",     dot: "bg-red-400",   border: "border-red-400/20",   bg: "bg-red-400/5"   },
  pending:   { label: "Pending",   color: "text-brand-muted", dot: "bg-brand-muted", border: "border-brand-border", bg: "bg-brand-surface" },
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
    <div className="flex min-h-screen bg-brand-bg font-body">

      {/* Grid texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(226,90,52,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(226,90,52,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <nav className="fixed left-0 top-0 w-[248px] h-full flex flex-col z-40 bg-brand-bg border-r border-brand-border">

        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-brand-DEFAULT flex items-center justify-center flex-shrink-0">
              <Code2 className="w-3.5 h-3.5 text-brand-bg" />
            </div>
            <span className="font-heading font-semibold text-brand-text text-base tracking-tight">AutoDev</span>
          </Link>
        </div>

        <div className="h-px bg-brand-border mx-5" />

        {/* Nav */}
        <div className="flex-1 px-3 py-3">
          <p className="px-3 mb-2 text-[9px] uppercase tracking-widest text-brand-muted font-semibold">Workspace</p>
          <Link
            href={`/dashboard${demoSuffix}`}
            className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-brand-DEFAULT bg-brand-DEFAULT/5 border border-brand-DEFAULT/20 relative"
          >
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-brand-DEFAULT" />
            <LayoutDashboard className="w-[14px] h-[14px] text-brand-DEFAULT" />
            Repositories
          </Link>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-border">
          <div className="flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wider">Connected</span>
            </div>
            <span className="text-[10px] font-mono text-brand-muted border border-brand-border px-1.5 py-0.5">v0.1.0</span>
          </div>
        </div>
      </nav>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="ml-[248px] flex-1 relative z-10">

        {/* Demo banner */}
        {isDemo && (
          <div className="flex items-center justify-center gap-3 py-2 text-xs font-mono bg-brand-DEFAULT/5 border-b border-brand-DEFAULT/20 text-brand-DEFAULT">
            <Zap className="w-3 h-3" />
            Demo Mode — Exploring pre-analyzed repositories
            <Link href="/dashboard" className="ml-2 underline opacity-60 hover:opacity-100 transition-opacity">Exit</Link>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between px-8 py-6 border-b border-brand-border bg-brand-bg sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-heading font-semibold text-brand-text tracking-tight">
              {isDemo ? "Sample Repositories" : "Connected Repositories"}
            </h1>
            <p className="text-brand-muted text-xs mt-1 font-mono">
              {isDemo ? "Explore pre-analyzed repos to see AutoDev in action." : "Manage your connected GitHub repositories."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRepos}
              className="bg-transparent border-brand-border text-brand-muted hover:border-brand-muted hover:text-brand-text rounded-none h-8 px-3 text-xs font-mono transition-colors"
            >
              <RefreshCw className="w-3 h-3 mr-1.5" /> Refresh
            </Button>
            {!isDemo && (
              <a
                href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL || "https://github.com/apps/autodev/installations/new"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-brand-text text-brand-bg hover:bg-brand-DEFAULT hover:text-brand-bg transition-colors px-4 h-8 text-xs font-semibold rounded-none"
              >
                <Plus className="w-3.5 h-3.5" /> Connect Repo
              </a>
            )}
          </div>
        </div>

        <div className="p-8">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 border border-red-500/20 bg-red-500/5 mb-6 text-sm text-red-400 font-mono">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Failed to load repositories: {error}
            </div>
          )}

          {/* Loading */}
          {loading && repos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="w-6 h-6 text-brand-DEFAULT animate-spin mb-4" />
              <p className="text-brand-muted font-mono text-xs uppercase tracking-widest">Fetching data…</p>
            </div>

          ) : repos.length === 0 ? (
            /* ── Empty state ──────────────────────────────────────────────── */
            <div className="border border-brand-border border-dashed">
              <div className="flex flex-col items-center text-center py-24 px-8">
                {/* Icon */}
                <div className="w-14 h-14 border border-brand-border bg-brand-surface flex items-center justify-center mb-6">
                  <FolderGit2 className="w-6 h-6 text-brand-muted" />
                </div>

                <h3 className="font-heading text-xl font-semibold text-brand-text mb-2">No repositories found.</h3>
                <p className="text-brand-muted font-mono text-sm mb-8 max-w-md leading-relaxed">
                  Install the AutoDev GitHub App to begin analyzing your codebase structure.
                </p>

                <div className="flex items-center gap-3">
                  <a
                    href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL || "https://github.com/apps/autodev/installations/new"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-brand-text text-brand-bg hover:bg-brand-DEFAULT hover:text-brand-bg transition-colors px-5 py-2.5 text-sm font-medium rounded-none"
                  >
                    <Github className="w-4 h-4" /> Install GitHub App
                  </a>
                  <Link href="/dashboard?demo=true">
                    <button className="inline-flex items-center gap-2 bg-transparent border border-brand-border text-brand-text hover:border-brand-DEFAULT hover:text-brand-DEFAULT transition-colors px-5 py-2.5 text-sm font-medium rounded-none cursor-pointer">
                      <Play className="w-4 h-4" /> Try Demo Mode
                    </button>
                  </Link>
                </div>

                {/* Feature grid */}
                <div className="mt-12 grid grid-cols-3 gap-px border border-brand-border max-w-md w-full">
                  {[
                    { icon: Code2, label: "Architecture Map", desc: "Module dependency graph" },
                    { icon: GitBranch, label: "Q&A", desc: "Ask about your codebase" },
                    { icon: Zap, label: "Walkthroughs", desc: "Step-by-step code guides" },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex flex-col items-center text-center p-5 bg-brand-surface">
                      <Icon className="w-4 h-4 text-brand-DEFAULT mb-2" />
                      <p className="text-xs font-semibold text-brand-text mb-1">{label}</p>
                      <p className="text-[11px] text-brand-muted font-mono">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          ) : (
            /* ── Repository grid ───────────────────────────────────────────── */
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {repos.map((repo) => {
                const s = STATUS[repo.analysisStatus] ?? STATUS.pending;
                return (
                  <Link
                    key={repo.repoId}
                    href={`/dashboard/${encodeURIComponent(repo.repoId)}${demoSuffix}`}
                  >
                    <div className="group border border-brand-border bg-brand-surface hover:border-brand-DEFAULT/40 hover:bg-brand-card transition-all duration-200 cursor-pointer h-full flex flex-col p-5 relative">
                      {/* Hover accent line top */}
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-brand-DEFAULT scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                      <div className="flex items-start justify-between mb-4">
                        <div className="w-9 h-9 bg-brand-card border border-brand-border flex items-center justify-center flex-shrink-0">
                          <FolderGit2 className="w-4 h-4 text-brand-muted" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-DEFAULT group-hover:translate-x-0.5 transition-all duration-200" />
                      </div>

                      <h3 className="font-heading font-semibold text-sm text-brand-text group-hover:text-brand-DEFAULT transition-colors leading-tight mb-3">
                        {repo.repoId}
                      </h3>

                      {/* Status */}
                      <div className="flex items-center gap-2.5 mb-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-1 border ${s.color} ${s.border} ${s.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                        {repo.fileCount && (
                          <span className="text-[11px] font-mono text-brand-muted">{repo.fileCount.toLocaleString()} files</span>
                        )}
                      </div>

                      {/* Tech pills */}
                      {repo.techStack && Object.keys(repo.techStack).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                          {Object.entries(repo.techStack)
                            .filter(([, v]) => v)
                            .slice(0, 4)
                            .map(([k, v]) => (
                              <span key={k} className="font-mono text-[10px] bg-brand-bg border border-brand-border px-2 py-0.5 text-brand-muted">
                                {v}
                              </span>
                            ))}
                        </div>
                      )}

                      {repo.lastAnalyzedAt && (
                        <div className="mt-auto pt-3 border-t border-brand-border">
                          <p className="font-mono text-[10px] text-brand-muted uppercase tracking-wider">
                            Analyzed • {new Date(repo.lastAnalyzedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
        <div className="min-h-screen bg-brand-bg flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-brand-DEFAULT animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
