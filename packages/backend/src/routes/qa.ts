import { Router, type Router as RouterType } from "express";
import { createHash } from "crypto";
import { answerQuestion } from "../services/bedrock.js";
import { cacheQA, getCachedQA } from "../services/dynamodb.js";
import { getArchitectureAnalysis } from "../services/analysisOrchestrator.js";
import { getLatestCodeIndex } from "../services/s3.js";
import { searchCodebase } from "../services/semanticSearch.js";
import { translateContent } from "../services/i18n.js";
import { requireAuthMiddleware } from "../middleware/auth.js";
import type { SupportedLanguage } from "@autodev/shared";

export const qaRoutes: RouterType = Router();

// POST /api/qa/:owner/:repo — ask a question about the codebase
qaRoutes.post("/:owner/:repo", requireAuthMiddleware, async (req: any, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const { question, language, fresherMode } = req.body as {
    question: string;
    language?: SupportedLanguage;
    fresherMode?: boolean;
  };

  if (!question) {
    res.status(400).json({ error: "question is required" });
    return;
  }

  // Ensure user has access
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }


  try {
    // Check cache first
    const cachePrefix = `${language || "en"}:${fresherMode ? "fresher:" : ""}`;
    const questionHash = createHash("sha256")
      .update(`${cachePrefix}${question.toLowerCase().trim()}`)
      .digest("hex")
      .slice(0, 16);
    const cached = await getCachedQA(repoId, questionHash);
    if (cached) {
      res.json({ repoId, question, ...cached, fromCache: true });
      return;
    }

    // Get architecture context
    const architecture = await getArchitectureAnalysis(repoId);
    const architectureContext = architecture
      ? JSON.stringify(architecture, null, 2)
      : "No architecture analysis available yet.";

    // Semantic search for relevant files (replaces naive top-20 approach)
    let relevantFiles: string;
    try {
      const searchResults = await searchCodebase(repoId, question, 10);
      if (searchResults.length > 0) {
        relevantFiles = searchResults
          .map(
            (r) =>
              `--- ${r.path} (score: ${r.score.toFixed(3)}) ---\n${r.content.slice(0, 3000)}`
          )
          .join("\n\n");
      } else {
        throw new Error("No semantic results");
      }
    } catch {
      // Fallback to naive approach if embeddings aren't ready
      const files = await getLatestCodeIndex(repoId);
      relevantFiles = files
        ? files
            .slice(0, 20)
            .map((f) => `--- ${f.path} ---\n${f.content.slice(0, 3000)}`)
            .join("\n\n")
        : "No source files available.";
    }

    // Call Bedrock
    const rawAnswer = await answerQuestion(question, architectureContext, relevantFiles);

    // Parse response
    let parsed;
    try {
      let cleaned = rawAnswer.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
      }
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { answer: rawAnswer, relevantFiles: [], relatedQuestions: [] };
    }

    // Translate if a non-English language is requested
    if (language && language !== "en") {
      try {
        const translated = await translateContent(
          parsed.answer,
          language,
          repoId,
          fresherMode ?? false
        );
        parsed.translatedAnswer = translated.translatedText;
        parsed.language = language;
      } catch {
        // Keep English answer on translation failure
      }
    } else if (fresherMode) {
      try {
        const simplified = await translateContent(
          parsed.answer,
          "en",
          repoId,
          true
        );
        parsed.fresherAnswer = simplified.translatedText;
      } catch {
        // Keep original answer
      }
    }

    // Cache the result
    await cacheQA(repoId, questionHash, parsed).catch(() => {
      // Swallow cache errors
    });

    res.json({ repoId, question, ...parsed });
  } catch (error) {
    console.error(`[route] Q&A failed for ${repoId}:`, error);
    res.status(500).json({
      error: "Failed to answer question",
      repoId,
      question,
    });
  }
});
