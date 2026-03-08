"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ArchitectureMap as ArchMapType } from "@autodev/shared";

/* ─────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────── */

const COLUMN_ORDER: Record<string, number> = {
  entry: 0, config: 1, module: 2, service: 3, util: 4, database: 5, external: 6,
};

const TYPE_COLORS: Record<string, string> = {
  entry:    "#f59e0b",
  module:   "#5b8dd9",
  service:  "#10b981",
  config:   "#8b5cf6",
  util:     "#6366f1",
  database: "#ec4899",
  external: "#ef4444",
};

const TYPE_LABELS: Record<string, string> = {
  entry:    "Entry Points",
  module:   "Modules",
  service:  "Services",
  config:   "Config",
  util:     "Utilities",
  database: "Databases",
  external: "External APIs",
};

const FILE_COLORS: Record<string, string> = {
  ts: "#5b8dd9", tsx: "#61DAFB",
  js: "#f0c040", jsx: "#f0c040",
  css: "#e879a0", scss: "#e879a0",
  json: "#f59e0b", md: "#8A8480",
  sql: "#ec4899", prisma: "#5664d2",
  py: "#3b82f6", sh: "#22c55e",
  yml: "#f59e0b", yaml: "#f59e0b",
  env: "#8b5cf6",
};

const EDGE_COLORS: Record<string, string> = {
  calls:      "rgba(91,141,217,0.6)",
  writes:     "rgba(16,185,129,0.55)",
  reads:      "rgba(16,185,129,0.4)",
  configures: "rgba(139,92,246,0.4)",
  default:    "rgba(255,255,255,0.13)",
};

function fileColor(p: string) {
  return FILE_COLORS[p.split(".").pop()?.toLowerCase() || ""] || "#4a4845";
}
function fileName(p: string) { return p.split("/").pop() || p; }
function getEdgeColor(label: string) { return EDGE_COLORS[label] || EDGE_COLORS.default; }
function isAnimatedEdge(label: string) { return label === "calls" || label === "writes"; }

/* ─────────────────────────────────────────────────────────────
   Module Card Node
───────────────────────────────────────────────────────────── */

interface ModuleNodeData {
  label: string;
  type: string;
  files: string[];
  description: string;
  highlighted: boolean;
  dimmed: boolean;
  [key: string]: unknown;
}

const MAX_FILES = 10;

function ModuleCardNode({ data }: { data: ModuleNodeData }) {
  const accent = TYPE_COLORS[data.type] || "#6b7280";
  const visible = data.files.slice(0, MAX_FILES);
  const hidden  = data.files.length - visible.length;

  return (
    <div
      style={{
        width: 220,
        backgroundColor: data.dimmed ? "#0f0e0d" : "#141311",
        border: `1px solid ${data.highlighted ? `${accent}55` : data.dimmed ? "#141311" : "#252320"}`,
        borderLeft: `3px solid ${data.highlighted ? accent : data.dimmed ? "#1a1918" : `${accent}50`}`,
        boxShadow: data.highlighted ? `0 0 28px ${accent}20, 0 0 10px ${accent}12` : "none",
        opacity: data.dimmed ? 0.25 : 1,
        transition: "border-color 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease",
      }}
    >
      <Handle type="target" position={Position.Left}
        style={{ background: "#3d3b38", border: "none", width: 7, height: 7 }} />

      {/* Header */}
      <div style={{ padding: "10px 12px 6px" }}>
        <span style={{
          fontSize: 8, fontFamily: "monospace", fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "2px 5px",
          backgroundColor: data.highlighted ? `${accent}22` : `${accent}14`,
          color: data.dimmed ? `${accent}40` : accent,
        }}>
          {data.type}
        </span>
        <div style={{
          fontSize: 11, fontWeight: 600, fontFamily: "monospace",
          color: data.dimmed ? "#3a3835" : "#e8e3dc",
          marginTop: 5, lineHeight: 1.3,
        }}>
          {data.label}
        </div>
        {data.description && (
          <div style={{
            fontSize: 9, fontFamily: "monospace",
            color: data.dimmed ? "#2e2c2a" : "#8a837a",
            marginTop: 2, lineHeight: 1.4,
          }}>
            {data.description}
          </div>
        )}
      </div>

      <div style={{ height: 1, backgroundColor: "#1e1c1a", margin: "0 12px" }} />

      {/* File list */}
      <div style={{ padding: "6px 12px 8px" }}>
        {visible.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
            <span style={{ width: 5, height: 5, flexShrink: 0, backgroundColor: fileColor(f) }} />
            <span style={{
              fontSize: 9, fontFamily: "monospace",
              color: data.dimmed ? "#2e2c2a" : "#9a938a",
              whiteSpace: "nowrap", overflow: "hidden",
              textOverflow: "ellipsis", maxWidth: 175,
            }}>
              {fileName(f)}
            </span>
          </div>
        ))}
        {hidden > 0 && (
          <div style={{ fontSize: 8, fontFamily: "monospace", color: "#3d3b38", marginTop: 3 }}>
            +{hidden} more
          </div>
        )}
        {data.files.length === 0 && (
          <div style={{ fontSize: 9, fontFamily: "monospace", color: "#3d3b38", fontStyle: "italic" }}>
            external
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right}
        style={{ background: "#3d3b38", border: "none", width: 7, height: 7 }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Group Background Node
───────────────────────────────────────────────────────────── */

interface GroupNodeData {
  label: string; color: string; w: number; h: number;
  [key: string]: unknown;
}

function GroupBgNode({ data }: { data: GroupNodeData }) {
  return (
    <div style={{
      width: data.w, height: data.h,
      backgroundColor: `${data.color}05`,
      border: `1px solid ${data.color}18`,
      pointerEvents: "none",
      position: "relative",
    }}>
      <span style={{
        position: "absolute", top: -20, left: 0,
        fontSize: 8, fontFamily: "monospace", fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.12em",
        color: `${data.color}65`,
      }}>
        {data.label}
      </span>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  moduleCard: ModuleCardNode as unknown as NodeTypes[string],
  groupBg:    GroupBgNode    as unknown as NodeTypes[string],
};

/* ─────────────────────────────────────────────────────────────
   Layout
───────────────────────────────────────────────────────────── */

const COL_PITCH   = 360;  // column x pitch
const FILE_ROW_H  = 14;
const HEADER_H    = 80;   // includes description line
const FOOTER_PAD  = 12;
const OVERFLOW_H  = 18;
const ROW_GAP     = 22;
const GROUP_PAD   = 18;
const NODE_START_Y = 26;  // y of first node in column

function nodeH(fileCount: number): number {
  const vis = Math.min(fileCount, MAX_FILES);
  return HEADER_H
    + vis * FILE_ROW_H
    + (fileCount > MAX_FILES ? OVERFLOW_H : 0)
    + (fileCount === 0 ? FILE_ROW_H : 0)
    + FOOTER_PAD;
}

function buildLayout(archNodes: ArchMapType["nodes"]): Node[] {
  const cols = new Map<number, ArchMapType["nodes"]>();
  for (const n of archNodes) {
    const c = COLUMN_ORDER[n.type] ?? 2;
    if (!cols.has(c)) cols.set(c, []);
    cols.get(c)!.push(n);
  }

  const result: Node[] = [];

  for (const [col, cNodes] of [...cols.entries()].sort((a, b) => a[0] - b[0])) {
    const totalH = cNodes.reduce((acc, n) => acc + nodeH(n.files.length) + ROW_GAP, -ROW_GAP);
    const color  = TYPE_COLORS[cNodes[0].type] || "#6b7280";
    const label  = TYPE_LABELS[cNodes[0].type] || cNodes[0].type;

    // Group background
    result.push({
      id: `_group_${col}`,
      type: "groupBg",
      position: {
        x: col * COL_PITCH - GROUP_PAD,
        y: NODE_START_Y - GROUP_PAD - 18,
      },
      data: {
        label,
        color,
        w: 220 + GROUP_PAD * 2,
        h: totalH + GROUP_PAD * 2 + 18,
      },
      selectable: false,
      draggable: false,
      zIndex: -1,
    });

    // Module cards
    let y = NODE_START_Y;
    for (const n of cNodes) {
      result.push({
        id: n.id,
        type: "moduleCard",
        position: { x: col * COL_PITCH, y },
        data: {
          label: n.label, type: n.type,
          files: n.files, description: n.description,
          highlighted: false, dimmed: false,
        },
      });
      y += nodeH(n.files.length) + ROW_GAP;
    }
  }

  return result;
}

/* ─────────────────────────────────────────────────────────────
   Edge builder
───────────────────────────────────────────────────────────── */

interface EdgeFilters { calls: boolean; writes: boolean; imports: boolean; }

function buildEdges(archEdges: ArchMapType["edges"], filters: EdgeFilters): Edge[] {
  return archEdges
    .filter(e => {
      const l = e.label || "";
      if (l === "calls") return filters.calls;
      if (l === "writes" || l === "reads") return filters.writes;
      return filters.imports;
    })
    .map((e, i) => ({
      id: `e-${i}`,
      source: e.source, target: e.target,
      label: e.label || "",
      animated: isAnimatedEdge(e.label || ""),
      type: "default",
      style: {
        stroke: getEdgeColor(e.label || ""),
        strokeWidth: isAnimatedEdge(e.label || "") ? 2.5 : 1.5,
      },
      labelStyle: { fontSize: 8, fill: "#4a4845" },
      labelBgStyle: { fill: "#141311", fillOpacity: 0.85 },
      labelBgPadding: [3, 4] as [number, number],
    }));
}

/* ─────────────────────────────────────────────────────────────
   Demo data
───────────────────────────────────────────────────────────── */

const DEMO_ARCH: ArchMapType = {
  summary: "Express.js e-commerce API with JWT auth, Prisma ORM, Redis caching, and Stripe payments.",
  nodes: [
    { id: "frontend",  type: "entry",    label: "Client App",       description: "React frontend entry",          files: ["src/App.tsx", "src/main.tsx", "src/router.tsx", "src/index.css"] },
    { id: "auth",      type: "module",   label: "Auth Module",      description: "JWT sessions & middleware",     files: ["src/auth/login.ts", "src/auth/logout.ts", "src/auth/session.ts", "src/auth/middleware.ts", "src/auth/types.ts"] },
    { id: "api",       type: "service",  label: "API Gateway",      description: "Route dispatcher & validators", files: ["src/api/routes.ts", "src/api/handlers.ts", "src/api/validators.ts", "src/api/errors.ts", "src/api/types.ts"] },
    { id: "products",  type: "service",  label: "Products Service", description: "Catalog management",            files: ["src/products/model.ts", "src/products/service.ts", "src/products/routes.ts", "src/products/dto.ts", "src/products/schema.ts", "src/products/search.ts"] },
    { id: "orders",    type: "service",  label: "Orders Service",   description: "Order lifecycle & events",      files: ["src/orders/model.ts", "src/orders/service.ts", "src/orders/routes.ts", "src/orders/states.ts", "src/orders/events.ts"] },
    { id: "payments",  type: "service",  label: "Payment Service",  description: "Stripe integration",            files: ["src/payments/stripe.ts", "src/payments/webhook.ts", "src/payments/types.ts", "src/payments/retry.ts"] },
    { id: "config",    type: "config",   label: "App Config",       description: "Env & runtime constants",       files: ["config/database.ts", "config/redis.ts", "config/env.ts", "config/constants.ts"] },
    { id: "shared",    type: "util",     label: "Shared Utils",     description: "Common utilities",              files: ["src/utils/logger.ts", "src/utils/errors.ts", "src/utils/types.ts", "src/utils/validation.ts", "src/utils/date.ts", "src/utils/crypto.ts", "src/utils/request.ts"] },
    { id: "database",  type: "database", label: "PostgreSQL",       description: "Primary relational store",      files: ["prisma/schema.prisma", "src/db/client.ts", "src/db/migrations/001.sql", "src/db/seed.ts"] },
    { id: "cache",     type: "database", label: "Redis Cache",      description: "Session & response cache",      files: ["src/cache/client.ts", "src/cache/keys.ts", "src/cache/ttl.ts"] },
    { id: "stripe",    type: "external", label: "Stripe API",       description: "Payment gateway",               files: [] },
    { id: "sendgrid",  type: "external", label: "SendGrid",         description: "Email delivery",                files: [] },
  ],
  edges: [
    { source: "frontend",  target: "api",       label: "calls" },
    { source: "frontend",  target: "auth",      label: "calls" },
    { source: "api",       target: "products",  label: "calls" },
    { source: "api",       target: "orders",    label: "calls" },
    { source: "api",       target: "auth",      label: "calls" },
    { source: "api",       target: "shared",    label: "imports" },
    { source: "orders",    target: "payments",  label: "calls" },
    { source: "products",  target: "database",  label: "writes" },
    { source: "orders",    target: "database",  label: "writes" },
    { source: "auth",      target: "database",  label: "reads" },
    { source: "auth",      target: "cache",     label: "writes" },
    { source: "api",       target: "cache",     label: "reads" },
    { source: "payments",  target: "stripe",    label: "calls" },
    { source: "orders",    target: "sendgrid",  label: "calls" },
    { source: "products",  target: "shared",    label: "imports" },
    { source: "orders",    target: "shared",    label: "imports" },
    { source: "config",    target: "database",  label: "configures" },
    { source: "config",    target: "cache",     label: "configures" },
  ],
  techStack: {
    runtime: "Node.js 18", framework: "Express.js",
    database: "PostgreSQL", orm: "Prisma",
    cache: "Redis", payments: "Stripe",
  },
};

/* ─────────────────────────────────────────────────────────────
   Left Sidebar — Repository Explorer
───────────────────────────────────────────────────────────── */

function LeftSidebar({
  arch,
  focusId,
  onFocus,
}: {
  arch: ArchMapType;
  focusId: string | null;
  onFocus: (id: string) => void;
}) {
  const grouped = useMemo(() => {
    const g: Record<string, ArchMapType["nodes"]> = {};
    for (const n of arch.nodes) {
      if (!g[n.type]) g[n.type] = [];
      g[n.type].push(n);
    }
    return Object.entries(g).sort(([a], [b]) => (COLUMN_ORDER[a] ?? 99) - (COLUMN_ORDER[b] ?? 99));
  }, [arch.nodes]);

  const totalFiles = arch.nodes.reduce((s, n) => s + n.files.length, 0);

  return (
    <div style={{
      width: 236,
      flexShrink: 0,
      backgroundColor: "#0a0a09",
      borderRight: "1px solid #191816",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid #191816", flexShrink: 0 }}>
        <div style={{
          fontSize: 9, fontFamily: "monospace", fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: "#7a736a", marginBottom: 4,
        }}>
          Repository Explorer
        </div>
        <div style={{ fontSize: 9, fontFamily: "monospace", color: "#6b6460" }}>
          {arch.nodes.length} modules · {totalFiles} files
        </div>
      </div>

      {/* Scrollable module list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
        {grouped.map(([type, nodes]) => {
          const color = TYPE_COLORS[type] || "#6b7280";
          return (
            <div key={type}>
              <div style={{
                padding: "6px 14px 3px",
                fontSize: 8, fontFamily: "monospace", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.12em",
                color: `${color}75`,
              }}>
                {TYPE_LABELS[type] || type}
              </div>
              {nodes.map(n => {
                const active = focusId === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => onFocus(n.id)}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "5px 14px 5px 16px",
                      backgroundColor: active ? `${color}10` : "transparent",
                      border: "none",
                      borderLeft: `2px solid ${active ? color : "transparent"}`,
                      cursor: "pointer",
                      transition: "background-color 0.1s",
                    }}
                  >
                    <div style={{
                      fontSize: 10, fontFamily: "monospace",
                      color: active ? color : "#a09890",
                      fontWeight: active ? 600 : 400,
                    }}>
                      {n.label}
                    </div>
                    {n.files.length > 0 && (
                      <div style={{ fontSize: 8, fontFamily: "monospace", color: "#6b6460", marginTop: 1 }}>
                        {n.files.length} file{n.files.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      {arch.summary && (
        <div style={{
          padding: "10px 14px",
          borderTop: "1px solid #191816",
          fontSize: 8, fontFamily: "monospace",
          color: "#6b6460", lineHeight: 1.7,
          flexShrink: 0,
        }}>
          {arch.summary}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Right Panel — Controls & Node Detail
───────────────────────────────────────────────────────────── */

function RightPanel({
  arch,
  selectedNodeId,
  filters,
  onFiltersChange,
  onClose,
}: {
  arch: ArchMapType;
  selectedNodeId: string | null;
  filters: EdgeFilters;
  onFiltersChange: (f: EdgeFilters) => void;
  onClose: () => void;
}) {
  const selectedNode = arch.nodes.find(n => n.id === selectedNodeId) || null;
  const accent = selectedNode ? (TYPE_COLORS[selectedNode.type] || "#5f5a55") : "#5f5a55";

  const connections = useMemo(() => {
    if (!selectedNode) return null;
    const out = arch.edges
      .filter(e => e.source === selectedNode.id)
      .map(e => ({ ...e, node: arch.nodes.find(n => n.id === e.target) }));
    const inc = arch.edges
      .filter(e => e.target === selectedNode.id)
      .map(e => ({ ...e, node: arch.nodes.find(n => n.id === e.source) }));
    return { out, inc };
  }, [selectedNode, arch]);

  const edgeFilterRows = [
    { key: "calls"   as const, label: "Calls",          color: EDGE_COLORS.calls,   desc: "API calls & function invocations" },
    { key: "writes"  as const, label: "Writes / Reads", color: EDGE_COLORS.writes,  desc: "Database & cache operations" },
    { key: "imports" as const, label: "Imports",        color: EDGE_COLORS.default, desc: "Module imports & configuration" },
  ];

  return (
    <div style={{
      width: 256,
      flexShrink: 0,
      backgroundColor: "#0a0a09",
      borderLeft: "1px solid #191816",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {selectedNode ? (
        /* ── Node detail view ── */
        <>
          <div style={{
            padding: "12px 14px 10px", borderBottom: "1px solid #191816",
            display: "flex", alignItems: "flex-start", gap: 8, flexShrink: 0,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 8, fontFamily: "monospace", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em", color: accent,
              }}>
                {selectedNode.type}
              </div>
              <div style={{
                fontSize: 12, fontFamily: "monospace", fontWeight: 600,
                color: "#d4cfc8", marginTop: 4, lineHeight: 1.3,
              }}>
                {selectedNode.label}
              </div>
              {selectedNode.description && (
                <div style={{
                  fontSize: 9, fontFamily: "monospace",
                  color: "#5f5a55", marginTop: 4, lineHeight: 1.5,
                }}>
                  {selectedNode.description}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#3d3b38", padding: "2px 4px", flexShrink: 0, fontSize: 12,
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {/* Files */}
            {selectedNode.files.length > 0 && (
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #191816" }}>
                <div style={{
                  fontSize: 8, fontFamily: "monospace", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  color: "#4a4845", marginBottom: 6,
                }}>
                  Files ({selectedNode.files.length})
                </div>
                {selectedNode.files.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
                    <span style={{ width: 5, height: 5, flexShrink: 0, backgroundColor: fileColor(f) }} />
                    <span style={{
                      fontSize: 9, fontFamily: "monospace", color: "#5f5a55",
                      overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap", maxWidth: 200,
                    }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Connections */}
            {connections && (connections.out.length > 0 || connections.inc.length > 0) && (
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #191816" }}>
                <div style={{
                  fontSize: 8, fontFamily: "monospace", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  color: "#4a4845", marginBottom: 8,
                }}>
                  Connections ({connections.out.length + connections.inc.length})
                </div>
                {connections.out.map((e, i) => (
                  <div key={`out-${i}`} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                    <span style={{ fontSize: 10, color: "#7a736a" }}>→</span>
                    <span style={{
                      fontSize: 9, fontFamily: "monospace",
                      color: getEdgeColor(e.label || ""),
                      flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {e.node?.label || e.target}
                    </span>
                    <span style={{ fontSize: 8, fontFamily: "monospace", color: "#7a736a", flexShrink: 0 }}>
                      {e.label}
                    </span>
                  </div>
                ))}
                {connections.inc.map((e, i) => (
                  <div key={`in-${i}`} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                    <span style={{ fontSize: 10, color: "#7a736a" }}>←</span>
                    <span style={{
                      fontSize: 9, fontFamily: "monospace", color: "#a09890",
                      flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {e.node?.label || e.source}
                    </span>
                    <span style={{ fontSize: 8, fontFamily: "monospace", color: "#7a736a", flexShrink: 0 }}>
                      {e.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Edge filters (compact, in detail view too) */}
            <div style={{ padding: "10px 14px" }}>
              <div style={{
                fontSize: 8, fontFamily: "monospace", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em",
                color: "#4a4845", marginBottom: 8,
              }}>
                Edge Visibility
              </div>
              {edgeFilterRows.map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => onFiltersChange({ ...filters, [key]: !filters[key] })}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    width: "100%", padding: "4px 0",
                    background: "none", border: "none", cursor: "pointer",
                    opacity: filters[key] ? 1 : 0.38,
                    transition: "opacity 0.15s",
                  }}
                >
                  <span style={{ width: 16, height: 2, backgroundColor: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 9, fontFamily: "monospace", color: "#c0b8b0" }}>{label}</span>
                  <span style={{ marginLeft: "auto", fontSize: 8, fontFamily: "monospace", color: "#7a736a" }}>
                    {filters[key] ? "on" : "off"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* ── Default controls view ── */
        <>
          <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid #191816", flexShrink: 0 }}>
            <div style={{
              fontSize: 9, fontFamily: "monospace", fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4845",
            }}>
              Graph Controls
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {/* Edge visibility */}
            <div style={{ padding: "12px 14px", borderBottom: "1px solid #191816" }}>
              <div style={{
                fontSize: 8, fontFamily: "monospace", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em",
                color: "#4a4845", marginBottom: 10,
              }}>
                Edge Visibility
              </div>
              {edgeFilterRows.map(({ key, label, color, desc }) => (
                <button
                  key={key}
                  onClick={() => onFiltersChange({ ...filters, [key]: !filters[key] })}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    width: "100%", padding: "6px 0",
                    background: "none", border: "none", cursor: "pointer",
                    opacity: filters[key] ? 1 : 0.38,
                    transition: "opacity 0.15s",
                  }}
                >
                  <span style={{ width: 20, height: 2, backgroundColor: color, flexShrink: 0 }} />
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div style={{ fontSize: 10, fontFamily: "monospace", color: "#c0b8b0" }}>{label}</div>
                    <div style={{ fontSize: 8, fontFamily: "monospace", color: "#7a736a", marginTop: 1 }}>{desc}</div>
                  </div>
                  <span style={{ fontSize: 8, fontFamily: "monospace", color: filters[key] ? "#4a4845" : "#252320", flexShrink: 0 }}>
                    {filters[key] ? "shown" : "hidden"}
                  </span>
                </button>
              ))}
            </div>

            {/* Node type legend */}
            <div style={{ padding: "12px 14px", borderBottom: "1px solid #191816" }}>
              <div style={{
                fontSize: 8, fontFamily: "monospace", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em",
                color: "#4a4845", marginBottom: 8,
              }}>
                Node Types
              </div>
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
                  <span style={{ width: 8, height: 8, backgroundColor: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "#5f5a55" }}>
                    {TYPE_LABELS[type] || type}
                  </span>
                </div>
              ))}
            </div>

            {/* Interaction hints */}
            <div style={{ padding: "12px 14px" }}>
              <div style={{
                fontSize: 8, fontFamily: "monospace", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em",
                color: "#4a4845", marginBottom: 8,
              }}>
                Interactions
              </div>
              {[
                "Hover node → highlight connections",
                "Click node → pin + view details",
                "Click canvas → deselect",
                "Click in explorer → center node",
                "Scroll → zoom  ·  Drag → pan",
              ].map((hint, i) => (
                <div key={i} style={{
                  fontSize: 9, fontFamily: "monospace",
                  color: "#7a736a", padding: "2px 0", lineHeight: 1.5,
                }}>
                  {hint}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Canvas Layout (inner — uses useReactFlow)
───────────────────────────────────────────────────────────── */

function CodeCanvasLayout({ repoId, arch }: { repoId: string; arch: ArchMapType }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId,  setHoveredNodeId]  = useState<string | null>(null);
  const [filters, setFilters] = useState<EdgeFilters>({ calls: true, writes: true, imports: true });

  const { setCenter, getNode } = useReactFlow();

  // Compute which nodes are highlighted (focused + direct neighbors)
  const highlightedIds = useMemo<Set<string> | null>(() => {
    const focusId = selectedNodeId || hoveredNodeId;
    if (!focusId) return null;
    const ids = new Set<string>([focusId]);
    for (const e of arch.edges) {
      if (e.source === focusId) ids.add(e.target);
      if (e.target === focusId) ids.add(e.source);
    }
    return ids;
  }, [selectedNodeId, hoveredNodeId, arch.edges]);

  // Base layout + filtered edges
  const baseNodes = useMemo(() => buildLayout(arch.nodes), [arch.nodes]);
  const baseEdges = useMemo(() => buildEdges(arch.edges, filters), [arch.edges, filters]);

  const [nodes, setNodes, onNodesChange] = useNodesState(baseNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(baseEdges);

  // Sync when arch data or filters change
  useEffect(() => { setNodes(buildLayout(arch.nodes)); }, [arch.nodes, setNodes]);
  useEffect(() => { setEdges(buildEdges(arch.edges, filters)); }, [arch.edges, filters, setEdges]);

  // Apply highlight overlay on top of managed node positions
  const displayNodes = useMemo<Node[]>(() =>
    nodes.map(n => {
      if (n.type === "groupBg") return n;
      const isHl  = highlightedIds?.has(n.id) ?? false;
      const isDim = highlightedIds !== null && !isHl;
      return { ...n, data: { ...n.data, highlighted: isHl, dimmed: isDim } };
    }),
    [nodes, highlightedIds]
  );

  const displayEdges = useMemo<Edge[]>(() =>
    edges.map(e => {
      const isHl  = highlightedIds ? highlightedIds.has(e.source) && highlightedIds.has(e.target) : true;
      const isDim = highlightedIds !== null && !isHl;
      return {
        ...e,
        style:       { ...e.style, opacity: isDim ? 0.05 : 1 },
        animated:    !isDim && isAnimatedEdge(typeof e.label === "string" ? e.label : ""),
        labelStyle:  { ...e.labelStyle, fill: isDim ? "#191816" : "#4a4845" },
        zIndex:      isHl ? 10 : 0,
      };
    }),
    [edges, highlightedIds]
  );

  // Focus a node from the left sidebar
  const handleSidebarFocus = useCallback((nodeId: string) => {
    setSelectedNodeId(prev => prev === nodeId ? null : nodeId);
    const node = getNode(nodeId);
    if (node) {
      setCenter(node.position.x + 110, node.position.y + 60, { zoom: 1.1, duration: 500 });
    }
  }, [setCenter, getNode]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === "groupBg") return;
    setSelectedNodeId(prev => prev === node.id ? null : node.id);
  }, []);

  const handleNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === "groupBg") return;
    setHoveredNodeId(node.id);
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      {/* Left: Repository Explorer */}
      <LeftSidebar
        arch={arch}
        focusId={selectedNodeId}
        onFocus={handleSidebarFocus}
      />

      {/* Center: ReactFlow canvas */}
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          minZoom={0.05}
          maxZoom={3}
          defaultEdgeOptions={{ type: "default" }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={28} size={1}
            color="rgba(255,255,255,0.022)"
          />
          <Controls style={{ backgroundColor: "#141311", border: "1px solid #252320" }} />
          <MiniMap
            style={{ backgroundColor: "#0a0a09", border: "1px solid #191816" }}
            maskColor="rgba(0,0,0,0.82)"
            nodeColor={n =>
              n.type === "groupBg"
                ? "transparent"
                : (TYPE_COLORS[(n.data as ModuleNodeData)?.type] || "#4a4845")
            }
          />
        </ReactFlow>
      </div>

      {/* Right: Controls & Node Detail */}
      <RightPanel
        arch={arch}
        selectedNodeId={selectedNodeId}
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setSelectedNodeId(null)}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main export
───────────────────────────────────────────────────────────── */

export interface CodeCanvasProps {
  repoId: string;
  data?: ArchMapType | null;
}

export default function CodeCanvas({ repoId, data }: CodeCanvasProps) {
  const arch = data ?? DEMO_ARCH;
  return (
    <ReactFlowProvider>
      <div style={{ width: "100%", height: "100%", backgroundColor: "#0d0d0c" }}>
        <CodeCanvasLayout repoId={repoId} arch={arch} />
      </div>
    </ReactFlowProvider>
  );
}
