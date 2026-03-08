"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import DemoDashboardLayout from "@/components/DemoDashboardLayout";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useProgressTracker } from "@/hooks/useProgressTracker";
import { Users, Trophy, Clock, BookOpen, MessageCircle, Layers, Copy, Check, TrendingUp } from "lucide-react";

interface DeveloperProgress {
  userId: string;
  overallScore: number;
  walkthroughsCompleted: number;
  questionsAsked: number;
  modulesExplored: number;
  totalTimeSpentMs: number;
  lastActivity: string;
}

interface TeamData {
  repoId: string;
  members: DeveloperProgress[];
  averageScore: number;
  topAreas: { area: string; score: number }[];
  weakAreas: { area: string; score: number }[];
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  overallScore: number;
  strongestArea: string;
  walkthroughsCompleted: number;
  questionsAsked: number;
  modulesExplored: number;
  totalTimeSpentMs: number;
}

function formatMs(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const RANK_STYLES = [
  "from-amber-400 to-yellow-500",
  "from-slate-300 to-slate-400",
  "from-amber-600 to-amber-700",
];

export default function TeamPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const { getToken } = useAuth();

  const fetchTeamData = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      setLoading(true);
      const token = await getToken();
      const [teamRes, lbRes] = await Promise.all([
        fetchApi(`${getApiBase(decodedRepoId)}/progress/${owner}/${repo}/team`, {}, token),
        fetchApi(`${getApiBase(decodedRepoId)}/progress/${owner}/${repo}/leaderboard`, {}, token),
      ]);
      if (teamRes.ok) {
        const d = await teamRes.json();
        setTeamData(d);
      }
      if (lbRes.ok) {
        const d = await lbRes.json();
        setLeaderboard(d.leaderboard || []);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [owner, repo, decodedRepoId, getToken]);

  useEffect(() => { fetchTeamData(); }, [fetchTeamData]);

  function copyInviteLink() {
    if (typeof window === "undefined") return;
    navigator.clipboard?.writeText(`${window.location.origin}/dashboard/${repoId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <DemoDashboardLayout
      title="Team Progress"
      subtitle="Track your team's collective onboarding journey"
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTeamData}
            className="px-4 py-2 bg-transparent border border-brand-border text-brand-muted hover:border-brand-muted hover:text-brand-text text-sm font-mono transition-all"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="px-4 py-2 bg-brand-text text-brand-bg hover:bg-brand hover:text-brand-bg text-sm font-semibold transition-all"
          >
            + Invite Member
          </button>
        </div>
      }
    >
      {/* Invite panel */}
      {showInvite && (
        <div className="mb-6 p-5 border border-brand/20 bg-brand/5">
          <h2 className="text-sm font-heading font-semibold text-brand-text mb-1">Invite a Team Member</h2>
          <p className="text-xs text-brand-muted font-mono mb-3">Share this link so colleagues can join this repository&apos;s workspace on AutoDev.</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/${repoId}`}
              className="flex-1 px-3 py-2 bg-brand-bg border border-brand-border text-xs font-mono text-brand-muted focus:outline-none focus:border-brand select-all"
            />
            <button
              onClick={copyInviteLink}
              className="flex items-center gap-2 px-4 py-2 border border-brand-border text-xs font-mono hover:border-brand hover:text-brand transition-colors"
            >
              {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <Users className="w-8 h-8 text-brand animate-pulse" />
            <p className="text-brand-muted text-sm font-mono">Loading team data...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Team stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Team Members", value: teamData?.members.length || 0, icon: Users,     color: "text-brand" },
              { label: "Avg. Score",   value: teamData?.averageScore || 0,   icon: Trophy,     color: "text-amber-400" },
              { label: "Top Area",     value: teamData?.topAreas?.[0]?.area || "—",   icon: TrendingUp, color: "text-emerald-400" },
              { label: "Needs Work",   value: teamData?.weakAreas?.[0]?.area || "—",  icon: TrendingUp, color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="border border-brand-border bg-brand-surface p-4">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <p className="text-[10px] text-brand-muted uppercase tracking-widest font-mono">{s.label}</p>
                </div>
                <p className={`text-2xl font-heading font-semibold capitalize ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="border border-brand-border bg-brand-surface overflow-hidden">
              <div className="flex items-center gap-2 p-5 border-b border-brand-border">
                <Trophy className="w-4 h-4 text-brand" />
                <h2 className="text-sm font-heading font-semibold text-brand-text">Leaderboard</h2>
              </div>
              <div className="divide-y divide-brand-border">
                {leaderboard.map((entry) => (
                  <div key={entry.rank} className="flex items-center gap-4 p-4 hover:bg-brand-card transition-colors">
                    {/* Rank */}
                    <div className={`w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      entry.rank <= 3
                        ? `bg-gradient-to-br ${RANK_STYLES[entry.rank - 1]} text-black/80`
                        : "bg-brand-card border border-brand-border text-brand-muted"
                    }`}>
                      {entry.rank}
                    </div>

                    {/* Avatar + name */}
                    <div className="w-8 h-8 bg-brand/20 border border-brand/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-brand">{entry.userId.charAt(0).toUpperCase()}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-text truncate">{entry.userId}</p>
                      <p className="text-xs text-brand-muted font-mono">Strongest: <span className="text-brand-text capitalize">{entry.strongestArea}</span></p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-xs text-brand-muted font-mono">
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{entry.walkthroughsCompleted}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{entry.questionsAsked}</span>
                      <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{entry.modulesExplored}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatMs(entry.totalTimeSpentMs)}</span>
                    </div>

                    {/* Score */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-lg font-heading font-semibold ${entry.overallScore >= 70 ? "text-emerald-400" : entry.overallScore >= 40 ? "text-amber-400" : "text-red-400"}`}>
                        {entry.overallScore}
                      </p>
                      <p className="text-[10px] text-brand-muted font-mono">score</p>
                    </div>

                    {/* Score bar */}
                    <div className="w-20 h-1 bg-brand-card flex-shrink-0">
                      <div
                        className={`h-1 ${entry.overallScore >= 70 ? "bg-emerald-500" : entry.overallScore >= 40 ? "bg-amber-500" : "bg-red-400"}`}
                        style={{ width: `${entry.overallScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strength & weakness areas */}
          {teamData && (teamData.topAreas.length > 0 || teamData.weakAreas.length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-brand-border bg-brand-surface p-5">
                <h3 className="text-xs text-emerald-400 uppercase tracking-widest font-semibold mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Team Strengths
                </h3>
                <div className="space-y-2">
                  {teamData.topAreas.map((a) => (
                    <div key={a.area} className="flex items-center justify-between">
                      <span className="text-sm text-brand-text capitalize">{a.area}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1 bg-brand-card">
                          <div className="h-1 bg-emerald-500" style={{ width: `${a.score}%` }} />
                        </div>
                        <span className="text-xs text-emerald-400 font-mono w-8 text-right">{a.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-brand-border bg-brand-surface p-5">
                <h3 className="text-xs text-red-400 uppercase tracking-widest font-semibold mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 rotate-180" /> Needs More Focus
                </h3>
                <div className="space-y-2">
                  {teamData.weakAreas.map((a) => (
                    <div key={a.area} className="flex items-center justify-between">
                      <span className="text-sm text-brand-text capitalize">{a.area}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1 bg-brand-card">
                          <div className="h-1 bg-red-500" style={{ width: `${a.score}%` }} />
                        </div>
                        <span className="text-xs text-red-400 font-mono w-8 text-right">{a.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DemoDashboardLayout>
  );
}
