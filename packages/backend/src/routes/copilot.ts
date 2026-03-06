import { Router } from "express";
import { requireAuthMiddleware } from "../middleware/auth.js";
import { getArchitectureAnalysis } from "../services/analysisOrchestrator.js";
import { answerQuestion } from "../services/bedrock.js";

export const copilotRoutes = Router();

/**
 * POST /api/copilot/explain
 * Killer Feature: VS Code Extension Endpoint
 * Explain a specific file/function context based on the architecture graph.
 */
copilotRoutes.post("/explain", requireAuthMiddleware, async (req: any, res) => {
  const { repoId, filePath, codeSnippet } = req.body as {
    repoId: string;
    filePath: string;
    codeSnippet?: string;
  };

  if (!repoId || !filePath) {
    res.status(400).json({ error: "repoId and filePath are required" });
    return;
  }

  try {
    // 1. Fetch Architecture Graph
    const architecture = await getArchitectureAnalysis(repoId);
    if (!architecture) {
      res.status(404).json({ error: "Architecture analysis not found for this repository." });
      return;
    }

    // 2. Find the Node in the Graph
    const targetNode = architecture.nodes.find(n => n.files.some(f => f.includes(filePath)));
    
    let graphContext = "No specific node found for this file.";
    let callers: (string | undefined)[] = [];
    let callees: (string | undefined)[] = [];

    if (targetNode) {
      // 3. Find Callers and Callees looking at Edges
      callers = architecture.edges
        .filter(e => e.target === targetNode.id)
        .map(e => architecture.nodes.find(n => n.id === e.source)?.label)
        .filter(Boolean);

      callees = architecture.edges
        .filter(e => e.source === targetNode.id)
        .map(e => architecture.nodes.find(n => n.id === e.target)?.label)
        .filter(Boolean);

      graphContext = `
This file belongs to the module: "${targetNode.label}" (${targetNode.type}).
Module Description: ${targetNode.description}

It is called by (Incoming dependencies):
${callers.length > 0 ? callers.join(", ") : "None detected"}

It calls (Outgoing dependencies):
${callees.length > 0 ? callees.join(", ") : "None detected"}
      `;
    }

    // 4. Send to Bedrock to generate explanation
    const prompt = `
Explain the architecture around this file for a new developer.
Target File: ${filePath}

Context from Codebase Analyzer:
${graphContext}

${codeSnippet ? `Code Snippet Context:\n${codeSnippet}` : ""}

Provide a clear, brief explanation formatted in Markdown. 
In the explanation, explicitly mention exactly what module it belongs to, what calls it, and what it calls based ONLY on the context provided.
    `;

    // Reusing the QA engine's bedrock invocation
    const rawAnswer = await answerQuestion(prompt, JSON.stringify(architecture.edges), `--- ${filePath} ---`);
    
    // Parse response from QA format
    let finalAnswer = rawAnswer;
    try {
      let cleaned = rawAnswer.trim();
      if (cleaned.startsWith("\`\`\`")) {
        cleaned = cleaned.replace(/^\`\`\`(?:json)?\s*\n?/, "").replace(/\n?\`\`\`\s*$/, "");
      }
      const parsed = JSON.parse(cleaned);
      if (parsed.answer) {
         finalAnswer = parsed.answer;
      }
    } catch {
       // It's probably plain text markdown
    }

    // 5. Return Copilot Response
    res.json({
      repoId,
      filePath,
      belongsTo: targetNode ? targetNode.label : null,
      callers,
      callees,
      explanation: finalAnswer,
    });

  } catch (error: any) {
    console.error(`[copilot] Failed to explain ${filePath} in ${repoId}:`, error);
    res.status(500).json({ error: "Failed to generate copilot explanation." });
  }
});
