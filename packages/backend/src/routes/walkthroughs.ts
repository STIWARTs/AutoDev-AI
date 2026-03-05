/**
 * Walkthrough routes — generate and retrieve step-by-step code walkthroughs.
 */

import { Router, type Router as RouterType } from "express";
import type { Walkthrough } from "@autodev/shared";
import { invokeBedrock } from "../services/bedrock.js";
import { getArchitectureAnalysis } from "../services/analysisOrchestrator.js";
import { getLatestCodeIndex } from "../services/s3.js";
import { getAnalysis, putAnalysis, getRepoById } from "../services/dynamodb.js";
import { getAnalysisOutput, uploadAnalysisOutput } from "../services/s3.js";
import { requireAuthMiddleware } from "../middleware/auth.js";
import {
  WALKTHROUGH_SYSTEM_PROMPT,
  WALKTHROUGH_USER_PROMPT,
} from "../prompts/walkthrough.js";

export const walkthroughRoutes: RouterType = Router();

// GET /api/walkthroughs/:owner/:repo — list all walkthroughs for a repo
walkthroughRoutes.get("/:owner/:repo", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  try {
    const repo = await getRepoById(repoId);
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }

    // Try S3 first (pre-generated walkthroughs)
    const fromS3 = await getAnalysisOutput<Walkthrough[]>(repoId, "walkthroughs");
    if (fromS3 && fromS3.length > 0) {
      res.json({ repoId, walkthroughs: fromS3 });
      return;
    }

    // Fall back to DynamoDB
    const record = await getAnalysis(repoId, "walkthrough");
    const walkthroughs = record?.content ? [record.content] : [];
    res.json({ repoId, walkthroughs });
  } catch (error) {
    console.error(`[route] Failed to get walkthroughs for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to fetch walkthroughs" });
  }
});

// POST /api/walkthroughs/:owner/:repo — generate a custom walkthrough from a question
walkthroughRoutes.post("/:owner/:repo", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const { question } = req.body as { question: string };

  if (!question) {
    res.status(400).json({ error: "question is required" });
    return;
  }

  try {
    const repo = await getRepoById(repoId);
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }

    // Get architecture context
    const architecture = await getArchitectureAnalysis(repoId);
    const architectureContext = architecture
      ? JSON.stringify(architecture, null, 2)
      : "No architecture analysis available yet.";

    // Get relevant source files
    const files = await getLatestCodeIndex(repoId);
    const relevantFiles = files
      ? files
          .slice(0, 20)
          .map((f) => `--- ${f.path} ---\n${f.content.slice(0, 3000)}`)
          .join("\n\n")
      : "No source files available.";

    // Generate walkthrough via Bedrock
    const rawResponse = await invokeBedrock(
      [
        {
          role: "user",
          content: WALKTHROUGH_USER_PROMPT(question, architectureContext, relevantFiles),
        },
      ],
      WALKTHROUGH_SYSTEM_PROMPT,
      { model: "sonnet", maxTokens: 8192 }
    );

    // Parse response
    let cleaned = rawResponse.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    const walkthrough = JSON.parse(cleaned) as Walkthrough;
    walkthrough.repoId = repoId;
    walkthrough.question = question;
    walkthrough.generatedAt = new Date().toISOString();

    // Store in DynamoDB
    await putAnalysis({
      repoId,
      analysisType: `walkthrough#custom#${walkthrough.generatedAt}`,
      version: 1,
      content: walkthrough,
      generatedAt: walkthrough.generatedAt,
      modelUsed: "anthropic.claude-3-5-sonnet-20241022-v2:0",
    });

    // Append to S3 walkthroughs list
    const existing = await getAnalysisOutput<Walkthrough[]>(repoId, "walkthroughs");
    const allWalkthroughs = [...(existing || []), walkthrough];
    await uploadAnalysisOutput(repoId, "walkthroughs", allWalkthroughs);

    res.json({ repoId, walkthrough });
  } catch (error) {
    console.error(`[route] Walkthrough generation failed for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to generate walkthrough" });
  }
});

// GET /api/walkthroughs/:owner/:repo/:walkthroughId — get a specific walkthrough
walkthroughRoutes.get("/:owner/:repo/:walkthroughId", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const { walkthroughId } = req.params;

  try {
    const repo = await getRepoById(repoId);
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }

    const all = await getAnalysisOutput<Walkthrough[]>(repoId, "walkthroughs");
    const walkthrough = all?.find((w) => w.id === walkthroughId);

    if (!walkthrough) {
      res.status(404).json({ error: "Walkthrough not found" });
      return;
    }

    res.json({ repoId, walkthrough });
  } catch (error) {
    console.error(`[route] Failed to get walkthrough ${walkthroughId}:`, error);
    res.status(500).json({ error: "Failed to fetch walkthrough" });
  }
});
