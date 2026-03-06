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

  // Stop audio when changing steps or unmounting
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
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: step.explanation, voiceId: "Matthew" }),
        },
        token
      );

      if (!res.ok) throw new Error("Failed to synthesize audio");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      const audio = new Audio(url);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      
      audioRef.current = audio;
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      alert("Failed to play audio.");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-sm text-gray-400 hover:text-white transition-colors mb-2 flex items-center gap-1"
            >
              ← Back to walkthroughs
            </button>
          )}
          <h2 className="text-xl font-bold">{walkthrough.title || "Code Walkthrough"}</h2>
          {walkthrough.description && (
            <p className="text-gray-400 text-sm mt-1">{walkthrough.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {walkthrough.difficulty && (
            <span
              className={`text-xs px-2.5 py-1 rounded-full ${
                walkthrough.difficulty === "beginner"
                  ? "bg-green-900 text-green-300"
                  : walkthrough.difficulty === "intermediate"
                  ? "bg-yellow-900 text-yellow-300"
                  : "bg-red-900 text-red-300"
              }`}
            >
              {walkthrough.difficulty}
            </span>
          )}
          {walkthrough.estimatedMinutes && (
            <span className="text-xs text-gray-400">
              ~{walkthrough.estimatedMinutes} min
            </span>
          )}
        </div>
      </div>

      {/* Prerequisites */}
      {walkthrough.prerequisites && walkthrough.prerequisites.length > 0 && (
        <div className="p-3 border border-gray-800 rounded-lg bg-gray-900/50">
          <p className="text-xs text-gray-500 uppercase font-medium mb-2">Prerequisites</p>
          <ul className="text-sm text-gray-300 space-y-1">
            {walkthrough.prerequisites.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span> {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i === currentStep
                ? "bg-blue-500"
                : i < currentStep
                ? "bg-blue-800"
                : "bg-gray-700"
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-2">
          {currentStep + 1}/{steps.length}
        </span>
      </div>

      {/* Current step */}
      {step && (
        <div className="border border-gray-800 rounded-xl bg-gray-900/50 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                  {currentStep + 1}
                </span>
                <h3 className="text-lg font-semibold">{step.title || `Step ${currentStep + 1}`}</h3>
              </div>
              <button
                onClick={toggleAudio}
                disabled={isLoadingAudio}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-surface border border-brand-border hover:border-brand-DEFAULT rounded text-brand-muted hover:text-brand-text transition-colors text-xs font-mono"
                title="Read aloud with Amazon Polly"
              >
                {isLoadingAudio ? (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-DEFAULT" />
                ) : isPlaying ? (
                  <Square className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-brand-DEFAULT" />
                )}
                {isPlaying ? "Stop" : "Listen"}
              </button>
            </div>
            <p className="text-gray-300 leading-relaxed">{step.explanation}</p>

            {/* File reference */}
            {step.file && (
              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-500 mb-1">File</p>
                <code className="text-sm text-blue-300">{step.file}</code>
                {step.lineStart && step.lineEnd && (
                  <span className="text-xs text-gray-500 ml-2">
                    Lines {step.lineStart}–{step.lineEnd}
                  </span>
                )}
              </div>
            )}

            {/* Code snippet */}
            {step.codeSnippet && (
              <div className="mt-4">
                <pre className="p-4 bg-gray-950 rounded-lg border border-gray-800 overflow-x-auto text-sm">
                  <code className="text-gray-200">{step.codeSnippet}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

      {/* Related modules */}
      {walkthrough.relatedModules && walkthrough.relatedModules.length > 0 && (
        <div className="p-3 border border-gray-800 rounded-lg bg-gray-900/50">
          <p className="text-xs text-gray-500 uppercase font-medium mb-2">Related Modules</p>
          <div className="flex flex-wrap gap-2">
            {walkthrough.relatedModules.map((mod, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">
                {mod}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
