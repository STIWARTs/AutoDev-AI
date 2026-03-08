"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
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
import type { ArchitectureMap as ArchMap, AnimationSequence, AnimationStep } from "@autodev/shared";

/* ------------------------------------------------------------------ */
/*  Colours                                                            */
/* ------------------------------------------------------------------ */

const NODE_COLORS: Record<string, { border: string }> = {
  entry:    { border: "#f59e0b" },
  module:   { border: "#3b82f6" },
  service:  { border: "#10b981" },
  config:   { border: "#8b5cf6" },
  util:     { border: "#6366f1" },
  database: { border: "#ec4899" },
  external: { border: "#ef4444" },
};

const HIGHLIGHT_RING = "0 0 24px -4px rgba(226,90,52,0.8), inset 0 0 16px -6px rgba(226,90,52,0.6)";
const DIM_OPACITY = 0.25;

/* ------------------------------------------------------------------ */
/*  Node component                                                     */
/* ------------------------------------------------------------------ */

interface ArchNodeData {
  label: string;
  type: string;
  files: string[];
  description: string;
  isActive?: boolean;
  isDimmed?: boolean;
  [key: string]: unknown;
}

function AnimatedArchNode({ data }: { data: ArchNodeData }) {
  const colors = NODE_COLORS[data.type] || NODE_COLORS.module;

  return (
    <div
      className="relative overflow-hidden px-4 py-3 min-w-[200px] max-w-[280px] transition-all duration-700 font-mono"
      style={{
        backgroundColor: "#0a0a09",
        border: `1px solid ${data.isActive ? colors.border : "#252320"}`,
        borderLeft: `3px solid ${data.isActive ? "#E25A34" : colors.border}`,
        opacity: data.isDimmed ? DIM_OPACITY : 1,
        boxShadow: data.isActive ? HIGHLIGHT_RING : "none",
        transform: data.isActive ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
      }}
    >
      {data.isActive && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{ 
            background: `linear-gradient(to bottom, transparent, ${colors.border}, transparent)`,
            animation: 'animated-map-scan 2s linear infinite'
          }} 
        />
      )}

      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-[#252320] !border-none" />
      
      <div className="flex items-start justify-between mb-2 relative z-10">
        <span
          className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm"
          style={{ 
            backgroundColor: data.isActive ? colors.border : `${colors.border}20`, 
            color: data.isActive ? "#000" : colors.border 
          }}
        >
          {data.type}
        </span>
        {data.isActive && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#E25A34" }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#E25A34" }} />
          </span>
        )}
      </div>

      <div className="font-semibold tracking-tight text-sm relative z-10" style={{ color: data.isActive ? "#fff" : "#e8e3dc" }}>
        {data.label}
      </div>
      <div className="text-[10px] mt-1.5 line-clamp-2 leading-relaxed relative z-10" style={{ color: "#8a837a" }}>
        {data.description}
      </div>
      
      {data.files.length > 0 && (
        <div className="flex items-center gap-1.5 mt-3 relative z-10">
          <div className="h-px flex-1 bg-[#252320]" />
          <div className="text-[9px] text-[#6b6460]">
            {data.files.length} FILE{data.files.length !== 1 ? "S" : ""}
          </div>
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[#252320] !border-none" />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  architecture: AnimatedArchNode as unknown as NodeTypes[string],
};

/* ------------------------------------------------------------------ */
/*  Layout helpers                                                     */
/* ------------------------------------------------------------------ */

function layoutNodes(archNodes: ArchMap["nodes"]): Node[] {
  const typeOrder: Record<string, number> = {
    entry: 0, config: 1, module: 2, service: 3, util: 4, database: 5, external: 6,
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
          isActive: false,
          isDimmed: false,
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
    animated: false,
    style: { stroke: "#252320", strokeWidth: 1.5 },
    labelStyle: { fontSize: 9, fontFamily: "monospace", fill: "#5f5a55" },
  }));
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface AnimatedArchitectureMapProps {
  data: ArchMap;
  sequences: AnimationSequence[];
  fresherMode?: boolean;
  className?: string;
  onNodeClick?: (nodeId: string) => void;
}

export default function AnimatedArchitectureMap({
  data,
  sequences,
  fresherMode = false,
  className,
  onNodeClick,
}: AnimatedArchitectureMapProps) {
  const [activeSequence, setActiveSequence] = useState<AnimationSequence | null>(
    sequences[0] ?? null
  );
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialNodes = useMemo(() => layoutNodes(data.nodes), [data.nodes]);
  const initialEdges = useMemo(() => layoutEdges(data.edges), [data.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const currentStep: AnimationStep | null =
    activeSequence && currentStepIdx >= 0 && currentStepIdx < activeSequence.steps.length
      ? activeSequence.steps[currentStepIdx]
      : null;

  useEffect(() => {
    if (!currentStep) {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, isActive: false, isDimmed: false },
        }))
      );
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          animated: false,
          style: { ...e.style, stroke: "#252320", strokeWidth: 1.5 },
        }))
      );
      return;
    }

    const activeNodeId = currentStep.nodeId;
    const highlightEdgeKeys = new Set(currentStep.highlightEdges ?? []);

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isActive: n.id === activeNodeId,
          isDimmed: n.id !== activeNodeId && isPlaying,
        },
      }))
    );

    setEdges((eds) =>
      eds.map((e) => {
        const edgeKey = `${e.source}->${e.target}`;
        const isHighlighted = highlightEdgeKeys.has(edgeKey);
        return {
          ...e,
          animated: isHighlighted,
          style: {
            stroke: isHighlighted ? "#E25A34" : "#252320",
            strokeWidth: isHighlighted ? 2.5 : 1.5,
          },
        };
      })
    );
  }, [currentStep, isPlaying, setNodes, setEdges]);

  useEffect(() => {
    if (!isPlaying || isPaused || !activeSequence || currentStepIdx < 0) return;

    const step = activeSequence.steps[currentStepIdx];
    if (!step) return;

    timerRef.current = setTimeout(() => {
      const nextIdx = currentStepIdx + 1;
      if (nextIdx < activeSequence.steps.length) {
        setCurrentStepIdx(nextIdx);
      } else {
        setIsPlaying(false);
        setCurrentStepIdx(-1);
      }
    }, step.duration ?? 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, isPaused, currentStepIdx, activeSequence]);

  const play = useCallback(() => {
    if (!activeSequence) return;
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentStepIdx(0);
  }, [activeSequence]);

  const pause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStepIdx(-1);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const stepForward = useCallback(() => {
    if (!activeSequence) return;
    const max = activeSequence.steps.length - 1;
    setCurrentStepIdx((i) => Math.min(i + 1, max));
    setIsPaused(true);
    setIsPlaying(true);
  }, [activeSequence]);

  const stepBackward = useCallback(() => {
    setCurrentStepIdx((i) => Math.max(i - 1, 0));
    setIsPaused(true);
    setIsPlaying(true);
  }, []);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (isPlaying) setIsPaused(true);
      onNodeClick?.(node.id);
    },
    [isPlaying, onNodeClick]
  );

  const explanationText = currentStep
    ? fresherMode
      ? currentStep.fresherExplanation
      : currentStep.explanation
    : null;

  const progress = activeSequence
    ? ((currentStepIdx + 1) / activeSequence.steps.length) * 100
    : 0;

  return (
    <div className={`w-full h-full flex flex-col ${className || ""}`}>
      <style>
        {`
          @keyframes animated-map-scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
        `}
      </style>
      {/* Top bar: sequence selector */}
      <div className="bg-brand-bg border-b border-brand-border px-4 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <select
            className="bg-brand-bg border border-brand-border text-brand-text text-sm font-mono focus:outline-none focus:border-brand-DEFAULT/60 px-2 py-1 transition-colors"
            value={activeSequence?.id ?? ""}
            onChange={(e) => {
              const seq = sequences.find((s) => s.id === e.target.value) ?? null;
              setActiveSequence(seq);
              stop();
            }}
          >
            {sequences.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-brand-muted uppercase tracking-widest font-mono">
            {activeSequence?.category}
          </span>
        </div>
        <p className="text-xs text-brand-muted font-mono">{activeSequence?.description}</p>
      </div>

      {/* React Flow canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={2}
          defaultEdgeOptions={{ type: "smoothstep" }}
        >
          <Background color="rgba(226,90,52,0.15)" gap={30} size={1} />
          <Controls />
          <MiniMap
            style={{ backgroundColor: "#1A1918", border: "1px solid #2A2726" }}
            nodeColor={(node) => {
              const nodeData = node.data as ArchNodeData;
              if (nodeData?.isActive) return "#E25A34";
              const colors = NODE_COLORS[nodeData?.type] || NODE_COLORS.module;
              return colors.border;
            }}
          />
        </ReactFlow>

        {/* Floating explanation card */}
        {explanationText && (
          <div className="absolute bottom-4 left-4 right-4 mx-auto max-w-xl bg-brand-card backdrop-blur border border-brand-DEFAULT/30 p-4 z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-brand-DEFAULT uppercase font-mono">
                Step {(currentStepIdx ?? 0) + 1}
              </span>
              <span className="text-sm font-heading font-semibold text-brand-text">
                {currentStep?.label}
              </span>
            </div>
            <p className="text-sm text-brand-muted leading-relaxed font-mono">{explanationText}</p>
          </div>
        )}
      </div>

      {/* Playback controls */}
      <div className="bg-brand-bg border-t border-brand-border px-4 py-3 flex-shrink-0">
        {/* Progress bar */}
        {isPlaying && (
          <div className="w-full h-0.5 bg-brand-border mb-3 overflow-hidden">
            <div
              className="h-full bg-brand-DEFAULT transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play / Pause / Stop */}
            {!isPlaying ? (
              <button
                onClick={play}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-DEFAULT hover:bg-brand-DEFAULT/90 text-brand-bg text-sm font-mono transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Play
              </button>
            ) : (
              <>
                <button
                  onClick={pause}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-muted text-sm font-mono transition-colors"
                >
                  {isPaused ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                    </svg>
                  )}
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={stop}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/30 text-red-400 hover:border-red-500/50 text-sm font-mono transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.25 3A2.25 2.25 0 003 5.25v9.5A2.25 2.25 0 005.25 17h9.5A2.25 2.25 0 0017 14.75v-9.5A2.25 2.25 0 0014.75 3h-9.5z" />
                  </svg>
                  Stop
                </button>
              </>
            )}

            {/* Step controls */}
            <div className="flex items-center gap-0.5 ml-2">
              <button
                onClick={stepBackward}
                disabled={!isPlaying || currentStepIdx <= 0}
                className="p-1.5 hover:bg-brand-surface text-brand-muted hover:text-brand-text disabled:opacity-30 transition-colors"
                title="Previous step"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M15.79 14.77a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L11.832 10l3.938 3.71a.75.75 0 01.02 1.06zm-6 0a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L5.832 10l3.938 3.71a.75.75 0 01.02 1.06z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={stepForward}
                disabled={
                  !activeSequence ||
                  currentStepIdx >= (activeSequence?.steps.length ?? 0) - 1
                }
                className="p-1.5 hover:bg-brand-surface text-brand-muted hover:text-brand-text disabled:opacity-30 transition-colors"
                title="Next step"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.21 5.23a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08L8.168 10 4.23 6.29a.75.75 0 01-.02-1.06zm6 0a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08L14.168 10l-3.938-3.71a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Step indicator */}
          <div className="text-[10px] text-brand-muted font-mono">
            {isPlaying && activeSequence
              ? `Step ${currentStepIdx + 1} of ${activeSequence.steps.length}`
              : `${sequences.length} sequence${sequences.length !== 1 ? "s" : ""} available`}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-brand-bg border-t border-brand-border px-4 py-2 flex gap-4 flex-wrap flex-shrink-0">
        {Object.entries(NODE_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 border"
              style={{ backgroundColor: colors.bg, borderColor: colors.border }}
            />
            <span className="text-[10px] text-brand-muted capitalize font-mono">{type}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 border-2 border-brand-DEFAULT bg-brand-DEFAULT/20" />
          <span className="text-[10px] text-brand-DEFAULT font-semibold font-mono">Active</span>
        </div>
      </div>
    </div>
  );
}
