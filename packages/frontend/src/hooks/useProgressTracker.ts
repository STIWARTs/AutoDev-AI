"use client";

import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { fetchApi } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type ProgressEventType =
  | "walkthrough_viewed"
  | "qa_asked"
  | "module_explored"
  | "convention_viewed"
  | "env_setup_viewed"
  | "animated_viewed";

interface TrackEventOptions {
  eventType: ProgressEventType;
  targetId?: string;
  targetLabel?: string;
  durationMs?: number;
}

/**
 * Hook that returns a `track` function to record a user progress event
 * against a specific repository.
 *
 * The hook is a no-op for demo repositories (repoId starts with "demo/").
 */
export function useProgressTracker(repoId: string) {
  const { getToken } = useAuth();
  const isDemo = repoId.startsWith("demo/");
  const [owner, repo] = repoId.split("/");

  const track = useCallback(
    async (opts: TrackEventOptions) => {
      // Never emit events for demo repos — no user data there
      if (isDemo) return;
      if (!owner || !repo) return;

      try {
        const token = await getToken();
        await fetchApi(
          `${API_BASE}/progress/${owner}/${repo}/event`,
          {
            method: "POST",
            body: JSON.stringify({
              eventType: opts.eventType,
              targetId: opts.targetId,
              targetLabel: opts.targetLabel,
              durationMs: opts.durationMs,
            }),
          },
          token
        );
      } catch {
        // Silently fail — progress tracking is non-critical
      }
    },
    [isDemo, owner, repo, getToken]
  );

  return { track };
}
