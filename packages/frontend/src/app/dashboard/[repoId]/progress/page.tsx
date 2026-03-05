"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import SkillRadar from "@/components/SkillRadar";
import ProgressTimeline from "@/components/ProgressTimeline";
import ModuleCompletionGrid from "@/components/ModuleCompletionGrid";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth, useUser } from "@clerk/nextjs";
import type { DeveloperProgress } from "@autodev/shared";

const DEFAULT_USER = "anonymous";

export default function ProgressPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [progress, setProgress] = useState<DeveloperProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const { user } = useUser();

  const fetchProgress = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      setLoading(true);
      const userId = user?.id || DEFAULT_USER;
      const token = await getToken();
      const res = await fetchApi(
        `${getApiBase(decodedRepoId)}/progress/${owner}/${repo}/${userId}`, {}, token
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DeveloperProgress = await res.json();
      setProgress(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load progress"
      );
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchProgress, 30_000);
    return () => clearInterval(interval);
  }, [fetchProgress]);

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
            <Link href={`/dashboard/${repoId}/walkthroughs`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
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
            <Link href={`/dashboard/${repoId}/progress`} className="block px-3 py-2 rounded-lg bg-white/[0.06] text-brand-text text-sm font-medium">
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-heading">My Learning Progress</h1>
          <button
            onClick={fetchProgress}
            className="px-4 py-2 glass-hover rounded-lg text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 border border-red-500/20 bg-red-400/10 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading && !progress ? (
          <div className="glass rounded-xl h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-brand-text-secondary">Loading progress...</p>
            </div>
          </div>
        ) : progress ? (
          <div className="space-y-8">
            {/* Top row: Skill Radar + Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skill Radar */}
              <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-semibold font-heading mb-4 text-white">
                  Skill Distribution
                </h2>
                <SkillRadar skills={progress.skills} size={320} />
              </div>

              {/* Progress Timeline */}
              <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-semibold font-heading mb-4 text-white">
                  Progress Over Time
                </h2>
                <ProgressTimeline
                  timeline={progress.timeline}
                  firstActivity={progress.firstActivity}
                  lastActivity={progress.lastActivity}
                  currentScore={progress.overallScore}
                />
              </div>
            </div>

            {/* Module Completion Grid */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-semibold font-heading mb-4 text-white">
                Module Completion
              </h2>
              <ModuleCompletionGrid
                skills={progress.skills}
                totalWalkthroughs={10}
                walkthroughsCompleted={progress.walkthroughsCompleted}
                totalConventions={8}
                conventionsViewed={progress.conventionsViewed}
                questionsAsked={progress.questionsAsked}
              />
            </div>

            {/* Summary stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-xl p-5">
                <p className="text-3xl font-bold text-white">
                  {progress.overallScore}%
                </p>
                <p className="text-brand-text-secondary text-sm mt-1">Overall Score</p>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="text-3xl font-bold text-white">
                  {progress.modulesExplored}
                </p>
                <p className="text-brand-text-secondary text-sm mt-1">Modules Explored</p>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="text-3xl font-bold text-white">
                  {progress.walkthroughsCompleted}
                </p>
                <p className="text-brand-text-secondary text-sm mt-1">
                  Walkthroughs Done
                </p>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="text-3xl font-bold text-white">
                  {progress.questionsAsked}
                </p>
                <p className="text-brand-text-secondary text-sm mt-1">Questions Asked</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-xl h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-brand-text-secondary text-lg mb-2">
                No progress data yet
              </p>
              <p className="text-brand-muted text-sm">
                Start exploring the codebase to track your learning journey!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
