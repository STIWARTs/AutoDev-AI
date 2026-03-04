"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import AnimatedArchitectureMap from "@/components/AnimatedArchitectureMap";
import LanguageSelector from "@/components/LanguageSelector";
import DashboardSidebar from "@/components/DashboardSidebar";
import Link from "next/link";
import { getApiBase } from "@/lib/api";
import type {
  ArchitectureMap as ArchMapType,
  AnimationSequence,
  SupportedLanguage,
} from "@autodev/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2, Play, RefreshCw } from "lucide-react";

export default function AnimatedPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [archMap, setArchMap] = useState<ArchMapType | null>(null);
  const [sequences, setSequences] = useState<AnimationSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [fresherMode, setFresherMode] = useState(false);

  // Node explanation state
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<{ nodeId: string; text: string } | null>(null);

  // Fetch architecture
  const fetchArch = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      const res = await fetch(`${getApiBase(decodedRepoId)}/analysis/${owner}/${repo}/architecture`);
      if (!res.ok) return;
      const data = await res.json();
      setArchMap(data.content ?? data);
    } catch {
      // ignore
    }
  }, [owner, repo, decodedRepoId]);

  // Fetch animation sequences
  const fetchSequences = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      const res = await fetch(`${getApiBase(decodedRepoId)}/animated/${owner}/${repo}`);
      if (!res.ok) return;
      const data = await res.json();
      setSequences(data.sequences || []);
    } catch {
      // ignore
    }
  }, [owner, repo, decodedRepoId]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchArch(), fetchSequences()]);
      setLoading(false);
    }
    init();
  }, [fetchArch, fetchSequences]);

  async function generateSequences() {
    try {
      setGenerating(true);
      setError(null);
      const res = await fetch(`${getApiBase(decodedRepoId)}/animated/${owner}/${repo}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fresherMode }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSequences(data.sequences || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate animated sequences");
    } finally {
      setGenerating(false);
    }
  }

  async function handleNodeClick(nodeId: string) {
    try {
      setExplaining(true);
      setExplanation(null);
      const res = await fetch(`${getApiBase(decodedRepoId)}/animated/${owner}/${repo}/explain-node`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId, fresherMode }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let text = data.explanation || "No explanation available.";

      // Translate if non-English
      if (language !== "en") {
        try {
          const tRes = await fetch(`${getApiBase(decodedRepoId)}/i18n/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, targetLanguage: language, repoId: decodedRepoId, fresherMode }),
          });
          if (tRes.ok) {
            const tData = await tRes.json();
            text = tData.translatedText || text;
          }
        } catch {
          // keep English text on failure
        }
      }

      setExplanation({ nodeId, text });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to explain node");
    } finally {
      setExplaining(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <DashboardSidebar repoId={repoId} decodedRepoId={decodedRepoId} />

      {/* Main content */}
      <main className="ml-[260px] p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-brand-text">Animated Architecture</h1>
            <p className="text-brand-text-secondary text-sm mt-2">Watch request flows light up step-by-step</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              fresherMode={fresherMode}
              onFresherToggle={setFresherMode}
            />
            {sequences.length === 0 && !generating && archMap && (
              <Button
                onClick={generateSequences}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-glow hover:shadow-glow-lg text-white border-0"
              >
                <Play className="w-4 h-4 mr-2" />
                Generate Animations
              </Button>
            )}
            {sequences.length > 0 && (
              <Button
                variant="outline"
                onClick={generateSequences}
                disabled={generating}
                className="glass-hover border-white/[0.08]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {generating ? "Regenerating..." : "Regenerate"}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Card className="mb-6 glass border-red-500/20 bg-transparent">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card className="glass border-white/[0.08] bg-transparent">
            <CardContent className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
                <p className="text-brand-text-secondary font-medium">Loading architecture &amp; animations...</p>
              </div>
            </CardContent>
          </Card>
        ) : generating ? (
          <Card className="glass border-white/[0.08] bg-transparent">
            <CardContent className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-4" />
                <p className="text-brand-text text-lg mb-2 font-heading font-semibold">Generating animation sequences...</p>
                <p className="text-brand-muted text-sm">
                  AI is creating step-by-step visual walkthroughs
                </p>
              </div>
            </CardContent>
          </Card>
        ) : archMap && sequences.length > 0 ? (
          <Card className="glass border-white/[0.08] overflow-hidden bg-transparent">
            <AnimatedArchitectureMap
              data={archMap}
              sequences={sequences}
              fresherMode={fresherMode}
              onNodeClick={handleNodeClick}
            />
          </Card>
        ) : archMap ? (
          <Card className="glass border-white/[0.08] bg-transparent">
            <CardContent className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-5">
                  <Play className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-brand-text text-lg mb-2 font-heading font-semibold">No animation sequences yet</p>
                <p className="text-brand-muted text-sm mb-8 max-w-md mx-auto">
                  Generate AI-powered animated walkthroughs of your architecture
                </p>
                <Button
                  onClick={generateSequences}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-glow hover:shadow-glow-lg text-white border-0"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Generate Animations
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass border-white/[0.08] bg-transparent">
            <CardContent className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-brand-text text-lg mb-2 font-heading font-semibold">
                  Architecture map required
                </p>
                <p className="text-brand-muted text-sm mb-4">
                  Run an analysis first from the Architecture Map page.
                </p>
                <Link
                  href={`/dashboard/${repoId}`}
                  className="text-indigo-400 hover:text-indigo-300 text-sm underline"
                >
                  Go to Architecture Map
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Node explanation panel */}
        {(explaining || explanation) && (
          <Card className="mt-6 glass border-white/[0.08] bg-transparent">
            <CardContent className="p-5">
              <h2 className="text-sm font-medium font-heading text-brand-text-secondary uppercase tracking-wide mb-3">
                Node Explanation
              </h2>
              {explaining ? (
                <div className="flex items-center gap-3 text-brand-text-secondary">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  Generating explanation...
                </div>
              ) : explanation ? (
                <div>
                  <Badge variant="outline" className="mb-3 bg-white/[0.02] text-brand-text-secondary border-white/[0.06]">
                    {explanation.nodeId}
                  </Badge>
                  <p className="text-sm text-brand-text whitespace-pre-line leading-relaxed">
                    {explanation.text}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Sequence info cards */}
        {sequences.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sequences.map((seq, idx) => (
              <Card
                key={seq.id || idx}
                className="glass-hover border-white/[0.08] bg-transparent cursor-default"
              >
                <CardContent className="p-5">
                  <h3 className="font-heading font-semibold text-sm mb-1 text-brand-text">{seq.title}</h3>
                  <p className="text-xs text-brand-text-secondary mb-3 line-clamp-2">
                    {seq.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-brand-muted">
                    <span>{seq.steps?.length || 0} steps</span>
                    {seq.category && (
                      <Badge variant="outline" className="bg-white/[0.02] text-brand-text-secondary border-white/[0.06]">
                        {seq.category}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
