/**
 * Convention detection routes — detect and retrieve coding conventions.
 */

import { Router, type Router as RouterType } from "express";
import type { Convention } from "@autodev/shared";
import { invokeBedrock } from "../services/bedrock.js";
import { getArchitectureAnalysis } from "../services/analysisOrchestrator.js";
import { getLatestCodeIndex } from "../services/s3.js";
import { getAnalysis, putAnalysis, getRepoById } from "../services/dynamodb.js";
import { getAnalysisOutput, uploadAnalysisOutput } from "../services/s3.js";
import { requireAuthMiddleware } from "../middleware/auth.js";
import {
  CONVENTIONS_SYSTEM_PROMPT,
  CONVENTIONS_USER_PROMPT,
} from "../prompts/conventions.js";
import { buildKeyFileContents } from "../prompts/architecture.js";

export const conventionRoutes: RouterType = Router();

// GET /api/conventions/:owner/:repo — get detected conventions
conventionRoutes.get("/:owner/:repo", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  try {
    const repo = await getRepoById(repoId);
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }

    // Try S3 first
    const fromS3 = await getAnalysisOutput<Convention[]>(repoId, "conventions");
    if (fromS3 && fromS3.length > 0) {
      res.json({ repoId, conventions: fromS3 });
      return;
    }

    // Fall back to DynamoDB
    const record = await getAnalysis(repoId, "conventions");
    const conventions = record?.content || [];
    res.json({ repoId, conventions });
  } catch (error) {
    console.error(`[route] Failed to get conventions for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to fetch conventions" });
  }
});

// POST /api/conventions/:owner/:repo — trigger convention detection
conventionRoutes.post("/:owner/:repo", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;

  try {
    const repo = await getRepoById(repoId);
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }

    // Respond immediately, run in background
    res.json({ repoId, status: "convention_detection_started" });

    // Background detection
    (async () => {
      try {
        const architecture = await getArchitectureAnalysis(repoId);
        const architectureContext = architecture
          ? JSON.stringify(architecture, null, 2)
          : "No architecture analysis available.";

        const files = await getLatestCodeIndex(repoId);
        const keyFileContents = files
          ? buildKeyFileContents(
              files.map((f) => ({ path: f.path, content: f.content, size: f.size }))
            )
          : "No source files available.";

        const rawResponse = await invokeBedrock(
          [
            {
              role: "user",
              content: CONVENTIONS_USER_PROMPT(architectureContext, keyFileContents),
            },
          ],
          CONVENTIONS_SYSTEM_PROMPT,
          { model: "sonnet", maxTokens: 8192 }
        );

        // Parse response
        let cleaned = rawResponse.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
        }

        const conventions = JSON.parse(cleaned) as Convention[];

        // Store in DynamoDB
        await putAnalysis({
          repoId,
          analysisType: `conventions#${new Date().toISOString()}`,
          version: 1,
          content: conventions,
          generatedAt: new Date().toISOString(),
          modelUsed: "anthropic.claude-3-5-sonnet-20241022-v2:0",
        });

        // Store in S3
        await uploadAnalysisOutput(repoId, "conventions", conventions);

        console.log(
          `[conventions] Detected ${conventions.length} conventions for ${repoId}`
        );
      } catch (err) {
        console.error(`[conventions] Detection failed for ${repoId}:`, err);
      }
    })();
  } catch (error) {
    console.error(`[route] Failed to start convention detection for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to start convention detection" });
  }
});
