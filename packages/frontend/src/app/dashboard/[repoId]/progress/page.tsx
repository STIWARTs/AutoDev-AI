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
  if (score >= 50) return "bg-brand-DEFAULT";
  if (score >= 25) return "bg-amber-500";
  return "bg-red-400";
};

const SCORE_TEXT = (score: number) => {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-brand-DEFAULT";
  if (score >= 25) return "text-amber-400";
  return "text-red-400";
};

function formatMs(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function SkeletonProgress() {
  return (
    <DemoDashboardLayout title="My Progress">
      <div className="space-y-6 animate-pulse">
        {/* Hero skeleton */}
        <div className="bg-brand-surface border border-brand-border p-8">
          <div className="flex items-center gap-8">
            <div className="w-28 h-28 rounded-full bg-brand-card flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-3 w-20 bg-brand-card" />
              <div className="h-7 w-32 bg-brand-card" />
              <div className="h-3 w-64 bg-brand-card" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-24 h-16 bg-brand-card border border-brand-border" />
              ))}
            </div>
          </div>
        </div>
        {/* Skills skeleton */}
        <div className="bg-brand-surface border border-brand-border p-6">
          <div className="h-4 w-32 bg-brand-card mb-5" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-brand-card" />
                  <div className="h-3 w-8 bg-brand-card" />
                </div>
                <div className="h-1.5 bg-brand-card w-full" />
              </div>
            ))}
          </div>
        </div>
        {/* Timeline skeleton */}
        <div className="bg-brand-surface border border-brand-border p-6">
          <div className="h-4 w-40 bg-brand-card mb-5" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 bg-brand-card mt-1 flex-shrink-0" />
                <div className="flex-1 space-y-1.5 pb-3">
                  <div className="h-3 w-3/4 bg-brand-card" />
                  <div className="h-2 w-24 bg-brand-card" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DemoDashboardLayout>
  );
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

  if (loading) return <SkeletonProgress />;

  const scoreColor = progress?.overallScore
    ? progress.overallScore >= 75 ? "text-emerald-400"
    : progress.overallScore >= 50 ? "text-amber-400"
    : "text-brand-DEFAULT"
    : "text-brand-muted";

  const skillsSorted = [...(progress?.skills || [])].sort((a, b) => b.score - a.score);

  return (
    <DemoDashboardLayout
      title="My Progress"
      subtitle="Track your onboarding journey through this codebase"
    >
      {!progress || progress.overallScore === 0 ? (
        <div className="border border-brand-border border-dashed bg-brand-surface flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 bg-brand-DEFAULT/10 border border-brand-DEFAULT/20 flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-brand-DEFAULT" />
          </div>
          <p className="font-heading font-semibold text-lg text-brand-text mb-1">No progress yet</p>
          <p className="text-brand-muted text-sm text-center max-w-sm font-mono">
            Start exploring the architecture map, walkthroughs, and Q&amp;A to track your learning journey.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall score hero */}
          <div className="border border-brand-border bg-brand-surface p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-DEFAULT/3 via-transparent to-transparent" />
            <div className="relative flex items-center gap-8">
              {/* Score ring with pulse glow */}
              <div className="relative w-28 h-28 flex-shrink-0">
                {/* Outer ping ring */}
                <div
                  className="absolute inset-0 rounded-full border-2 border-brand-DEFAULT/20 animate-ping"
                  style={{ animationDuration: "3s" }}
                />
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
                      <stop offset="0%" stopColor="#E25A34" />
                      <stop offset="100%" stopColor="#f0956e" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold font-heading ${scoreColor}`}>{progress.overallScore}</span>
                  <span className="text-xs text-brand-muted font-mono">/ 100</span>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-[10px] text-brand-muted uppercase tracking-widest mb-1 font-mono">Overall Score</p>
                <p className="text-2xl font-heading font-semibold text-brand-text mb-1">
                  {progress.overallScore >= 75 ? "Proficient"
                    : progress.overallScore >= 50 ? "Intermediate"
                    : progress.overallScore >= 25 ? "Getting Started"
                    : "Beginner"}
                </p>
                <p className="text-sm text-brand-muted font-mono">
                  You&apos;ve been exploring this codebase and making great progress.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Clock,         label: "Time Spent",   value: formatMs(progress.totalTimeSpentMs) },
                  { icon: BookOpen,      label: "Walkthroughs", value: progress.walkthroughsCompleted },
                  { icon: MessageCircle, label: "Questions",    value: progress.questionsAsked },
                  { icon: Layers,        label: "Modules",      value: progress.modulesExplored },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="text-center border border-brand-border bg-brand-card p-3 hover:border-brand-DEFAULT/30 transition-colors"
                  >
                    <s.icon className="w-4 h-4 text-brand-DEFAULT mx-auto mb-1" />
                    <p className="text-xl font-heading font-semibold text-brand-DEFAULT">{s.value}</p>
                    <p className="text-[10px] text-brand-muted uppercase tracking-wider font-mono">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skills breakdown */}
          <div className="border border-brand-border bg-brand-surface p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-brand-DEFAULT" />
              <h2 className="text-sm font-heading font-semibold text-brand-text">Skill Breakdown</h2>
            </div>
            <div className="space-y-3">
              {skillsSorted.filter(s => s.score > 0 || s.totalModules > 0).map((skill) => (
                <div key={skill.area}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-brand-text font-body">{AREA_LABELS[skill.area] || skill.area}</span>
                      <span className="text-[10px] text-brand-muted font-mono">
                        {skill.modulesExplored}/{skill.totalModules} modules
                      </span>
                    </div>
                    <span className={`text-sm font-semibold font-mono ${SCORE_TEXT(skill.score)}`}>{skill.score}%</span>
                  </div>
                  <div className="h-1.5 bg-brand-card">
                    <div
                      className={`h-1.5 transition-all duration-700 ${SCORE_COLOR(skill.score)}`}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          {progress.timeline && progress.timeline.length > 0 && (
            <div className="border border-brand-border bg-brand-surface p-6">
              <div className="flex items-center gap-2 mb-5">
                <Flame className="w-4 h-4 text-brand-DEFAULT" />
                <h2 className="text-sm font-heading font-semibold text-brand-text">Learning Timeline</h2>
              </div>
              <div className="space-y-3">
                {progress.timeline.map((event, i) => {
                  const prev = i > 0 ? progress.timeline[i - 1] : null;
                  const delta = prev ? event.overallScore - prev.overallScore : event.overallScore;
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-2 h-2 bg-brand-DEFAULT mt-1 flex-shrink-0" />
                        {i !== progress.timeline.length - 1 && (
                          <div className="w-px h-full bg-brand-border flex-1 min-h-[16px]" />
                        )}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-brand-text font-body">{event.eventDescription}</p>
                          {delta !== 0 && (
                            <span className={`text-[10px] px-2 py-0.5 border font-mono flex-shrink-0 ${
                              delta > 0
                                ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                                : "text-red-400 border-red-500/20 bg-red-500/5"
                            }`}>
                              {delta > 0 ? "+" : ""}{delta}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-brand-muted font-mono mt-1 block">
                          {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          <span className="ml-2 text-brand-DEFAULT">Score: {event.overallScore}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </DemoDashboardLayout>
  );
}
