"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import DemoDashboardLayout from "@/components/DemoDashboardLayout";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useProgressTracker } from "@/hooks/useProgressTracker";
import {
  BarChart3, Clock, Trophy, BookOpen, MessageCircle, Layers, Target, TrendingUp, Flame
} from "lucide-react";

interface SkillArea {
  area: string;
  score: number;
  modulesExplored: number;
  totalModules: number;
  lastActivity: string;
}

interface TimelineEvent {
  timestamp: string;
  overallScore: number;
  eventDescription: string;
}

interface Progress {
  userId: string;
  overallScore: number;
  skills: SkillArea[];
  totalTimeSpentMs: number;
  walkthroughsCompleted: number;
  questionsAsked: number;
  modulesExplored: number;
  conventionsViewed: number;
  firstActivity: string;
  lastActivity: string;
  timeline: TimelineEvent[];
}

const AREA_LABELS: Record<string, string> = {
  architecture: "Architecture",
  auth: "Auth",
  api: "API",
  database: "Database",
  testing: "Testing",
  infrastructure: "Infra",
  frontend: "Frontend",
  devops: "DevOps",
  other: "Other",
};

const SCORE_COLOR = (score: number) => {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  if (score >= 25) return "bg-orange-500";
  return "bg-red-400";
};

function formatMs(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function ProgressPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { track } = useProgressTracker(decodedRepoId);

  const fetchProgress = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetchApi(
        `${getApiBase(decodedRepoId)}/progress/${owner}/${repo}/demo-user`,
        {},
        token
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProgress(data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [owner, repo, decodedRepoId]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  if (loading) {
    return (
      <DemoDashboardLayout title="My Progress">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <BarChart3 className="w-8 h-8 text-indigo-400 animate-pulse" />
            <p className="text-brand-text-secondary text-sm">Loading your progress...</p>
          </div>
        </div>
      </DemoDashboardLayout>
    );
  }

  const scoreColor = progress?.overallScore
    ? progress.overallScore >= 75 ? "text-emerald-400" : progress.overallScore >= 50 ? "text-amber-400" : "text-orange-400"
    : "text-brand-muted";

  const skillsSorted = [...(progress?.skills || [])].sort((a, b) => b.score - a.score);

  return (
    <DemoDashboardLayout
      title="My Progress"
      subtitle="Track your onboarding journey through this codebase"
    >
      {!progress || progress.overallScore === 0 ? (
        <div className="glass rounded-xl border border-white/[0.06] flex flex-col items-center justify-center py-20">
          <Target className="w-12 h-12 text-brand-muted mb-4" />
          <p className="text-white font-semibold text-lg mb-1">No progress yet</p>
          <p className="text-brand-muted text-sm text-center max-w-sm">
            Start exploring the architecture map, walkthroughs, and Q&A to track your learning journey.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall score hero */}
          <div className="glass rounded-2xl border border-white/[0.06] p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
            <div className="relative flex items-center gap-8">
              {/* Score ring */}
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42 * (progress.overallScore / 100)} ${2 * Math.PI * 42}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${scoreColor}`}>{progress.overallScore}</span>
                  <span className="text-xs text-brand-muted">/ 100</span>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-xs text-brand-muted uppercase tracking-widest mb-1">Overall Score</p>
                <p className="text-2xl font-bold text-white mb-1">
                  {progress.overallScore >= 75 ? "Proficient" : progress.overallScore >= 50 ? "Intermediate" : progress.overallScore >= 25 ? "Getting Started" : "Beginner"}
                </p>
                <p className="text-sm text-brand-text-secondary">
                  You&apos;ve been exploring this codebase and making great progress.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Clock, label: "Time Spent", value: formatMs(progress.totalTimeSpentMs), color: "text-cyan-400" },
                  { icon: BookOpen, label: "Walkthroughs", value: progress.walkthroughsCompleted, color: "text-indigo-400" },
                  { icon: MessageCircle, label: "Questions", value: progress.questionsAsked, color: "text-purple-400" },
                  { icon: Layers, label: "Modules", value: progress.modulesExplored, color: "text-emerald-400" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-brand-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skills breakdown */}
          <div className="glass rounded-xl border border-white/[0.06] p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Skill Breakdown</h2>
            </div>
            <div className="space-y-3">
              {skillsSorted.filter(s => s.score > 0 || s.totalModules > 0).map((skill) => (
                <div key={skill.area}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-brand-text-secondary">{AREA_LABELS[skill.area] || skill.area}</span>
                      <span className="text-xs text-brand-muted">
                        {skill.modulesExplored}/{skill.totalModules} modules
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-white">{skill.score}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.05]">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${SCORE_COLOR(skill.score)}`}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          {progress.timeline && progress.timeline.length > 0 && (
            <div className="glass rounded-xl border border-white/[0.06] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Flame className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-white">Learning Timeline</h2>
              </div>
              <div className="space-y-3">
                {progress.timeline.map((event, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />
                      {i !== progress.timeline.length - 1 && <div className="w-px h-full bg-white/[0.05] flex-1 min-h-[16px]" />}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm text-brand-text-secondary">{event.eventDescription}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-brand-muted">
                          {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-xs font-semibold text-indigo-400">Score: {event.overallScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DemoDashboardLayout>
  );
}
