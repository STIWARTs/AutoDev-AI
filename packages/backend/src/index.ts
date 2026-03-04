import "dotenv/config";
import express, { type Express } from "express";
import cors from "cors";
import { repoRoutes } from "./routes/repos.js";
import { analysisRoutes } from "./routes/analysis.js";
import { qaRoutes } from "./routes/qa.js";
import { internalRoutes } from "./routes/internal.js";
import { walkthroughRoutes } from "./routes/walkthroughs.js";
import { conventionRoutes } from "./routes/conventions.js";
import { envSetupRoutes } from "./routes/envSetup.js";
import { animatedRoutes } from "./routes/animated.js";
import { i18nRoutes } from "./routes/i18n.js";
import { skillTrackerRoutes } from "./routes/skillTracker.js";
import { demoRoutes } from "./routes/demo.js";

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" })); // Large payloads for code files

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "autodev-backend" });
});

// Warm-up endpoint — pre-initializes services and returns readiness
app.get("/api/warmup", async (_req, res) => {
  const start = Date.now();
  const checks: Record<string, string> = {};

  // Check demo routes are loaded
  checks.demo = "ok";

  // Check env vars for AWS (informational only)
  checks.aws = process.env.AWS_REGION ? "configured" : "not configured";
  checks.dynamodb = process.env.DYNAMODB_TABLE_PREFIX ? "configured" : "not configured";
  checks.s3 = process.env.S3_BUCKET ? "configured" : "not configured";

  const elapsed = Date.now() - start;
  res.json({
    status: "warm",
    service: "autodev-backend",
    latencyMs: elapsed,
    checks,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/repos", repoRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/qa", qaRoutes);
app.use("/api/internal", internalRoutes);
app.use("/api/walkthroughs", walkthroughRoutes);
app.use("/api/conventions", conventionRoutes);
app.use("/api/env-setup", envSetupRoutes);
app.use("/api/animated", animatedRoutes);
app.use("/api/i18n", i18nRoutes);
app.use("/api/progress", skillTrackerRoutes);
app.use("/api/demo", demoRoutes);

app.listen(PORT, () => {
  console.log(`AutoDev backend running on http://localhost:${PORT}`);
});

export default app;
