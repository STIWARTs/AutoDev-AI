import { Router } from "express";
import fetch from "node-fetch";
import unzipper from "unzipper";
import mime from "mime-types";
import { uploadCodeIndexWithLatest } from "../services/s3.js";
import { putRepo } from "../services/dynamodb.js";
import { runArchitectureAnalysis } from "../services/analysisOrchestrator.js";

export const webhookRoutes = Router();

/**
 * POST /api/webhook/github
 * Simulates a GitHub App Webhook or manual trigger to clone a repository.
 * Downloads the repository zip, parses it in memory, stores to S3.
 */
webhookRoutes.post("/github", async (req, res) => {
  const { repoId, branch = "main" } = req.body as { repoId: string; branch?: string };

  if (!repoId || !repoId.includes("/")) {
    res.status(400).json({ error: "Invalid repoId. Must be 'owner/repo'" });
    return;
  }

  const [owner] = repoId.split("/");

  // Immediately create a pending entry so the repo card appears right away
  await putRepo({
    repoId,
    userId: owner,
    repoUrl: `https://github.com/${repoId}`,
    defaultBranch: branch,
    analysisStatus: "analyzing",
    createdAt: new Date().toISOString(),
  });

  // Respond immediately — processing happens in background
  res.json({ repoId, status: "queued", message: "Repository queued for ingestion" });

  // Background: download, extract, upload, analyze
  (async () => {
    try {
      console.log(`[webhook] Fetching ${repoId} branch ${branch}...`);

      const zipUrl = `https://github.com/${repoId}/archive/refs/heads/${branch}.zip`;
      const response = await fetch(zipUrl, { redirect: "follow" });

      if (!response.ok) {
        throw new Error(`GitHub returned ${response.status} for ${zipUrl}`);
      }

      const zipBuffer = Buffer.from(await response.arrayBuffer());
      console.log(`[webhook] Downloaded ${(zipBuffer.length / 1024).toFixed(0)}KB ZIP for ${repoId}`);

      const directory = await unzipper.Open.buffer(zipBuffer);
      const files: { path: string; content: string; size: number }[] = [];

      for (const entry of directory.files) {
        const fileName = entry.path;
        const size = entry.uncompressedSize;
        if (
          entry.type === "File" &&
          size < 1000000 &&
          !fileName.includes("/node_modules/") &&
          !fileName.includes("/.git/") &&
          !fileName.includes("/dist/") &&
          !fileName.includes("/build/")
        ) {
          const mimeType = mime.lookup(fileName) || "text/plain";
          if (mimeType.startsWith("text/") || mimeType === "application/json" || fileName.match(/\.(ts|js|jsx|tsx|py|go|java|rs|cpp|c|h|md)$/i)) {
            const contentBuffer = await entry.buffer();
            files.push({
              path: fileName.replace(/^[^/]+\//, ""),
              content: contentBuffer.toString("utf-8"),
              size,
            });
          }
        }
      }

      console.log(`[webhook] Extracted ${files.length} files for ${repoId}`);

      if (files.length === 0) {
        await putRepo({ repoId, userId: owner, repoUrl: `https://github.com/${repoId}`, defaultBranch: branch, analysisStatus: "failed", createdAt: new Date().toISOString() });
        return;
      }

      await uploadCodeIndexWithLatest(repoId, "latest", files);

      await putRepo({
        repoId,
        userId: owner,
        repoUrl: `https://github.com/${repoId}`,
        defaultBranch: branch,
        analysisStatus: "pending",
        fileCount: files.length,
        createdAt: new Date().toISOString(),
      });

      runArchitectureAnalysis({ repoId, files }).catch((err) =>
        console.error(`[webhook] Background analysis failed for ${repoId}:`, err)
      );
    } catch (err: any) {
      console.error(`[webhook] Background ingestion failed for ${repoId}:`, err.message);
      await putRepo({ repoId, userId: owner, repoUrl: `https://github.com/${repoId}`, defaultBranch: branch, analysisStatus: "failed", createdAt: new Date().toISOString() }).catch(() => {});
    }
  })();
});
