import * as vscode from "vscode";
import {
  mockArchitecture,
  mockWalkthroughs,
  getMockGeneratedWalkthrough,
  mockConventions,
  getMockQAResponse,
  mockAnimationSequences,
  getMockNodeExplanation,
  mockEnvSetup,
  mockUserProgress,
  mockLanguages,
} from "./mockData";

// ─── Config helpers ──────────────────────────────────────────────────────────

export function getApiBase(): string {
  return (
    vscode.workspace
      .getConfiguration("autodev")
      .get<string>("apiUrl") || "http://localhost:3001/api"
  );
}

export function getApiToken(): string {
  return (
    vscode.workspace
      .getConfiguration("autodev")
      .get<string>("apiToken") || ""
  );

}

export function getRepoId(): string {
  return (
    vscode.workspace
      .getConfiguration("autodev")
      .get<string>("repoId") || ""
  );
}

export function getLanguage(): string {
  return (
    vscode.workspace
      .getConfiguration("autodev")
      .get<string>("language") || "en"
  );
}

export function getFresherMode(): boolean {
  return (
    vscode.workspace
      .getConfiguration("autodev")
      .get<boolean>("fresherMode") || false
  );
}

// ─── HTTP client ─────────────────────────────────────────────────────────────

interface ApiOptions {
  method?: string;
  body?: unknown;
}

async function apiCall<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body } = options;
  const token = getApiToken();
  const baseUrl = getApiBase();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(
      `AutoDev API error ${response.status}: ${response.statusText}${errText ? ` — ${errText.slice(0, 120)}` : ""}`
    );
  }

  return response.json() as Promise<T>;
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function getArchitecture(owner: string, repo: string) {
  try {
    return await apiCall(`/analysis/${owner}/${repo}/architecture`);
  } catch {
    return mockArchitecture;
  }
}

export async function getWalkthroughs(owner: string, repo: string) {
  try {
    return await apiCall(`/walkthroughs/${owner}/${repo}`);
  } catch {
    return mockWalkthroughs;
  }
}

export async function generateWalkthrough(
  owner: string,
  repo: string,
  question: string
) {
  try {
    return await apiCall(`/walkthroughs/${owner}/${repo}`, {
      method: "POST",
      body: { question },
    });
  } catch {
    return getMockGeneratedWalkthrough(question);
  }
}

export async function getConventions(owner: string, repo: string) {
  try {
    return await apiCall(`/conventions/${owner}/${repo}`);
  } catch {
    return mockConventions;
  }
}

export async function askQuestion(
  owner: string,
  repo: string,
  question: string,
  language: string = "en",
  fresherMode: boolean = false
) {
  try {
    return await apiCall(`/qa/${owner}/${repo}`, {
      method: "POST",
      body: { question, language, fresherMode },
    });
  } catch {
    await new Promise((r) => setTimeout(r, 3000 + Math.random() * 1500));
    return getMockQAResponse(question);
  }
}

export async function getAnimationSequences(owner: string, repo: string) {
  try {
    return await apiCall(`/animated/${owner}/${repo}`);
  } catch {
    return mockAnimationSequences;
  }
}

export async function generateAnimationSequences(
  owner: string,
  repo: string,
  fresherMode: boolean = false
) {
  try {
    return await apiCall(`/animated/${owner}/${repo}/generate`, {
      method: "POST",
      body: { fresherMode },
    });
  } catch {
    return mockAnimationSequences;
  }
}

export async function explainNode(
  owner: string,
  repo: string,
  nodeId: string,
  fresherMode: boolean = false
) {
  try {
    return await apiCall(`/animated/${owner}/${repo}/explain-node`, {
      method: "POST",
      body: { nodeId, fresherMode },
    });
  } catch {
    return getMockNodeExplanation(nodeId);
  }
}

export async function getEnvSetup(owner: string, repo: string) {
  try {
    return await apiCall(`/env-setup/${owner}/${repo}`);
  } catch {
    return mockEnvSetup;
  }
}

export async function getUserProgress(
  owner: string,
  repo: string,
  userId: string
) {
  try {
    return await apiCall(`/progress/${owner}/${repo}/${userId}`);
  } catch {
    return mockUserProgress;
  }
}

export async function getSupportedLanguages() {
  try {
    return await apiCall(`/i18n/languages`);
  } catch {
    return mockLanguages;
  }
}

export async function translateText(
  text: string,
  targetLanguage: string,
  repoId: string,
  fresherMode: boolean = false
) {
  try {
    return await apiCall(`/i18n/translate`, {
      method: "POST",
      body: { text, targetLanguage, repoId, fresherMode },
    });
  } catch {
    return { translatedText: text };
  }
}
