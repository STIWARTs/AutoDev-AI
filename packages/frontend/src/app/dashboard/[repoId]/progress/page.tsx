"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Clock,
  BookOpen,
  MessageCircle,
  Layers,
  Target,
  Flame,
  TrendingUp,
  Calendar,
  Star,
  Trophy,
  Award,
} from "lucide-react";
import DemoDashboardLayout from "@/components/DemoDashboardLayout";

interface SkillData { skill: string; score: number; modulesViewed: number; totalModules: number; }
interface TimelineEvent { event: string; timestamp: string; score: number; }
interface ProgressData {
  totalScore: number; level: string; timeSpent: number; walkthroughsCompleted: number;
  questionsAsked: number; modulesExplored: number; skills?: SkillData[];
  timeline?: TimelineEvent[];
}

const SKILL_COLORS: Record<string, { bar: string; glow: string }> = {
  Auth:         { bar: "linear-gradient(90deg, #34d399, #10b981)", glow: "rgba(52,211,153,0.3)" },
  Architecture: { bar: "linear-gradient(90deg, #818cf8, #6366f1)", glow: "rgba(129,140,248,0.3)" },
  API:          { bar: "linear-gradient(90deg, #22d3ee, #06b6d4)", glow: "rgba(34,211,238,0.3)" },
  Database:     { bar: "linear-gradient(90deg, #fbbf24, #f59e0b)", glow: "rgba(251,191,36,0.3)" },
  Other:        { bar: "linear-gradient(90deg, #fb923c, #f97316)", glow: "rgba(251,146,60,0.3)" },
  Testing:      { bar: "linear-gradient(90deg, #a78bfa, #8b5cf6)", glow: "rgba(167,139,250,0.3)" },
  Infra:        { bar: "linear-gradient(90deg, #f87171, #ef4444)", glow: "rgba(248,113,113,0.3)" },
  DevOps:       { bar: "linear-gradient(90deg, #fb7185, #f43f5e)", glow: "rgba(251,113,133,0.3)" },
};

function LevelBadge({ level }: { level: string }) {
  const cfg: Record<string, { bg: string; text: string; border: string; icon: typeof Star }> = {
    Beginner:     { bg: "rgba(52,211,153,0.08)",  text: "#34d399", border: "rgba(52,211,153,0.2)",  icon: Star },
    Intermediate: { bg: "rgba(251,191,36,0.08)",  text: "#fbbf24", border: "rgba(251,191,36,0.2)",  icon: Flame },
    Advanced:     { bg: "rgba(99,102,241,0.10)",  text: "#818cf8", border: "rgba(99,102,241,0.25)", icon: Trophy },
    Expert:       { bg: "rgba(168,85,247,0.10)",  text: "#c084fc", border: "rgba(168,85,247,0.25)", icon: Award },
  };
  const c = cfg[level] ?? cfg.Beginner;
  const Icon = c.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      <Icon className="w-3 h-3" />
      {level}
    </span>
  );
}

function RingProgress({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const clr = score >= 80 ? "#818cf8" : score >= 60 ? "#fbbf24" : "#34d399";

  return (
    <div className="relative w-32 h-32">
      {/* Glow layer */}
      <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={clr} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 8px ${clr})`, transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading font-bold text-3xl" style={{ color: "var(--text-primary)" }}>{score}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>/ 100</span>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setData({
        totalScore: 72, level: "Intermediate", timeSpent: 120,
        walkthroughsCompleted: 4, questionsAsked: 12, modulesExplored: 6,
        skills: [
          { skill: "Auth",         score: 90, modulesViewed: 2, totalModules: 2 },
          { skill: "Architecture", score: 85, modulesViewed: 5, totalModules: 8 },
          { skill: "API",          score: 75, modulesViewed: 3, totalModules: 3 },
          { skill: "Database",     score: 60, modulesViewed: 1, totalModules: 2 },
          { skill: "Other",        score: 50, modulesViewed: 1, totalModules: 2 },
          { skill: "Testing",      score: 45, modulesViewed: 1, totalModules: 2 },
          { skill: "Infra",        score: 30, modulesViewed: 0, totalModules: 2 },
          { skill: "DevOps",       score: 20, modulesViewed: 0, totalModules: 1 },
        ],
        timeline: [
          { event: "Started onboarding",      timestamp: new Date(Date.now() - 7200000).toISOString(), score: 0  },
          { event: "Explored Architecture",   timestamp: new Date(Date.now() - 5400000).toISOString(), score: 25 },
          { event: "Completed Auth walkthrough", timestamp: new Date(Date.now() - 3600000).toISOString(), score: 50 },
          { event: "Asked 3 Q&A questions",   timestamp: new Date(Date.now() - 1800000).toISOString(), score: 65 },
          { event: "Reached Intermediate",    timestamp: new Date(Date.now() - 600000).toISOString(),  score: 72 },
        ],
      });
      setLoading(false);
    }, 600);
    return () => clearTimeout(timeout);
  }, []);

  const statCards = data ? [
    { icon: Clock,          label: "Time Spent",           value: `${Math.floor(data.timeSpent / 60)}h ${data.timeSpent % 60}m`, color: "#22d3ee" },
    { icon: BookOpen,       label: "Walkthroughs",          value: data.walkthroughsCompleted,              color: "#818cf8" },
    { icon: MessageCircle,  label: "Questions Asked",       value: data.questionsAsked,                     color: "#c084fc" },
    { icon: Layers,         label: "Modules Explored",      value: data.modulesExplored,                    color: "#34d399" },
  ] : [];

  return (
    <DemoDashboardLayout title="My Progress" subtitle="Track your onboarding journey through this codebase">

      {loading || !data ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">

          {/* ── Hero section ──────────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(15,20,42,0.95) 0%, rgba(10,14,30,1) 100%)",
              border: "1px solid rgba(99,102,241,0.15)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.4), 0 0 80px rgba(99,102,241,0.05)",
            }}
          >
            {/* Decorative orb */}
            <div
              className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)", transform: "translate(30%, -30%)" }}
            />

            {/* Score ring */}
            <div className="flex-shrink-0">
              <RingProgress score={data.totalScore} />
            </div>

            {/* Score info */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                Overall Score
              </p>
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h2 className="font-heading font-bold text-2xl" style={{ color: "var(--text-primary)" }}>
                  {data.level}
                </h2>
                <LevelBadge level={data.level} />
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                You&apos;ve been exploring this codebase and making great progress.
              </p>

              {/* Progress bar toward next level */}
              <div className="mt-4 max-w-xs">
                <div className="flex justify-between text-[10px] mb-1.5" style={{ color: "var(--text-muted)" }}>
                  <span>Progress to Advanced</span>
                  <span>{data.totalScore}/80</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(data.totalScore / 80) * 100}%`,
                      background: "linear-gradient(90deg, #6366f1, #c084fc)",
                      boxShadow: "0 0 8px rgba(99,102,241,0.4)",
                      transition: "width 1.2s ease",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              {statCards.map(({ icon: Icon, label, value, color }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl min-w-[80px]"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                  <span className="font-heading font-bold text-lg leading-none" style={{ color }}>
                    {value}
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-center" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Skill Breakdown ────────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(15,20,42,0.9) 0%, rgba(10,14,30,0.95) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-2.5 mb-6">
              <TrendingUp className="w-4 h-4" style={{ color: "#818cf8" }} />
              <h3 className="font-heading font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Skill Breakdown
              </h3>
            </div>

            <div className="space-y-4">
              {data.skills?.map((skill, i) => {
                const colors = SKILL_COLORS[skill.skill] ?? { bar: "linear-gradient(90deg,#818cf8,#6366f1)", glow: "rgba(129,140,248,0.3)" };
                return (
                  <div key={skill.skill} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                          {skill.skill}
                        </span>
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {skill.modulesViewed}/{skill.totalModules} modules
                        </span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                        {skill.score}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${skill.score}%`,
                          background: colors.bar,
                          boxShadow: `0 0 8px ${colors.glow}`,
                          transition: `width 1s cubic-bezier(0.4,0,0.2,1) ${i * 80}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Learning Timeline ──────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(15,20,42,0.9) 0%, rgba(10,14,30,0.95) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-2.5 mb-6">
              <Calendar className="w-4 h-4" style={{ color: "#c084fc" }} />
              <h3 className="font-heading font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Learning Timeline
              </h3>
            </div>

            <div className="relative pl-6">
              {/* Vertical line */}
              <div
                className="absolute left-[7px] top-2 bottom-2 w-[1px]"
                style={{ background: "linear-gradient(180deg, rgba(99,102,241,0.5) 0%, rgba(99,102,241,0.05) 100%)" }}
              />

              <div className="space-y-5">
                {data.timeline?.map((event, i) => (
                  <div key={i} className="flex items-start gap-4 animate-slide-right" style={{ animationDelay: `${i * 80}ms` }}>
                    {/* Dot */}
                    <div
                      className="absolute left-0 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5"
                      style={{
                        borderColor: i === (data.timeline!.length - 1) ? "#818cf8" : "rgba(255,255,255,0.1)",
                        background: i === (data.timeline!.length - 1) ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.04)",
                        boxShadow: i === (data.timeline!.length - 1) ? "0 0 8px rgba(99,102,241,0.4)" : "none",
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                        {event.event}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                          {new Date(event.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}
                        >
                          +{event.score > 0 ? event.score : 0} pts
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Achievement hint ───────────────────────────────────────────── */}
          <div
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{
              background: "rgba(251,191,36,0.06)",
              border: "1px solid rgba(251,191,36,0.15)",
            }}
          >
            <Target className="w-5 h-5 flex-shrink-0" style={{ color: "#fbbf24" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#fbbf24" }}>
                Next milestone: Advanced Explorer
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(251,191,36,0.6)" }}>
                Explore 3 more modules and complete 2 more walkthroughs to reach Advanced level.
              </p>
            </div>
          </div>
        </div>
      )}
    </DemoDashboardLayout>
  );
}
