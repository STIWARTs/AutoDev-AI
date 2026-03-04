"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ConventionList } from "@/components/ConventionCard";
import { getApiBase } from "@/lib/api";
import type { Convention } from "@autodev/shared";

export default function ConventionsPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [conventions, setConventions] = useState<Convention[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConventions = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      setLoading(true);
      const res = await fetch(`${getApiBase(decodedRepoId)}/conventions/${owner}/${repo}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setConventions(data.conventions || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conventions");
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    fetchConventions();
  }, [fetchConventions]);

  async function triggerDetection() {
    try {
      setDetecting(true);
      await fetch(`${getApiBase(decodedRepoId)}/conventions/${owner}/${repo}`, { method: "POST" });
      // Poll for results
      setTimeout(fetchConventions, 15_000);
      setTimeout(fetchConventions, 30_000);
    } catch {
      setError("Failed to trigger convention detection");
    } finally {
      setDetecting(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 w-64 h-full glass-strong border-r border-white/[0.06] p-6">
        <Link href="/dashboard" className="text-xl font-bold mb-6 block text-gradient font-heading">
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
            <Link href={`/dashboard/${repoId}/conventions`} className="block px-3 py-2 rounded-lg bg-white/[0.06] text-brand-text text-sm font-medium">
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-heading">Coding Conventions</h1>
          <button
            onClick={triggerDetection}
            disabled={detecting}
            className="px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90 shadow-glow rounded-lg text-sm font-medium transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            {detecting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Detecting...
              </>
            ) : (
              "Detect Conventions"
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 border border-red-500/20 bg-red-400/10 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-brand-text-secondary">Loading conventions...</p>
            </div>
          </div>
        ) : conventions.length > 0 ? (
          <>
            <p className="text-sm text-brand-text-secondary mb-6">
              {conventions.length} conventions detected in this codebase
            </p>
            <ConventionList conventions={conventions} />
          </>
        ) : (
          <div className="text-center py-16 glass rounded-xl">
            <p className="text-brand-text-secondary text-lg mb-2">No conventions detected yet</p>
            <p className="text-brand-muted text-sm mb-6">
              Run analysis to auto-detect coding conventions, or click &quot;Detect Conventions&quot; above.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
