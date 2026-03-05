/**
 * Animated walkthrough routes — generate and retrieve animated flow sequences.
 */

import { Router, type Router as RouterType } from "express";
import type { AnimationSequence } from "@autodev/shared";
import { invokeBedrock } from "../services/bedrock.js";
import { getArchitectureAnalysis } from "../services/analysisOrchestrator.js";
import { getAnalysisOutput, uploadAnalysisOutput, getLatestCodeIndex } from "../services/s3.js";
import { getRepoById } from "../services/dynamodb.js";
import { requireAuthMiddleware } from "../middleware/auth.js";
import { cacheThroughAsync } from "../services/cache.js";
import {
  ANIMATED_FLOW_SYSTEM_PROMPT,
  ANIMATED_FLOW_USER_PROMPT,
  NODE_EXPLANATION_SYSTEM_PROMPT,
  NODE_EXPLANATION_USER_PROMPT,
} from "../prompts/animatedFlow.js";

export const animatedRoutes: RouterType = Router();

/**
 * Parse JSON from a Bedrock response, handling markdown fences.
 */
function parseJson<T>(text: string): T {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "");
  }
  return JSON.parse(cleaned) as T;
}

// GET /api/animated/:owner/:repo — get animation sequences for a repo
animatedRoutes.get("/:owner/:repo", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;

  try {
    const repo = await getRepoById(repoId);
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }

    // Try S3 first (pre-generated sequences)
    const fromS3 = await getAnalysisOutput<AnimationSequence[]>(
      repoId,
      "animated-flows"
    );
    if (fromS3 && fromS3.length > 0) {
      res.json({ repoId, sequences: fromS3 });
      return;
    }

    res.json({ repoId, sequences: [] });
  } catch (error) {
    console.error(`[route] Failed to get animations for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to fetch animation sequences" });
  }
});

// POST /api/animated/:owner/:repo/generate — generate animation sequences
animatedRoutes.post("/:owner/:repo/generate", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;

  try {
    const repo = await getRepoById(repoId);
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }

    // Get architecture analysis (required)
    const architecture = await getArchitectureAnalysis(repoId);
    if (!architecture) {
      res.status(400).json({
        error: "Architecture analysis must be completed first",
      });
      return;
    }

    const architectureJson = JSON.stringify(architecture, null, 2);
    const summary = architecture.summary || "No summary available.";

    // Generate animation sequences
    const raw = await invokeBedrock(
      [
        {
          role: "user",
          content: ANIMATED_FLOW_USER_PROMPT(architectureJson, summary),
        },
      ],
      ANIMATED_FLOW_SYSTEM_PROMPT,
      { model: "sonnet", maxTokens: 8192 }
    );

    const sequences = parseJson<AnimationSequence[]>(raw);

    // Store in S3
    await uploadAnalysisOutput(repoId, "animated-flows", sequences);

    res.json({ repoId, sequences });
  } catch (error) {
    console.error(`[route] Animation generation failed for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to generate animation sequences" });
  }
});

// POST /api/animated/:owner/:repo/explain-node — explain a specific node on click
animatedRoutes.post("/:owner/:repo/explain-node", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const { nodeId } = req.body as { nodeId: string };

  if (!nodeId) {
    res.status(400).json({ error: "nodeId is required" });
    return;
  }

  try {
    const repo = await getRepoById(repoId);
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }

    const explanation = await cacheThroughAsync(
      "animation",
      repoId,
      `node-explain:${nodeId}`,
      async () => {
        const architecture = await getArchitectureAnalysis(repoId);
        if (!architecture) throw new Error("No architecture");

        const node = architecture.nodes.find(
          (n: { id: string }) => n.id === nodeId
        );
        if (!node) throw new Error(`Node ${nodeId} not found`);

        // Get relevant code for this node
        const files = await getLatestCodeIndex(repoId);
        const relevantCode = files
          ? files
              .filter((f: { path: string }) =>
                node.files.some((nf: string) => f.path.includes(nf))
              )
              .slice(0, 5)
              .map(
                (f: { path: string; content: string }) =>
                  `--- ${f.path} ---\n${f.content.slice(0, 2000)}`
              )
              .join("\n\n")
          : "No source code available.";

        const raw = await invokeBedrock(
          [
            {
              role: "user",
              content: NODE_EXPLANATION_USER_PROMPT(
                node.id,
                node.label,
                node.description,
                node.files,
                architecture.summary || "",
                relevantCode
              ),
            },
          ],
          NODE_EXPLANATION_SYSTEM_PROMPT,
          { model: "haiku", maxTokens: 2048 }
        );

        return parseJson(raw) as any;
      },
      3600 // cache for 1 hour
    );

    res.json({ repoId, nodeId, ...explanation });
  } catch (error) {
    console.error(
      `[route] Node explanation failed for ${repoId}/${nodeId}:`,
      error
    );
    res.status(500).json({ error: "Failed to explain node" });
  }
});
