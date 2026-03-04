"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import SkillRadar from "@/components/SkillRadar";
import { getApiBase } from "@/lib/api";
import type { TeamProgress, DeveloperProgress } from "@autodev/shared";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  overallScore: number;
  totalTimeSpentMs: number;
  walkthroughsCompleted: number;
  questionsAsked: number;
  modulesExplored: number;
  strongestArea: string;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

function getMedalEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export default function TeamPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [teamProgress, setTeamProgress] = useState<TeamProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedMember, setSelectedMember] = useState<DeveloperProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamData = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      setLoading(true);
      const [teamRes, lbRes] = await Promise.all([
        fetch(`${getApiBase(decodedRepoId)}/progress/${owner}/${repo}/team`),
        fetch(`${getApiBase(decodedRepoId)}/progress/${owner}/${repo}/leaderboard`),
      ]);

      if (!teamRes.ok) throw new Error(`Team HTTP ${teamRes.status}`);
      if (!lbRes.ok) throw new Error(`Leaderboard HTTP ${lbRes.status}`);

      const teamData: TeamProgress = await teamRes.json();
      const lbData = await lbRes.json();

      setTeamProgress(teamData);
      setLeaderboard(lbData.leaderboard || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team data");
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

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
            <Link href={`/dashboard/${repoId}/progress`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
              My Progress
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/${repoId}/team`} className="block px-3 py-2 rounded-lg bg-white/[0.06] text-brand-text text-sm font-medium">
              Team
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main content */}
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-heading">Team Progress</h1>
          <button
            onClick={fetchTeamData}
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

        {loading && !teamProgress ? (
          <div className="glass rounded-xl h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-brand-text-secondary">Loading team data...</p>
            </div>
          </div>
        ) : teamProgress ? (
          <div className="space-y-8">
            {/* Team summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-xl p-5">
                <p className="text-3xl font-bold text-white">
                  {teamProgress.members.length}
                </p>
                <p className="text-brand-text-secondary text-sm mt-1">Team Members</p>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="text-3xl font-bold text-white">
                  {teamProgress.averageScore}%
                </p>
                <p className="text-brand-text-secondary text-sm mt-1">Average Score</p>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="text-3xl font-bold text-white">
                  {formatDuration(teamProgress.averageTimeToOnboard)}
                </p>
                <p className="text-brand-text-secondary text-sm mt-1">Avg. Time</p>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="text-3xl font-bold text-white">
                  {teamProgress.topAreas[0]?.area || "—"}
                </p>
                <p className="text-brand-text-secondary text-sm mt-1">Strongest Area</p>
              </div>
            </div>

            {/* Top row: Team Skill Radar + Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Average Skills */}
              <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-semibold font-heading mb-4 text-white">
                  Team Skill Distribution
                </h2>
                {teamProgress.topAreas.length > 0 ? (
                  <SkillRadar skills={teamProgress.topAreas} size={320} />
                ) : (
                  <div className="flex items-center justify-center h-48 text-brand-muted">
                    No skill data yet
                  </div>
                )}
              </div>

              {/* Leaderboard */}
              <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-semibold font-heading mb-4 text-white">
                  Leaderboard
                </h2>
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry) => (
                      <button
                        key={entry.userId}
                        onClick={() => {
                          const member = teamProgress.members.find(
                            (m) => m.userId === entry.userId
                          );
                          setSelectedMember(
                            selectedMember?.userId === entry.userId ? null : member || null
                          );
                        }}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all text-left ${
                          selectedMember?.userId === entry.userId
                            ? "border-indigo-600 bg-indigo-900/20"
                            : "border-white/[0.06] glass hover:bg-white/[0.04]"
                        }`}
                      >
                        <span className="text-lg w-8 text-center flex-shrink-0">
                          {getMedalEmoji(entry.rank)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {entry.userId}
                          </p>
                          <p className="text-xs text-brand-muted">
                            Strongest: {entry.strongestArea} &middot;{" "}
                            {entry.modulesExplored} modules &middot;{" "}
                            {entry.questionsAsked} Q&As
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-white">
                            {entry.overallScore}%
                          </p>
                          <p className="text-xs text-brand-muted">
                            {formatDuration(entry.totalTimeSpentMs)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-brand-muted">
                    No team members yet
                  </div>
                )}
              </div>
            </div>

            {/* Selected member detail panel */}
            {selectedMember && (
              <div className="border border-indigo-800 rounded-xl bg-indigo-900/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold font-heading text-white">
                    {selectedMember.userId}&apos;s Progress
                  </h2>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-brand-text-secondary hover:text-white text-sm"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  <div className="p-3 rounded-xl glass">
                    <p className="text-xl font-bold text-white">
                      {selectedMember.overallScore}%
                    </p>
                    <p className="text-brand-text-secondary text-xs">Score</p>
                  </div>
                  <div className="p-3 rounded-xl glass">
                    <p className="text-xl font-bold text-white">
                      {selectedMember.modulesExplored}
                    </p>
                    <p className="text-brand-text-secondary text-xs">Modules</p>
                  </div>
                  <div className="p-3 rounded-xl glass">
                    <p className="text-xl font-bold text-white">
                      {selectedMember.walkthroughsCompleted}
                    </p>
                    <p className="text-brand-text-secondary text-xs">Walkthroughs</p>
                  </div>
                  <div className="p-3 rounded-xl glass">
                    <p className="text-xl font-bold text-white">
                      {selectedMember.questionsAsked}
                    </p>
                    <p className="text-brand-text-secondary text-xs">Questions</p>
                  </div>
                  <div className="p-3 rounded-xl glass">
                    <p className="text-xl font-bold text-white">
                      {formatDuration(selectedMember.totalTimeSpentMs)}
                    </p>
                    <p className="text-brand-text-secondary text-xs">Time Spent</p>
                  </div>
                </div>
                <SkillRadar skills={selectedMember.skills} size={280} />
              </div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-semibold font-heading mb-4 text-green-400">
                  Team Strengths
                </h2>
                {teamProgress.topAreas.length > 0 ? (
                  <div className="space-y-3">
                    {teamProgress.topAreas
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 5)
                      .map((area) => (
                        <div key={area.area} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-brand-text-secondary capitalize">
                                {area.area}
                              </span>
                              <span className="text-sm font-medium text-white">
                                {area.score}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-brand-surface rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${area.score}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-brand-muted text-sm">No data yet</p>
                )}
              </div>

              <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-semibold font-heading mb-4 text-orange-400">
                  Areas to Improve
                </h2>
                {teamProgress.weakAreas.length > 0 ? (
                  <div className="space-y-3">
                    {teamProgress.weakAreas
                      .sort((a, b) => a.score - b.score)
                      .slice(0, 5)
                      .map((area) => (
                        <div key={area.area} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-brand-text-secondary capitalize">
                                {area.area}
                              </span>
                              <span className="text-sm font-medium text-white">
                                {area.score}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-brand-surface rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-500 rounded-full"
                                style={{ width: `${area.score}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-brand-muted text-sm">No data yet</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-xl h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-brand-text-secondary text-lg mb-2">No team data yet</p>
              <p className="text-brand-muted text-sm">
                Team progress will appear as members explore the codebase
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
