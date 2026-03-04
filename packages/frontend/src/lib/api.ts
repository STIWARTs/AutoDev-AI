"use client";

import { useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Returns true when demo mode is active.
 * Demo mode is triggered by ?demo=true query param or a "demo/" repoId prefix.
 */
export function useIsDemo(): boolean {
  const searchParams = useSearchParams();
  return searchParams.get("demo") === "true";
}

/**
 * Returns the correct API base URL for a given repoId.
 * Demo repos (repoId starts with "demo/") hit /api/demo/* endpoints
 * which serve pre-canned data without requiring AWS credentials.
 */
export function getApiBase(repoId?: string): string {
  if (repoId && repoId.startsWith("demo/")) {
    return `${API_BASE}/demo`;
  }
  return API_BASE;
}

/**
 * Build a full API URL for a repo-scoped endpoint.
 * Examples:
 *   apiUrl("demo/express-shop", "analysis", "architecture")
 *     → "http://localhost:3001/api/demo/analysis/demo/express-shop/architecture"
 *   apiUrl("octocat/hello-world", "analysis", "architecture")  
 *     → "http://localhost:3001/api/analysis/octocat/hello-world/architecture"
 */
export function apiUrl(repoId: string, ...pathSegments: string[]): string {
  const [owner, repo] = repoId.split("/");
  const base = getApiBase(repoId);
  const segments = pathSegments.length > 0
    ? `${pathSegments[0]}/${owner}/${repo}${pathSegments.length > 1 ? "/" + pathSegments.slice(1).join("/") : ""}`
    : `repos/${owner}/${repo}`;
  return `${base}/${segments}`;
}

export { API_BASE };
