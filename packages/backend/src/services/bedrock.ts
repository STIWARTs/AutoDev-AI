import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import type { ArchitectureMap } from "@autodev/shared";
import {
  ARCHITECTURE_SYSTEM_PROMPT,
  ARCHITECTURE_PASS1_USER_PROMPT,
  ARCHITECTURE_PASS2_USER_PROMPT,
  buildFileTree,
  buildConfigContents,
  buildKeyFileContents,
} from "../prompts/architecture.js";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const CLAUDE_SONNET_MODEL = "us.anthropic.claude-3-5-haiku-20241022-v1:0";
const CLAUDE_HAIKU_MODEL = "us.anthropic.claude-3-haiku-20240307-v1:0";

interface BedrockMessage {
  role: "user" | "assistant";
  content: string;
}

interface BedrockOptions {
  model?: "sonnet" | "haiku";
  maxTokens?: number;
  temperature?: number;
}

export async function invokeBedrock(
  messages: BedrockMessage[],
  systemPrompt: string,
  options: BedrockOptions = {}
): Promise<string> {
  const {
    model = "sonnet",
    maxTokens = 4096,
    temperature = 0.3,
  } = options;

  const modelId = model === "haiku" ? CLAUDE_HAIKU_MODEL : CLAUDE_SONNET_MODEL;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: new TextEncoder().encode(body),
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  return responseBody.content[0].text;
}

/**
 * Parse JSON from a Bedrock response, handling markdown fences gracefully.
 */
function parseJsonResponse(text: string): unknown {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return JSON.parse(cleaned);
}

/**
 * Two-pass architecture analysis using Bedrock Claude.
 * Pass 1: Scan file tree + config files to identify high-level structure.
 * Pass 2: Read key source files to refine module boundaries and edges.
 */
export async function analyzeArchitecture(
  files: { path: string; content: string; size: number }[]
): Promise<ArchitectureMap> {
  const fileTree = buildFileTree(files);
  const configContents = buildConfigContents(files);
  const keyFileContents = buildKeyFileContents(files);

  // Pass 1: Analyze file tree and config files
  const pass1Raw = await invokeBedrock(
    [{ role: "user", content: ARCHITECTURE_PASS1_USER_PROMPT(fileTree, configContents) }],
    ARCHITECTURE_SYSTEM_PROMPT,
    { model: "sonnet", maxTokens: 8192 }
  );

  // Pass 2: Deep analysis with key source files
  const pass2Raw = await invokeBedrock(
    [{ role: "user", content: ARCHITECTURE_PASS2_USER_PROMPT(pass1Raw, keyFileContents) }],
    ARCHITECTURE_SYSTEM_PROMPT,
    { model: "sonnet", maxTokens: 8192 }
  );

  const result = parseJsonResponse(pass2Raw) as ArchitectureMap;
  return result;
}

/**
 * Answer a question about a codebase using architecture context and relevant files.
 */
export async function answerQuestion(
  question: string,
  architectureContext: string,
  relevantFiles: string
): Promise<string> {
  const systemPrompt = `You are an AI assistant helping a developer understand a codebase. Answer their question clearly and concisely.
Reference specific files and line numbers when relevant.
Return a JSON object:
{
  "answer": "your detailed answer",
  "relevantFiles": [{ "path": "file/path.ts", "lineRange": { "start": 1, "end": 10 } }],
  "relatedQuestions": ["suggested follow-up question 1", "question 2"]
}
Return ONLY valid JSON.`;

  const userMessage = `Project architecture:\n${architectureContext}\n\nRelevant source files:\n${relevantFiles}\n\nQuestion: ${question}`;

  return invokeBedrock(
    [{ role: "user", content: userMessage }],
    systemPrompt,
    { model: "haiku", maxTokens: 4096 }
  );
}
