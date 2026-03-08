"use client";

import { useCallback, useMemo, useState } from "react";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ArchitectureMap as ArchMap } from "@autodev/shared";
import { Sparkles, X, FileCode2, Loader2 } from "lucide-react";

// Detailed AI explanations keyed by node label (normalized to lowercase)
const NODE_EXPLANATIONS: Record<string, string> = {
  "frontend app": `This is the React + Vite entry point of the application. It bootstraps the entire client-side tree by mounting the root <App /> component and wrapping it with all context providers (AuthContext, ThemeContext). Vite handles HMR during development and produces an optimized ESM bundle for production.\n\n**Key responsibilities:**\n• Initializes React DOM and renders the component tree\n• Registers service workers (if any) for offline support\n• Sets up global CSS resets and Tailwind base styles\n• Configures environment-specific API base URLs via import.meta.env`,

  "context providers": `Manages all global client-side state using React Context API. This layer sits at the top of the component tree and exposes shared state — including the authenticated user, current conversation thread, and UI theme — to all child components without prop-drilling.\n\n**State slices managed:**\n• \`AuthContext\` — stores user session, login/logout actions\n• \`ChatContext\` — holds active thread ID, message history, streaming status\n• \`ThemeContext\` — dark/light mode toggle persisted to localStorage\n\n**Pattern used:** Each context pairs a Provider with a custom hook (e.g., \`useAuth()\`, \`useChat()\`) for clean consumption.`,

  "chat ui": `The primary user-facing interface. Built with React functional components and styled using Tailwind CSS. Implements a streaming message display that renders AI tokens progressively as they arrive from the backend SSE stream.\n\n**Component breakdown:**\n• \`ChatWindow\` — scrollable message list with auto-scroll-to-bottom\n• \`MessageBubble\` — renders markdown (via react-markdown) with syntax highlighting\n• \`InputBar\` — textarea with Shift+Enter newline, Enter to send\n• \`SidebarHistory\` — lists previous threads, allows rename/delete\n\n**Notable detail:** Messages are optimistically appended to the UI before the server confirms, giving a snappy feel.`,

  "backend server": `The Express.js server that serves as the API gateway between the frontend and all backend services. Handles CORS, JSON parsing, JWT authentication middleware, and routes all requests to the appropriate service layer.\n\n**Middleware stack (in order):**\n1. \`cors()\` — allows requests from the Vite dev server\n2. \`express.json()\` — parses request bodies\n3. \`authMiddleware\` — validates JWT from Authorization header\n4. Route handlers — \`/api/chat\`, \`/api/threads\`, \`/api/auth\`\n\n**Runs on:** \`http://localhost:3000\` (dev) with nodemon for hot reload.`,

  "chat routes": `Defines all HTTP endpoints related to chat operations. Delegates business logic to the Claude service and Thread model, keeping route handlers thin and focused on request/response transformation.\n\n**Endpoints:**\n• \`POST /api/chat\` — sends a user message, streams Claude response via SSE\n• \`GET /api/threads\` — lists all threads for the authenticated user\n• \`POST /api/threads\` — creates a new conversation thread\n• \`DELETE /api/threads/:id\` — soft-deletes a thread\n• \`GET /api/threads/:id/messages\` — returns paginated message history\n\n**Streaming:** Uses \`res.write()\` with \`text/event-stream\` content-type to push tokens as they arrive from Claude Sonnet 4.5.`,

  "claude ai": `The AI integration layer. Wraps the Anthropic Claude Sonnet 4.5 API and handles prompt construction, token streaming, and error handling. Abstracts all AI provider details so the rest of the codebase stays provider-agnostic.\n\n**Implementation details:**\n• Uses \`@anthropic-ai/sdk\` with streaming support for real-time token delivery\n• Constructs conversation history in Anthropic's \`messages[]\` format from stored thread data\n• Applies a system prompt that defines the assistant's persona and capabilities\n• Handles rate-limit errors with exponential backoff (3 retries)\n• Model: \`claude-sonnet-4-5\` with max_tokens 4096`,

  "thread model": `MongoDB data model for conversation threads and their messages. Uses Mongoose for schema validation and provides static methods for common queries.\n\n**Schema structure:**\n\`\`\`\nThread {\n  userId: String (indexed)\n  title: String\n  createdAt: Date\n  messages: [{\n    role: "user" | "model"\n    content: String\n    timestamp: Date\n  }]\n}\n\`\`\`\n**Indexes:** Compound index on \`(userId, createdAt)\` for efficient user thread listing sorted by recency.\n\n**Methods:** \`Thread.findByUser(userId)\`, \`thread.appendMessage(role, content)\`, \`thread.generateTitle()\` (uses first user message).`,
};

// Color map for different node types — pastel colors read well on dark React Flow canvas
const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  entry:    { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
  module:   { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  service:  { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
  config:   { bg: "#f3e8ff", border: "#8b5cf6", text: "#5b21b6" },
  util:     { bg: "#e0e7ff", border: "#6366f1", text: "#3730a3" },
  database: { bg: "#fce7f3", border: "#ec4899", text: "#9d174d" },
  external: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
};

interface ArchNodeData {
  label: string;
  type: string;
  files: string[];
  description: string;
  [key: string]: unknown;
}

function ArchitectureNode({ data }: { data: ArchNodeData }) {
  const colors = NODE_COLORS[data.type] || NODE_COLORS.module;

  return (
    <div
      className="shadow-md border-2 px-4 py-3 min-w-[180px] max-w-[280px]"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#4a4845]" />
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-[10px] font-bold uppercase px-1.5 py-0.5"
          style={{ backgroundColor: colors.border, color: "white" }}
        >
          {data.type}
        </span>
      </div>
      <div className="font-semibold text-sm" style={{ color: colors.text }}>
        {data.label}
      </div>
      <div className="text-xs mt-1 line-clamp-2" style={{ color: colors.text, opacity: 0.7 }}>
        {data.description}
      </div>
      {data.files.length > 0 && (
        <div className="text-[10px] mt-1.5" style={{ color: colors.text, opacity: 0.5 }}>
          {data.files.length} file{data.files.length !== 1 ? "s" : ""}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-[#4a4845]" />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  architecture: ArchitectureNode as unknown as NodeTypes[string],
};

function layoutNodes(archNodes: ArchMap["nodes"]): Node[] {
  const typeOrder: Record<string, number> = {
    entry: 0,
    config: 1,
    module: 2,
    service: 3,
    util: 4,
    database: 5,
    external: 6,
  };

  const sorted = [...archNodes].sort(
    (a, b) => (typeOrder[a.type] ?? 3) - (typeOrder[b.type] ?? 3)
  );

  const layers: ArchMap["nodes"][] = [];
  let currentOrder = -1;
  for (const node of sorted) {
    const order = typeOrder[node.type] ?? 3;
    if (order !== currentOrder) {
      layers.push([]);
      currentOrder = order;
    }
    layers[layers.length - 1].push(node);
  }

  const LAYER_GAP = 220;
  const NODE_GAP = 340;
  const MAX_PER_ROW = 3;
  const nodes: Node[] = [];

  let y = 40;
  for (const layer of layers) {
    // Split large layers into rows of MAX_PER_ROW
    for (let rowStart = 0; rowStart < layer.length; rowStart += MAX_PER_ROW) {
      const row = layer.slice(rowStart, rowStart + MAX_PER_ROW);
      const startX = -(row.length * NODE_GAP) / 2 + NODE_GAP / 2;
      for (let i = 0; i < row.length; i++) {
        const n = row[i];
        nodes.push({
          id: n.id,
          type: "architecture",
          position: { x: startX + i * NODE_GAP, y },
          data: {
            label: n.label,
            type: n.type,
            files: n.files,
            description: n.description,
          },
        });
      }
      y += LAYER_GAP;
    }
  }

  return nodes;
}

function layoutEdges(archEdges: ArchMap["edges"]): Edge[] {
  return archEdges.map((e, idx) => ({
    id: `edge-${idx}`,
    source: e.source,
    target: e.target,
    label: e.label || "",
    animated: e.label === "calls" || e.label === "writes",
    style: { stroke: "#3d3b38", strokeWidth: 1.5 },
    labelStyle: { fontSize: 10, fill: "#8A8480" },
  }));
}

interface ArchitectureMapProps {
  repoId: string;
  data: ArchMap;
  className?: string;
}

export default function ArchitectureMap({ data, className }: ArchitectureMapProps) {
  const initialNodes = useMemo(() => layoutNodes(data.nodes), [data.nodes]);
  const initialEdges = useMemo(() => layoutEdges(data.edges), [data.edges]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const [selectedNodeData, setSelectedNodeData] = useState<ArchNodeData | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotExplain, setCopilotExplain] = useState<string | null>(null);

  const onInit = useCallback(() => {}, []);

  const handleNodeClick = useCallback((_: any, node: Node) => {
    const nData = node.data as ArchNodeData;
    setSelectedNodeData(nData);
    setCopilotExplain(null);
    setCopilotLoading(true);

    const key = nData.label.toLowerCase();
    const explanation = NODE_EXPLANATIONS[key]
      ?? `**${nData.label}** (${nData.type})\n\n${nData.description}\n\n**Files involved:**\n${nData.files.map((f: string) => `• \`${f}\``).join("\n") || "No files listed."}`;

    setTimeout(() => {
      setCopilotExplain(explanation);
      setCopilotLoading(false);
    }, 1000);
  }, []);

  return (
    <div className={`w-full h-full ${className || ""}`}>
      {/* Summary bar */}
      <div className="bg-brand-bg border-b border-brand-border px-4 py-2.5">
        <p className="text-sm text-brand-muted font-mono leading-relaxed">{data.summary}</p>
        {data.techStack && (
          <div className="flex gap-2 mt-1.5 flex-wrap">
            {Object.entries(data.techStack).map(([key, value]) => (
              <span
                key={key}
                className="text-[10px] bg-brand-surface border border-brand-border text-brand-muted font-mono px-2 py-0.5"
              >
                {key}: {value}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* React Flow canvas */}
      <div className="flex-1" style={{ height: "calc(100% - 120px)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onInit={onInit}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={2}
          defaultEdgeOptions={{ type: "smoothstep" }}
        >
          <Background color="#2A2726" gap={20} size={1} />
          <Controls />
          <MiniMap
            style={{ backgroundColor: "#1A1918", border: "1px solid #2A2726" }}
            nodeColor={(node) => {
              const colors = NODE_COLORS[(node.data as ArchNodeData)?.type] || NODE_COLORS.module;
              return colors.border;
            }}
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="bg-brand-bg border-t border-brand-border px-4 py-2.5 flex gap-4 flex-wrap">
        {Object.entries(NODE_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 border"
              style={{ backgroundColor: colors.bg, borderColor: colors.border }}
            />
            <span className="text-[10px] text-brand-muted capitalize font-mono">{type}</span>
          </div>
        ))}
      </div>

      {/* Copilot slide panel */}
      {selectedNodeData && (
        <div className="absolute top-0 right-0 w-[400px] h-full bg-brand-card border-l border-brand-border flex flex-col z-50 animate-in slide-in-from-right duration-300">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border bg-brand-bg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-DEFAULT" />
              <h3 className="text-sm font-heading font-semibold text-brand-text tracking-tight">AI Copilot</h3>
            </div>
            <button
              onClick={() => setSelectedNodeData(null)}
              className="p-1 hover:bg-brand-surface transition-colors"
            >
              <X className="w-4 h-4 text-brand-muted" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {/* Module info */}
            <div className="mb-5">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-muted mb-1 font-mono">Selected Module</p>
              <h4 className="text-lg font-heading font-bold text-brand-text mb-1.5">{selectedNodeData.label}</h4>
              <p className="text-sm text-brand-muted font-body leading-relaxed">{selectedNodeData.description}</p>

              {selectedNodeData.files && selectedNodeData.files.length > 0 && (
                <div className="mt-4 pt-4 border-t border-brand-border">
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-brand-muted uppercase tracking-widest mb-2 font-mono">
                    <FileCode2 className="w-3.5 h-3.5" /> Component Files
                  </div>
                  <ul className="text-xs text-brand-muted space-y-1">
                    {selectedNodeData.files.slice(0, 5).map((f: string) => (
                      <li key={f} className="truncate bg-brand-bg border border-brand-border px-2 py-1 font-mono">{f}</li>
                    ))}
                    {selectedNodeData.files.length > 5 && (
                      <li className="pl-1 text-brand-muted opacity-50 font-mono">
                        +{selectedNodeData.files.length - 5} more files
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* AI explanation */}
            <div className="bg-brand-DEFAULT/5 border border-brand-DEFAULT/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-brand-DEFAULT" />
                <span className="text-[10px] font-semibold text-brand-DEFAULT uppercase tracking-widest font-mono">
                  AI Explanation
                </span>
              </div>

              {copilotLoading ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="w-4 h-4 text-brand-DEFAULT animate-spin shrink-0" />
                  <span className="text-sm text-brand-muted font-mono animate-pulse">
                    Analysing module graph...
                  </span>
                </div>
              ) : copilotExplain ? (
                <div className="text-sm text-brand-text leading-relaxed font-body space-y-2">
                  {copilotExplain.split("\n\n").map((para, i) => (
                    <p key={i} className="whitespace-pre-wrap">
                      {para.split(/(\*\*[^*]+\*\*)/).map((chunk, j) =>
                        chunk.startsWith("**") && chunk.endsWith("**")
                          ? <strong key={j} className="text-brand-text font-semibold">{chunk.slice(2, -2)}</strong>
                          : chunk
                      )}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
