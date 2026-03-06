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

  try {
    console.log(`[webhook] Fetching ${repoId} branch ${branch}...`);
    
    // 1. Download repo as ZIP from GitHub
    const zipUrl = `https://github.com/${repoId}/archive/refs/heads/${branch}.zip`;
    const response = await fetch(zipUrl);

    if (!response.ok) {
      if (response.status === 404) {
         res.status(404).json({ error: `Repository or branch not found at ${zipUrl}` });
         return;
      }
      throw new Error(`Failed to fetch from GitHub: ${response.statusText}`);
    }

    // 2. Extract in memory
    const files: { path: string; content: string; size: number }[] = [];
    const zipStream = response.body?.pipe(unzipper.Parse());

    if (!zipStream) {
      throw new Error("Failed to read zip stream");
    }

    for await (const entry of zipStream) {
      const fileName = entry.path;
      const type = entry.type; // 'Directory' or 'File'
      const size = entry.vars.uncompressedSize; // Uncompressed size

      // Skip directories, binary files, max size 1MB, node_modules etc.
      if (
        type === "File" &&
        size < 1000000 &&
        !fileName.includes("/node_modules/") &&
        !fileName.includes("/.git/") &&
        !fileName.includes("/dist/") &&
        !fileName.includes("/build/")
      ) {
        // Simple heuristic to skip binary files
        const mimeType = mime.lookup(fileName) || "text/plain";
        if (mimeType.startsWith("text/") || mimeType === "application/json" || fileName.match(/\.(ts|js|jsx|tsx|py|go|java|rs|cpp|c|h|md)$/i)) {
          const contentBuffer = await entry.buffer();
          files.push({
            path: fileName.replace(/^[^\/]+\//, ""), // Remove the root folder inside the zip
            content: contentBuffer.toString("utf-8"),
            size,
          });
        } else {
          entry.autodrain();
        }
      } else {
        entry.autodrain();
      }
    }

    if (files.length === 0) {
      res.status(400).json({ error: "No valid source files found in repository." });
      return;
    }

    console.log(`[webhook] Extracted ${files.length} files for ${repoId}`);

    // 3. Store in S3
    const commitSha = "latest"; // For a real webhook, we'd use the SHA from the payload
    await uploadCodeIndexWithLatest(repoId, commitSha, files);

    // 4. Update DynamoDB
    await putRepo({
      repoId,
      userId: owner, // Default to repo owner
      repoUrl: `https://github.com/${repoId}`,
      defaultBranch: branch,
      analysisStatus: "pending",
      fileCount: files.length,
      createdAt: new Date().toISOString(),
    });

    // 5. Trigger Analysis (ECS Worker Simulator)
    res.json({ repoId, status: "ingested", fileCount: files.length, message: "Analysis started" });

    runArchitectureAnalysis({ repoId, files }).catch((err) =>
      console.error(`[webhook] Background analysis failed for ${repoId}:`, err)
    );

  } catch (error: any) {
    console.error(`[webhook] Failed to process ${repoId}:`, error);
    res.status(500).json({ error: "Failed to process repository: " + error.message });
  }
});
