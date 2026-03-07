"use client";

import { useState, useRef, useEffect } from "react";
import type { Walkthrough } from "@autodev/shared";
import { Volume2, Square, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { fetchApi } from "@/lib/api";

interface WalkthroughViewerProps {
  walkthrough: Walkthrough;
  onBack?: () => void;
}

export default function WalkthroughViewer({ walkthrough, onBack }: WalkthroughViewerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const { getToken } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const steps = walkthrough.steps || [];
  const step = steps[currentStep];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [currentStep]);

  const toggleAudio = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    if (!step?.explanation) return;
    try {
      setIsLoadingAudio(true);
      const token = await getToken();
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const res = await fetchApi(
        `${API_BASE}/voice/synthesize`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: step.explanation, voiceId: "Matthew" }) },
        token
      );
      if (!res.ok) throw new Error("Failed to synthesize audio");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url); };
      audioRef.current = audio;
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className="text-[11px] text-brand-muted hover:text-brand transition-colors mb-2 flex items-center gap-1 font-mono"
            >
              ← Back to walkthroughs
            </button>
          )}
          <h2 className="text-xl font-heading font-semibold text-brand-text">
            {walkthrough.title || "Code Walkthrough"}
          </h2>
          {walkthrough.description && (
            <p className="text-brand-muted text-xs mt-1 font-mono">{walkthrough.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          {walkthrough.difficulty && (
            <span className={`text-[10px] px-2.5 py-1 border font-mono uppercase tracking-wide ${
              walkthrough.difficulty === "beginner"
                ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/10"
                : walkthrough.difficulty === "intermediate"
                ? "border-amber-500/20 text-amber-400 bg-amber-500/10"
                : "border-red-500/20 text-red-400 bg-red-500/10"
            }`}>
              {walkthrough.difficulty}
            </span>
          )}
          {walkthrough.estimatedMinutes && (
            <span className="text-[10px] text-brand-muted font-mono border border-brand-border px-2 py-0.5">
              ~{walkthrough.estimatedMinutes} min
            </span>
          )}
        </div>
      </div>

      {/* Prerequisites */}
      {walkthrough.prerequisites && walkthrough.prerequisites.length > 0 && (
        <div className="p-4 border border-brand-border bg-brand-surface">
          <p className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold mb-2">Prerequisites</p>
          <ul className="text-sm text-brand-text space-y-1 font-mono">
            {walkthrough.prerequisites.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-brand mt-0.5 flex-shrink-0">→</span> {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Step progress bars */}
      <div className="flex items-center gap-1">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`h-1 flex-1 transition-all duration-200 ${
              i === currentStep
                ? "bg-brand"
                : i < currentStep
                ? "bg-brand/40"
                : "bg-brand-border"
            }`}
          />
        ))}
        <span className="text-[10px] text-brand-muted ml-2 font-mono whitespace-nowrap">
          {currentStep + 1} / {steps.length}
        </span>
      </div>

      {/* Current step */}
      {step && (
        <div className="border border-brand-border bg-brand-surface overflow-hidden">
          {/* Step header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-brand-border bg-brand-card">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-brand text-brand-bg text-xs font-bold font-mono flex-shrink-0">
                {currentStep + 1}
              </span>
              <h3 className="text-sm font-heading font-semibold text-brand-text">
                {step.title || `Step ${currentStep + 1}`}
              </h3>
            </div>
            <button
              onClick={toggleAudio}
              disabled={isLoadingAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-bg border border-brand-border hover:border-brand/40 text-brand-muted hover:text-brand-text transition-colors text-[11px] font-mono disabled:opacity-40"
            >
              {isLoadingAudio ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
              ) : isPlaying ? (
                <Square className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-brand" />
              )}
              {isPlaying ? "Stop" : "Listen"}
            </button>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-sm text-brand-text leading-relaxed font-body">{step.explanation}</p>

            {/* File reference */}
            {step.file && (
              <div className="p-3 bg-brand-bg border border-brand-border">
                <p className="text-[9px] text-brand-muted uppercase tracking-widest mb-1.5">File Reference</p>
                <div className="flex items-center gap-3">
                  <code className="text-sm text-brand font-mono">{step.file}</code>
                  {step.lineStart && step.lineEnd && (
                    <span className="text-[10px] text-brand-muted font-mono border border-brand-border px-2 py-0.5">
                      L{step.lineStart}–{step.lineEnd}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Code snippet */}
            {step.codeSnippet && (
              <div className="bg-[#0d0d0c] border border-brand-border overflow-hidden">
                {/* macOS chrome */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-brand-border bg-[#111110]">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                  </div>
                  <span className="text-[9px] font-mono text-brand-muted uppercase tracking-wider">
                    {step.file ? step.file.split("/").pop() : "snippet"}
                  </span>
                </div>
                <pre className="p-4 overflow-x-auto text-sm">
                  <code className="text-emerald-300 font-mono">{step.codeSnippet}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-5 py-2.5 border border-brand-border text-brand-muted hover:border-brand-muted hover:text-brand-text text-sm font-mono transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        {/* Step dot nav */}
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-1.5 transition-all duration-200 ${
                i === currentStep ? "bg-brand w-4" : "bg-brand-border w-1.5"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="px-5 py-2.5 bg-brand text-brand-bg hover:bg-brand/90 text-sm font-mono font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

      {/* Related modules */}
      {walkthrough.relatedModules && walkthrough.relatedModules.length > 0 && (
        <div className="p-4 border border-brand-border bg-brand-surface">
          <p className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold mb-2.5">Related Modules</p>
          <div className="flex flex-wrap gap-2">
            {walkthrough.relatedModules.map((mod, i) => (
              <span key={i} className="text-[11px] px-2.5 py-1 border border-brand-border bg-brand-bg text-brand-muted font-mono hover:border-brand/40 transition-colors">
                {mod}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
