"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import AnimatedArchitectureMap from "@/components/AnimatedArchitectureMap";
import LanguageSelector from "@/components/LanguageSelector";
import DemoDashboardLayout from "@/components/DemoDashboardLayout";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useProgressTracker } from "@/hooks/useProgressTracker";
import type {
  ArchitectureMap as ArchMapType,
  AnimationSequence,
  SupportedLanguage,
} from "@autodev/shared";
import { Loader2, Play, Sparkles, Zap, ChevronRight, MessageSquare, Globe, GraduationCap } from "lucide-react";

export default function AnimatedPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [archMap, setArchMap] = useState<ArchMapType | null>(null);
  const [sequences, setSequences] = useState<AnimationSequence[]>([]);
  const [selectedSeq, setSelectedSeq] = useState<AnimationSequence | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [fresherMode, setFresherMode] = useState(false);

  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<{ nodeId: string; text: string } | null>(null);
  const { getToken } = useAuth();
  const { track } = useProgressTracker(decodedRepoId);

  const fetchArch = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      const token = await getToken();
      const res = await fetchApi(`${getApiBase(decodedRepoId)}/analysis/${owner}/${repo}/architecture`, {}, token);
      if (!res.ok) return;
      const data = await res.json();
      setArchMap(data.content ?? data);
    } catch { /* ignore */ }
  }, [owner, repo, decodedRepoId]);

  const fetchSequences = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      const token = await getToken();
      const res = await fetchApi(`${getApiBase(decodedRepoId)}/animated/${owner}/${repo}`, {}, token);
      if (!res.ok) return;
      const data = await res.json();
      const seqList = data.sequences || [];
      setSequences(seqList);
      if (seqList.length > 0) {
        track({ eventType: "animated_viewed", targetLabel: `${decodedRepoId} animated` });
        setSelectedSeq(seqList[0]);
      }
    } catch { /* ignore */ }
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
    if (!owner || !repo) return;
    try {
      setGenerating(true);
      const token = await getToken();
      const res = await fetchApi(`${getApiBase(decodedRepoId)}/animated/${owner}/${repo}/generate`, { method: "POST" }, token);
      if (!res.ok) return;
      const data = await res.json();
      const seqList = data.sequences || [];
      setSequences(seqList);
      if (seqList.length > 0) setSelectedSeq(seqList[0]);
    } catch { /* ignore */ } finally {
      setGenerating(false);
    }
  }

  async function explainNode(nodeId: string) {
    if (!owner || !repo) return;
    try {
      setExplaining(true);
      const token = await getToken();
      const res = await fetchApi(
        `${getApiBase(decodedRepoId)}/animated/${owner}/${repo}/explain-node`,
        { method: "POST", body: JSON.stringify({ nodeId, language, fresherMode }) },
        token
      );
      if (!res.ok) return;
      const data = await res.json();
      setExplanation({ nodeId, text: data.explanation || data.text || "" });
    } catch { /* ignore */ } finally {
      setExplaining(false);
    }
  }

  const CATEGORY_COLORS: Record<string, string> = {
    "auth-flow":     "text-purple-400 bg-purple-500/10 border-purple-500/20",
    "request-flow":  "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    "data-pipeline": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    default:         "text-brand-DEFAULT bg-brand-DEFAULT/10 border-brand-DEFAULT/20",
  };

  return (
    <DemoDashboardLayout
      title="Animated Map"
      subtitle="Watch data flow through your codebase in real-time"
      action={
        <div className="flex items-center gap-3">
          {/* Language selector */}
          <LanguageSelector value={language} onChange={setLanguage} />
          {/* Fresher mode */}
          <button
            onClick={() => setFresherMode(!fresherMode)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-mono border transition-colors ${
              fresherMode
                ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                : "border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-muted"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Fresher Mode
          </button>
          {/* Generate */}
          <button
            onClick={generateSequences}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-brand-DEFAULT hover:bg-brand-DEFAULT/90 disabled:opacity-50 text-brand-bg text-sm font-mono font-semibold transition-colors"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {generating ? "Generating..." : "Generate Flows"}
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="flex items-end gap-1 mx-auto mb-5" style={{ width: 52, height: 40 }}>
              {[0.45, 0.75, 1.0, 0.75, 0.45].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-brand-DEFAULT eq-bar"
                  style={{ height: `${h * 100}%`, animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
            <p className="text-brand-muted text-sm font-mono">Loading animated map...</p>
          </div>
        </div>
      ) : !archMap ? (
        <div className="bg-brand-surface border border-brand-border border-dashed flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 bg-brand-DEFAULT/10 border border-brand-DEFAULT/20 flex items-center justify-center mb-4">
            <Play className="w-6 h-6 text-brand-DEFAULT" />
          </div>
          <p className="text-brand-text font-heading font-semibold mb-1">No architecture data yet</p>
          <p className="text-brand-muted text-sm font-mono">Run analysis on the Architecture Map page first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[260px_1fr] gap-5">
          {/* Sequences sidebar */}
          <div className="space-y-3">
            <p className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold font-mono">Flows</p>
            {sequences.length === 0 ? (
              <div className="bg-brand-surface border border-brand-border p-4 text-center">
                <Sparkles className="w-5 h-5 text-brand-muted mx-auto mb-2" />
                <p className="text-xs text-brand-muted font-mono">No flows yet. Click Generate to create animations.</p>
              </div>
            ) : (
              sequences.map((seq) => {
                const catColor = CATEGORY_COLORS[seq.category || "default"] || CATEGORY_COLORS.default;
                const isActive = selectedSeq?.id === seq.id;
                return (
                  <button
                    key={seq.id}
                    onClick={() => setSelectedSeq(seq)}
                    className={`w-full text-left p-4 border transition-colors cursor-pointer ${
                      isActive
                        ? "bg-brand-DEFAULT/10 border-brand-DEFAULT/20"
                        : "bg-brand-surface border-brand-border hover:border-brand-DEFAULT/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] px-2 py-0.5 border font-semibold uppercase tracking-wide font-mono ${catColor}`}>
                        {seq.category?.replace("-", " ") || "flow"}
                      </span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-DEFAULT" />}
                    </div>
                    <p className={`text-sm font-heading font-semibold mb-1 ${isActive ? "text-brand-DEFAULT" : "text-brand-text"}`}>
                      {seq.title}
                    </p>
                    <p className="text-xs text-brand-muted font-mono line-clamp-2">{seq.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-brand-muted font-mono">
                      <span>{seq.steps.length} steps</span>
                      {seq.estimatedDuration && <span>~{seq.estimatedDuration}s</span>}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Map & explanation */}
          <div className="space-y-4">
            {/* Animated map */}
            <div
              className="bg-brand-surface border border-brand-border overflow-hidden"
              style={{ height: "calc(100vh - 340px)", minHeight: 400 }}
            >
              {archMap && selectedSeq ? (
                <AnimatedArchitectureMap
                  data={archMap}
                  sequences={sequences}
                  fresherMode={fresherMode}
                  onNodeClick={explainNode}
                />
              ) : archMap ? (
                <AnimatedArchitectureMap
                  data={archMap}
                  sequences={[]}
                  fresherMode={fresherMode}
                  onNodeClick={explainNode}
                />
              ) : null}
            </div>

            {/* Node explanation panel */}
            {explanation && (
              <div className="bg-brand-DEFAULT/5 border border-brand-DEFAULT/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                  {explaining ? (
                    <Loader2 className="w-4 h-4 text-brand-DEFAULT animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-brand-DEFAULT" />
                  )}
                  <p className="text-[10px] font-semibold text-brand-DEFAULT uppercase tracking-widest font-mono">
                    {explanation.nodeId} — Explanation
                    {language !== "en" && <span className="ml-2 inline-flex items-center gap-1"><Globe className="w-3 h-3" /></span>}
                  </p>
                  <button
                    onClick={() => setExplanation(null)}
                    className="ml-auto text-xs text-brand-muted hover:text-brand-text transition-colors font-mono"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-brand-text leading-relaxed font-body">{explanation.text}</p>
              </div>
            )}

            {/* Click prompt */}
            {!explanation && archMap && (
              <p className="text-xs text-brand-muted text-center font-mono">
                Click any node on the map to get an explanation
              </p>
            )}
          </div>
        </div>
      )}
    </DemoDashboardLayout>
  );
}
