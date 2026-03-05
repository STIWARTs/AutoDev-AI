import { Router, type Router as RouterType } from "express";
import {
  getArchitectureAnalysis,
  runArchitectureAnalysis,
} from "../services/analysisOrchestrator.js";
import { getAnalysis, getRepoById } from "../services/dynamodb.js";
import { requireAuthMiddleware } from "../middleware/auth.js";

export const analysisRoutes: RouterType = Router();

// GET /api/analysis/:owner/:repo/architecture — get architecture map
analysisRoutes.get("/:owner/:repo/architecture", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  try {
    const repo = await getRepoById(repoId);
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }

    const architecture = await getArchitectureAnalysis(repoId);
    res.json({ repoId, architecture });
  } catch (error) {
    console.error(`[route] Failed to get architecture for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to fetch architecture analysis" });
  }
});

// POST /api/analysis/:owner/:repo/architecture — trigger architecture analysis
analysisRoutes.post("/:owner/:repo/architecture", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  try {
    const repo = await getRepoById(repoId);
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }

    // Fire-and-forget: respond immediately, run analysis in background
    res.json({ repoId, status: "analysis_started" });

    runArchitectureAnalysis({ repoId }).catch((err) =>
      console.error(`[route] Background analysis failed for ${repoId}:`, err)
    );
  } catch (error) {
    console.error(`[route] Failed to start analysis for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to start analysis" });
  }
});

// GET /api/analysis/:owner/:repo/conventions — get detected conventions
analysisRoutes.get("/:owner/:repo/conventions", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  try {
    const repo = await getRepoById(repoId);
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }

    const record = await getAnalysis(repoId, "conventions");
    const conventions = record?.content || [];
    res.json({ repoId, conventions });
  } catch (error) {
    console.error(`[route] Failed to get conventions for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to fetch conventions" });
  }
});

// GET /api/analysis/:owner/:repo/walkthroughs — get walkthroughs
analysisRoutes.get("/:owner/:repo/walkthroughs", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  try {
    const repo = await getRepoById(repoId);
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }

    const record = await getAnalysis(repoId, "walkthrough");
    const walkthroughs = record?.content ? [record.content] : [];
    res.json({ repoId, walkthroughs });
  } catch (error) {
    console.error(`[route] Failed to get walkthroughs for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to fetch walkthroughs" });
  }
});
