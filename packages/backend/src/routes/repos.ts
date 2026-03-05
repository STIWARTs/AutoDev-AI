import { Router, type Router as RouterType } from "express";
import { requireAuthMiddleware } from "../middleware/auth.js";
import {
  getRepoById,
  getReposByUser,
  listAllRepos,
} from "../services/dynamodb.js";
import { runArchitectureAnalysis } from "../services/analysisOrchestrator.js";

export const repoRoutes: RouterType = Router();

repoRoutes.get("/", requireAuthMiddleware, async (req: any, res) => {
  try {
    const userId = req.auth?.userId;
    // Fall back to listing all repos if we're in a demo/no-auth situation that slipped through, 
    // though requireAuthMiddleware should catch it.
    const repos = userId ? await getReposByUser(userId) : await listAllRepos();
    res.json({ repos });
  } catch (error) {
    console.error("[route] Failed to list repos:", error);
    res.status(500).json({ error: "Failed to list repos" });
  }
});

// GET /api/repos/:owner/:repo — get repo details
repoRoutes.get("/:owner/:repo", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  try {
    const repo = await getRepoById(repoId);
    
    // Ensure the user requesting this has access
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }
    
    res.json(repo);
  } catch (error) {
    console.error(`[route] Failed to get repo ${repoId}:`, error);
    res.status(500).json({ error: "Failed to fetch repository" });
  }
});

// POST /api/repos/:owner/:repo/analyze — trigger analysis
repoRoutes.post("/:owner/:repo/analyze", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  try {
    const repo = await getRepoById(repoId);
    
    // Ensure the user requesting this has access
    if (!repo || (repo.userId !== req.auth?.userId && repo.userId !== "system")) {
      res.status(404).json({ repoId, error: "Repository not found" });
      return;
    }

    res.json({ repoId, status: "analysis_queued" });

    // Run analysis in background
    runArchitectureAnalysis({ repoId }).catch((err) =>
      console.error(`[route] Background analysis failed for ${repoId}:`, err)
    );
  } catch (error) {
    console.error(`[route] Failed to trigger analysis for ${repoId}:`, error);
    res.status(500).json({ error: "Failed to trigger analysis" });
  }
});
