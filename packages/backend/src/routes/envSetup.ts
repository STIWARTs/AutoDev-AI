/**
 * Environment setup routes — analyze and retrieve environment setup guides.
 */

import { Router, type Router as RouterType } from "express";
import type { EnvSetupGuide } from "@autodev/shared";
import { getLatestCodeIndex } from "../services/s3.js";
import { getAnalysis, putAnalysis, getRepoById } from "../services/dynamodb.js";
import { getAnalysisOutput, uploadAnalysisOutput } from "../services/s3.js";
import { requireAuthMiddleware } from "../middleware/auth.js";
import { analyzeEnvironmentSetup } from "../services/envAnalyzer.js";

export const envSetupRoutes: RouterType = Router();

// GET /api/env-setup/:owner/:repo — get environment setup guide
envSetupRoutes.get("/:owner/:repo", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  try {
    const repo = await getRepoById(repoId);
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }

    // Try S3 first
    const fromS3 = await getAnalysisOutput<EnvSetupGuide>(repoId, "env-setup");
    if (fromS3) {
      res.json({ repoId, envSetup: fromS3 });
      return;
    }

    // Fall back to DynamoDB
    const record = await getAnalysis(repoId, "env-setup");
    if (record?.content) {
      res.json({ repoId, envSetup: record.content });
      return;
    }

    res.json({ repoId, envSetup: null });
  } catch (error) {
    console.error(`[route] Failed to get env setup for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to fetch environment setup guide" });
  }
});

// POST /api/env-setup/:owner/:repo — trigger environment setup analysis
envSetupRoutes.post("/:owner/:repo", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;

  try {
    const repo = await getRepoById(repoId);
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }

    // Respond immediately
    res.json({ repoId, status: "env_setup_analysis_started" });

    // Background analysis
    (async () => {
      try {
        const files = await getLatestCodeIndex(repoId);
        if (!files) {
          console.error(`[env-setup] No code index found for ${repoId}`);
          return;
        }

        const envSetup = await analyzeEnvironmentSetup(files);

        // Store in DynamoDB
        await putAnalysis({
          repoId,
          analysisType: `env-setup#${new Date().toISOString()}`,
          version: 1,
          content: envSetup,
          generatedAt: new Date().toISOString(),
          modelUsed: "anthropic.claude-3-5-sonnet-20241022-v2:0",
        });

        // Store in S3
        await uploadAnalysisOutput(repoId, "env-setup", envSetup);

        console.log(
          `[env-setup] Analysis complete for ${repoId}: ${envSetup.setupSteps.length} steps, ${envSetup.conflicts.length} conflicts, ${envSetup.missingPieces.length} missing pieces`
        );
      } catch (err) {
        console.error(`[env-setup] Analysis failed for ${repoId}:`, err);
      }
    })();
  } catch (error) {
    console.error(`[route] Failed to start env setup analysis for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to start environment setup analysis" });
  }
});
