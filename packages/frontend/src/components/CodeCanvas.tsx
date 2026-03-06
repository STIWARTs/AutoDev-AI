"use client";

import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  Panel,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FileCode, Folder, Database, Server, Component, Sparkles } from "lucide-react";

// --- Custom Nodes ---
const iconMap = {
  Component,
  Database,
  Server,
  FileCode,
  Folder,
} as const;

export type NodeType = keyof typeof iconMap;

interface CustomNodeProps {
  data: {
    label: string;
    type: NodeType;
    sublabel?: string;
  };
}

function ArchitectureNode({ data }: CustomNodeProps) {
  const Icon = iconMap[data.type] || FileCode;

  return (
    <div className="group relative px-4 py-3 bg-brand-surface/80 backdrop-blur-md border border-white/10 rounded-xl shadow-glow transition-all duration-300 hover:shadow-glow-lg hover:-translate-y-1 hover:border-indigo-500/50 min-w-[160px]">
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-indigo-400 border-none opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center p-1.5 shrink-0 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
          <Icon className="w-full h-full text-brand-text-secondary group-hover:text-indigo-400 transition-colors" />
        </div>
        <div>
          <div className="text-sm font-semibold text-brand-text break-all leading-tight">
            {data.label}
          </div>
          {data.sublabel && (
            <div className="text-[10px] text-brand-muted mt-0.5 uppercase tracking-wider">
              {data.sublabel}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-purple-400 border-none opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

const nodeTypes = {
  architectureFunc: ArchitectureNode,
};

// --- Mock Data ---
const initialNodes = [
  { id: "1", type: "architectureFunc", position: { x: 250, y: 50 }, data: { label: "Client App", type: "Component", sublabel: "Next.js" } },
  { id: "2", type: "architectureFunc", position: { x: 100, y: 200 }, data: { label: "Auth Router", type: "Server", sublabel: "Express" } },
  { id: "3", type: "architectureFunc", position: { x: 400, y: 200 }, data: { label: "API Gateway", type: "Server", sublabel: "Node.js" } },
  { id: "4", type: "architectureFunc", position: { x: 100, y: 350 }, data: { label: "UserService", type: "FileCode", sublabel: "Logic" } },
  { id: "5", type: "architectureFunc", position: { x: 400, y: 350 }, data: { label: "ProductService", type: "FileCode", sublabel: "Logic" } },
  { id: "6", type: "architectureFunc", position: { x: 250, y: 500 }, data: { label: "PostgreSQL DB", type: "Database", sublabel: "Primary DB" } },
  { id: "7", type: "architectureFunc", position: { x: -50, y: 500 }, data: { label: "Redis Cache", type: "Database", sublabel: "Caching" } },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#6366f1", strokeWidth: 2 } },
  { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "#6366f1", strokeWidth: 2 } },
  { id: "e2-4", source: "2", target: "4", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "e3-5", source: "3", target: "5", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "e4-6", source: "4", target: "6", animated: true, style: { stroke: "#14b8a6", strokeWidth: 2 } },
  { id: "e5-6", source: "5", target: "6", animated: true, style: { stroke: "#14b8a6", strokeWidth: 2 } },
  { id: "e4-7", source: "4", target: "7", style: { stroke: "#f43f5e", strokeWidth: 2, strokeDasharray: "5,5" } },
];

interface CodeCanvasProps {
  repoId: string;
}

export default function CodeCanvas({ repoId }: CodeCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...(params as Edge), animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-full bg-[#030014] relative overflow-hidden rounded-xl border border-white/5 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="[&_.react-flow__pane]:cursor-grab [&_.react-flow__pane]:active:cursor-grabbing"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={2} 
          color="rgba(255,255,255,0.05)" 
        />
        <Controls 
          className="bg-brand-surface/80 border-white/10 fill-brand-text backdrop-blur-md rounded-lg overflow-hidden [&>button]:border-b-white/10 [&>button:hover]:bg-white/10" 
        />
        <MiniMap 
          className="bg-brand-surface border-white/10 rounded-xl overflow-hidden shadow-xl"
          maskColor="rgba(0, 0, 0, 0.7)"
          nodeColor={(node) => {
            switch (node.data.type) {
              case 'Component': return '#3b82f6';
              case 'Database': return '#10b981';
              case 'Server': return '#8b5cf6';
              default: return '#6b7280';
            }
          }}
        />
        
        <Panel position="top-left" className="m-4">
          <div className="bg-brand-surface/90 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10 shadow-lg inline-flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-brand-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Code Canvas
            </h3>
            <p className="text-xs text-brand-muted">
              Interactive architecture map for {repoId}
            </p>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
