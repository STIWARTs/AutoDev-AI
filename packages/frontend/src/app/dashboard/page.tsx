"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  RefreshCw,
  Plus,
  Github,
  AlertCircle,
  Loader2,
  FolderGit2,
  Code2,
  LayoutDashboard,
  Play,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
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
  }, [isDemo]);

  useEffect(() => {
    fetchRepos();
    const interval = setInterval(fetchRepos, 15_000);
    return () => clearInterval(interval);
  }, [fetchRepos]);

  const statusConfig: Record<string, { classes: string; dot: string }> = {
    completed: { classes: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400" },
    analyzing: { classes: "text-amber-400 bg-amber-400/10 border-amber-400/20", dot: "bg-amber-400 animate-pulse" },
    failed: { classes: "text-red-400 bg-red-400/10 border-red-400/20", dot: "bg-red-400" },
    pending: { classes: "text-brand-muted bg-brand-surface border-brand-border", dot: "bg-brand-muted" },
  };

  const demoSuffix = isDemo ? "?demo=true" : "";

  return (
    <div className="min-h-screen bg-brand-bg font-body selection:bg-brand-DEFAULT/30">
      {/* Demo banner */}
      <AnimatePresence>
        {isDemo && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-brand-DEFAULT text-brand-bg text-center py-2 text-sm font-semibold tracking-wide border-b border-brand-border shadow-sm flex items-center justify-center gap-3"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Demo Mode — Exploring pre-analyzed repositories</span>
            <Link href="/dashboard" className="ml-2 underline opacity-80 hover:opacity-100 transition-opacity">Exit</Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <nav className={`fixed left-0 ${isDemo ? "top-10" : "top-0"} w-[260px] h-full bg-brand-surface border-r border-brand-border flex flex-col z-40`}>
        <div className="px-6 py-5">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-8 h-8 rounded-sm bg-brand-DEFAULT flex items-center justify-center">
              <Code2 className="w-4 h-4 text-brand-bg" />
            </div>
            <span className="text-xl font-heading font-bold text-brand-text">AutoDev</span>
          </Link>
        </div>

        <Separator className="bg-brand-border" />

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <Link
              href={`/dashboard${demoSuffix}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-mono transition-colors duration-200 cursor-pointer bg-brand-card border border-brand-border text-brand-DEFAULT relative"
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-DEFAULT" />
              <LayoutDashboard className="w-4 h-4" />
              Repositories
            </Link>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-brand-border bg-brand-bg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-brand-muted uppercase tracking-wider">Connected</span>
            </div>
            <span className="text-xs font-mono text-brand-muted border border-brand-border px-1.5 py-0.5 rounded-sm">V0.1.0</span>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className={`ml-[260px] p-10 ${isDemo ? "pt-20" : ""}`}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex items-start justify-between mb-10 pb-6 border-b border-brand-border">
            <div>
              <h1 className="text-4xl font-heading font-semibold text-brand-text tracking-tight">
                {isDemo ? "Sample Repositories" : "Connected Repositories"}
              </h1>
              <p className="text-brand-muted font-mono text-sm mt-3">
                {isDemo ? "Explore pre-analyzed repos to see AutoDev in action." : "Manage your connected GitHub repositories."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRepos}
                className="bg-brand-surface border-brand-border text-brand-text hover:border-brand-muted transition-colors rounded-sm h-10 px-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
              {!isDemo && (
                <a
                  href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL || "https://github.com/apps/autodev/installations/new"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap bg-brand-text text-brand-bg hover:bg-brand-DEFAULT transition-colors border-0 rounded-sm h-10 px-5 font-semibold text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" /> Connect Repo
                </a>
              )}
            </div>
          </motion.div>

          {error && (
            <motion.div variants={fadeUp} className="mb-8">
              <Card className="bg-red-950/20 border-red-500/30 rounded-sm shadow-none">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                  <span className="text-red-300 font-mono text-sm">Failed to load repositories: {error}</span>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {loading && repos.length === 0 ? (
            <motion.div variants={fadeUp} className="text-center py-32">
              <Loader2 className="w-8 h-8 text-brand-DEFAULT animate-spin mx-auto mb-4" />
              <p className="text-brand-muted font-mono text-sm tracking-wide uppercase">Fetching data...</p>
            </motion.div>
          ) : repos.length === 0 ? (
            <motion.div variants={fadeUp}>
              <Card className="bg-brand-surface border border-brand-border border-dashed rounded-sm shadow-none">
                <CardContent className="text-center py-24 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-sm bg-brand-card border border-brand-border flex items-center justify-center mb-6">
                    <FolderGit2 className="w-8 h-8 text-brand-muted" />
                  </div>
                  <h3 className="text-brand-text text-xl mb-2 font-heading font-semibold">No repositories found.</h3>
                  <p className="text-brand-muted font-mono text-sm mb-8 max-w-md text-center">
                    Install the AutoDev GitHub App to begin analyzing your codebase structure.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <a
                      href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL || "https://github.com/apps/autodev/installations/new"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center whitespace-nowrap bg-brand-text text-brand-bg hover:bg-brand-DEFAULT transition-colors rounded-sm px-6 h-10 text-sm font-medium"
                    >
                      <Github className="w-4 h-4 mr-2" /> Install GitHub App
                    </a>
                    <Link href="/dashboard?demo=true">
                      <Button variant="outline" className="bg-brand-card border-brand-border hover:border-brand-DEFAULT transition-colors rounded-sm px-6 text-brand-text">
                        <Play className="w-4 h-4 mr-2" /> Try Demo Mode
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {repos.map((repo, i) => {
                const status = statusConfig[repo.analysisStatus] ?? statusConfig.pending;
                return (
                  <motion.div
                    key={repo.repoId}
                    variants={fadeUp}
                    custom={i}
                  >
                    <Link href={`/dashboard/${encodeURIComponent(repo.repoId)}${demoSuffix}`}>
                      <Card className="group bg-brand-surface hover:bg-brand-card border-brand-border hover:border-brand-DEFAULT transition-all duration-200 cursor-pointer h-full rounded-sm shadow-none flex flex-col">
                        <CardContent className="p-6 flex flex-col h-full relative">
                          <div className="flex items-start justify-between mb-4 gap-4">
                            <h3 className="font-heading font-semibold text-lg text-brand-text group-hover:text-brand-DEFAULT transition-colors duration-200 truncate flex-1 leading-tight">
                              {repo.repoId}
                            </h3>
                            <ChevronRight className="w-5 h-5 text-brand-muted group-hover:text-brand-DEFAULT group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                          </div>

                          <div className="flex items-center gap-3 mb-6">
                            <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider rounded-sm px-2 py-0.5 ${status.classes} border`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-1.5`} />
                              {repo.analysisStatus}
                            </Badge>
                            {repo.fileCount && (
                              <span className="font-mono text-xs text-brand-muted">{repo.fileCount} files</span>
                            )}
                          </div>

                          {repo.techStack && Object.keys(repo.techStack).length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                              {Object.entries(repo.techStack)
                                .filter(([, v]) => v)
                                .slice(0, 4)
                                .map(([k, v]) => (
                                  <span key={k} className="font-mono text-[10px] bg-brand-bg px-2 py-1 text-brand-muted border border-brand-border rounded-sm">
                                    {v}
                                  </span>
                                ))}
                            </div>
                          )}

                          {repo.lastAnalyzedAt && (
                            <div className="mt-auto pt-4 border-t border-brand-border/50">
                              <p className="font-mono text-[10px] text-brand-muted uppercase tracking-wider">
                                ANALYZED ON • {new Date(repo.lastAnalyzedAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-bg flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-DEFAULT animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
