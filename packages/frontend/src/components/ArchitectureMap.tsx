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
import { Loader2, Sparkles, X, FileCode2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { fetchApi } from "@/lib/api";

// Color map for different node types
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
      className="rounded-lg shadow-md border-2 px-4 py-3 min-w-[180px] max-w-[280px]"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
          style={{ backgroundColor: colors.border, color: "white" }}
        >
          {data.type}
        </span>
      </div>
      <div className="font-semibold text-sm" style={{ color: colors.text }}>
        {data.label}
      </div>
      <div className="text-xs text-gray-600 mt-1 line-clamp-2">
        {data.description}
      </div>
      {data.files.length > 0 && (
        <div className="text-[10px] text-gray-400 mt-1.5">
          {data.files.length} file{data.files.length !== 1 ? "s" : ""}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  architecture: ArchitectureNode as unknown as NodeTypes[string],
};

/**
 * Auto-layout: arrange nodes in a layered grid.
 * Entry points at top, then modules/services, externals at bottom.
 */
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

  // Sort by type order
  const sorted = [...archNodes].sort(
    (a, b) => (typeOrder[a.type] ?? 3) - (typeOrder[b.type] ?? 3)
  );

  // Group by layer
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

  const LAYER_GAP = 160;
  const NODE_GAP = 260;
  const nodes: Node[] = [];

  let y = 40;
  for (const layer of layers) {
    const layerWidth = layer.length * NODE_GAP;
    const startX = -layerWidth / 2 + NODE_GAP / 2;

    for (let i = 0; i < layer.length; i++) {
      const n = layer[i];
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

  return nodes;
}

function layoutEdges(archEdges: ArchMap["edges"]): Edge[] {
  return archEdges.map((e, idx) => ({
    id: `edge-${idx}`,
    source: e.source,
    target: e.target,
    label: e.label || "",
    animated: e.label === "calls" || e.label === "writes",
    style: { stroke: "#94a3b8", strokeWidth: 1.5 },
    labelStyle: { fontSize: 10, fill: "#64748b" },
  }));
}

interface ArchitectureMapProps {
  repoId: string;
  data: ArchMap;
  className?: string;
}

export default function ArchitectureMap({ repoId, data, className }: ArchitectureMapProps) {
  const initialNodes = useMemo(() => layoutNodes(data.nodes), [data.nodes]);
  const initialEdges = useMemo(() => layoutEdges(data.edges), [data.edges]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const [selectedNodeData, setSelectedNodeData] = useState<ArchNodeData | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotExplain, setCopilotExplain] = useState<string | null>(null);
  
  const { getToken } = useAuth();

  const onInit = useCallback(() => {
    // Could fitView here but ReactFlow handles it via fitView prop
  }, []);

  const handleNodeClick = useCallback(async (_: any, node: Node) => {
    const nData = node.data as ArchNodeData;
    setSelectedNodeData(nData);
    setCopilotExplain(null);

    // If it has files, we can ask copilot to explain the first one
    if (nData.files && nData.files.length > 0) {
      const filePath = nData.files[0];
      setCopilotLoading(true);
      try {
        const token = await getToken();
        // Fallback to absolute URL if needed, depending on how `fetchApi` does it
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const res = await fetchApi(`${API_BASE}/copilot/explain`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoId, filePath })
        }, token);
        
        if (res.ok) {
          const json = await res.json();
          setCopilotExplain(json.explanation);
        } else {
          setCopilotExplain("Failed to load Copilot explanation.");
        }
      } catch (err) {
        setCopilotExplain("Error connecting to Copilot endpoint.");
      } finally {
        setCopilotLoading(false);
      }
    } else {
      setCopilotExplain("No files associated with this module.");
    }
  }, [repoId, getToken]);

  return (
    <div className={`w-full h-full ${className || ""}`}>
      {/* Summary bar */}
      <div className="bg-gray-50 border-b px-4 py-2">
        <p className="text-sm text-gray-600">{data.summary}</p>
        {data.techStack && (
          <div className="flex gap-2 mt-1 flex-wrap">
            {Object.entries(data.techStack).map(([key, value]) => (
              <span
                key={key}
                className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full"
              >
                {key}: {value}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* React Flow canvas */}
      <div className="flex-1" style={{ height: "calc(100% - 60px)" }}>
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
          defaultEdgeOptions={{
            type: "smoothstep",
          }}
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const colors = NODE_COLORS[(node.data as ArchNodeData)?.type] || NODE_COLORS.module;
              return colors.border;
            }}
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border-t px-4 py-2 flex gap-3 flex-wrap">
        {Object.entries(NODE_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm border"
              style={{ backgroundColor: colors.bg, borderColor: colors.border }}
            />
            <span className="text-[10px] text-gray-500 capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Copilot Slide Panel */}
      {selectedNodeData && (
        <div className="absolute top-0 right-0 w-[400px] h-full bg-white shadow-2xl border-l border-brand-border flex flex-col z-50 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border bg-slate-50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-800 tracking-tight">AI Copilot</h3>
            </div>
            <button onClick={() => setSelectedNodeData(null)} className="p-1 hover:bg-slate-200 rounded-md transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-6">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Selected Module</div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">{selectedNodeData.label}</h4>
              <p className="text-sm text-slate-600">{selectedNodeData.description}</p>
              
              {selectedNodeData.files && selectedNodeData.files.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                   <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                     <FileCode2 className="w-4 h-4" /> Component Files
                   </div>
                   <ul className="text-xs text-slate-600 space-y-1">
                     {selectedNodeData.files.slice(0, 5).map((f: string) => (
                       <li key={f} className="truncate bg-slate-50 px-2 py-1 rounded border border-slate-100">{f}</li>
                     ))}
                     {selectedNodeData.files.length > 5 && <li className="pl-1 opacity-50">+{selectedNodeData.files.length - 5} more files</li>}
                   </ul>
                </div>
              )}
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                 <Sparkles className="w-4 h-4 text-indigo-500" />
                 <span className="text-xs font-semibold text-indigo-900 uppercase tracking-widest">AI Explanation</span>
              </div>
              
              {copilotLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-3" />
                  <p className="text-xs text-indigo-600/70 font-mono">Analyzing codebase graph...</p>
                </div>
              ) : copilotExplain ? (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {copilotExplain}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
