"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import DemoDashboardLayout from "@/components/DemoDashboardLayout";
import MermaidDiagram from "@/components/MermaidDiagram";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import type { ArchitectureMap as ArchMapType } from "@autodev/shared";
import {
  AlertCircle, Loader2, GitCommit, GitBranch, FileCode,
  Layers, Code2, Users, Hash, ChevronRight, Copy, Check,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Contributor {
  name: string; initials: string; color: string;
  commits: number; additions: number; deletions: number;
  modules: string[]; lastActive: string; role: string;
}

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_CONTRIBUTORS: Contributor[] = [
  { name: "STIWARTs", initials: "ST", color: "#E25A34", commits: 336, additions: 18640, deletions: 5300, modules: ["api", "auth", "database", "ui", "infra", "tests"], lastActive: "just now", role: "Full Stack" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildFlowchart(nodes: ArchMapType["nodes"], edges: ArchMapType["edges"]): string {
  const safeId = (id: string) => id.replace(/[^a-zA-Z0-9_]/g, "_");
  const safeLabel = (label: string) => label.replace(/"/g, "'").slice(0, 20);
  const lines: string[] = ["flowchart TD"];
  nodes.slice(0, 14).forEach((n) => {
    lines.push(`  ${safeId(n.id)}["${safeLabel(n.label)}"]`);
  });
  const visibleIds = new Set(nodes.slice(0, 14).map((n) => n.id));
  edges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target)).slice(0, 24).forEach((e) => {
    lines.push(`  ${safeId(e.source)} --> ${safeId(e.target)}`);
  });
  return lines.join("\n");
}

function buildPackageDiagram(repoId: string, techStack: Record<string, string | undefined>): string {
  const entries = Object.entries(techStack).slice(0, 8);
  const lines = ["graph LR", `  A["${repoId.split("/").pop()}"]`];
  entries.forEach(([key], i) => {
    const safe = key.replace(/[^a-zA-Z0-9]/g, "_");
    lines.push(`  ${safe}["${key}"]`);
    lines.push(`  A --> ${safe}`);
  });
  return lines.join("\n");
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DocSection({ id, icon: Icon, title, children }: { id: string; icon: any; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-6 h-6 bg-brand flex items-center justify-center shrink-0">
          <Icon className="w-3 h-3 text-brand-bg" />
        </div>
        <h2 className="text-base font-heading font-semibold text-brand-text">{title}</h2>
        <div className="flex-1 h-px bg-brand-border" />
      </div>
      {children}
    </section>
  );
}

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group bg-brand-bg border border-brand-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-brand-border">
        <span className="text-[9px] font-mono text-brand-muted uppercase tracking-widest">{lang}</span>
        <button
          onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="flex items-center gap-1.5 text-[9px] font-mono text-brand-muted hover:text-brand-text transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="px-4 py-3 text-xs font-mono text-brand-text overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  );
}

function DiagramCard({ title, chart }: { title: string; chart: string }) {
  return (
    <div className="bg-brand-bg border border-brand-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-brand-border bg-brand-surface">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-brand-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-brand-border" />
        </div>
        <span className="text-[10px] font-mono text-brand-muted ml-2">{title}</span>
      </div>
      <div className="p-4 [&_svg]:max-w-full [&_.node_rect]:fill-[#1E1D1C] [&_.node_rect]:stroke-[#2A2726] [&_.edgePath_path]:stroke-[#4a4845] [&_.label]:text-[#F0EEE6] [&_text]:fill-[#F0EEE6] [&_.edgeLabel]:text-[#8A8480]">
        <MermaidDiagram chart={chart} />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const TOC = [
  { id: "overview",      label: "Overview"              },
  { id: "architecture",  label: "Architecture"          },
  { id: "tech-stack",    label: "Tech Stack"            },
  { id: "structure",     label: "Project Structure"     },
  { id: "contributors",  label: "Contributors"          },
  { id: "ownership",     label: "Ownership Matrix"      },
];

export default function OverviewPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");
  const isDemo = decodedRepoId.startsWith("demo/");

  const [archMap, setArchMap] = useState<ArchMapType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const fetchData = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetchApi(`${getApiBase(decodedRepoId)}/analysis/${owner}/${repo}/architecture`, {}, token);
      if (res.ok) {
        const data = await res.json();
        const map = data.content ?? (data.nodes ? data : null);
        if (map) setArchMap(map as ArchMapType);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [owner, repo, decodedRepoId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalCommits = DEMO_CONTRIBUTORS.reduce((s, c) => s + c.commits, 0);
  const nodes = archMap?.nodes ?? [];
  const edges = archMap?.edges ?? [];
  const techEntries = archMap?.techStack ? Object.entries(archMap.techStack) : [];

  const flowchartCode = nodes.length > 0 ? buildFlowchart(nodes, edges) : `flowchart TD
  A["Frontend\\n(Next.js)"] --> B["API Layer\\n(Express)"]
  B --> C["Database\\n(DynamoDB)"]
  B --> D["AI Engine\\n(Bedrock)"]
  B --> E["Storage\\n(S3)"]
  D --> F["Embeddings\\n(Titan)"]`;

  const techDiagramCode = techEntries.length > 0
    ? buildPackageDiagram(decodedRepoId, Object.fromEntries(techEntries))
    : `graph LR
  App["Application"] --> TS["TypeScript"]
  App --> Next["Next.js 14"]
  App --> Express["Express"]
  App --> AWS["AWS Bedrock"]
  App --> DDB["DynamoDB"]
  App --> S3["S3"]`;

  const sequenceDiagram = `sequenceDiagram
  autonumber
  actor Dev as Developer
  participant FE as Frontend
  participant API as API Gateway
  participant AI as Bedrock AI
  participant DB as DynamoDB

  Dev->>FE: Connect repository
  FE->>API: POST /repos/analyze
  API->>AI: Generate embeddings
  AI-->>API: Vector embeddings
  API->>DB: Store analysis
  DB-->>API: Stored
  API-->>FE: Analysis complete
  FE-->>Dev: Show architecture map`;

  const structureTree = `${decodedRepoId}/
├── packages/
│   ├── frontend/          # Next.js dashboard
│   ├── backend/           # Express API + Lambda
│   ├── github-app/        # Probot GitHub App
│   ├── vscode-extension/  # VS Code extension
│   └── shared/            # Shared TypeScript types
├── infrastructure/        # AWS CDK/SAM templates
├── skills/                # Claude Code skills
└── SPEC.md                # Task specification`;

  return (
    <DemoDashboardLayout title="Overview" subtitle="Project documentation, architecture, and contributor insights">
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 border border-red-500/20 bg-red-500/5 text-red-300 text-sm font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      ) : (
        <div className="flex gap-8 items-start">

          {/* ── TOC sidebar ── */}
          <aside className="hidden xl:block w-48 shrink-0 sticky top-24">
            <p className="text-[9px] font-mono text-brand-muted uppercase tracking-widest mb-3">On this page</p>
            <nav className="space-y-px">
              {TOC.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-mono text-brand-muted hover:text-brand-text hover:bg-brand-surface transition-colors"
                >
                  <ChevronRight className="w-2.5 h-2.5 shrink-0" />
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* ── Doc body ── */}
          <div className="flex-1 min-w-0 space-y-12">

            {/* ─── Overview ─────────────────────────────────────── */}
            <DocSection id="overview" icon={Code2} title="Overview">
              <div className="bg-brand-surface border border-brand-border p-6 relative overflow-hidden mb-5">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand" />
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-2xl font-heading font-bold text-brand-text">{decodedRepoId}</h1>
                  {isDemo && <span className="text-[9px] font-mono px-2 py-0.5 border border-brand/30 text-brand bg-brand/10 uppercase tracking-widest">Demo</span>}
                </div>
                <p className="text-sm font-mono text-brand-muted leading-relaxed mb-6">
                  {archMap
                    ? `AI-powered codebase onboarding platform. This repository contains ${nodes.length} modules with ${edges.length} dependency edges. ${techEntries.length > 0 ? `Built with ${techEntries.slice(0, 4).map(([k]) => k).join(", ")}.` : ""}`
                    : "AI-powered codebase onboarding platform. Node.js/TypeScript monorepo with Next.js frontend, Express backend, Probot GitHub App, VS Code extension, AWS Bedrock + Lambda + DynamoDB + S3."
                  }
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: Layers,    label: "Modules",      value: nodes.length || "—" },
                    { icon: GitBranch, label: "Dependencies", value: edges.length  || "—" },
                    { icon: FileCode,  label: "Tech Stack",   value: techEntries.length || "—" },
                    { icon: Users,     label: "Contributors", value: DEMO_CONTRIBUTORS.length },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3 px-4 py-3 bg-brand-bg border border-brand-border">
                      <s.icon className="w-4 h-4 text-brand shrink-0" />
                      <div>
                        <div className="text-[9px] font-mono text-brand-muted uppercase tracking-widest">{s.label}</div>
                        <div className="text-xl font-heading font-bold text-brand-text">{s.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DocSection>

            {/* ─── Architecture ──────────────────────────────────── */}
            <DocSection id="architecture" icon={GitBranch} title="Architecture">
              <div className="space-y-5">
                <p className="text-sm font-mono text-brand-muted leading-relaxed">
                  The following diagrams are auto-generated from live analysis of your codebase.
                  Each node represents a module; arrows show import/dependency relationships.
                </p>

                <DiagramCard title="module-dependency-graph.mermaid" chart={flowchartCode} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <DiagramCard title="tech-stack-overview.mermaid" chart={techDiagramCode} />
                  <DiagramCard title="request-flow.mermaid"        chart={sequenceDiagram} />
                </div>

                {/* Raw mermaid code block */}
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer text-[11px] font-mono text-brand-muted hover:text-brand-text transition-colors select-none mb-2">
                    <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                    View raw Mermaid source
                  </summary>
                  <CodeBlock code={flowchartCode} lang="mermaid" />
                </details>
              </div>
            </DocSection>

            {/* ─── Tech Stack ────────────────────────────────────── */}
            <DocSection id="tech-stack" icon={Hash} title="Tech Stack">
              {techEntries.length > 0 ? (
                <div className="bg-brand-surface border border-brand-border overflow-hidden">
                  <div className="grid grid-cols-[1fr_1fr] text-[9px] font-mono text-brand-muted uppercase tracking-widest px-4 py-2.5 border-b border-brand-border bg-brand-bg">
                    <span>Technology</span><span>Version / Details</span>
                  </div>
                  {techEntries.map(([key, value], i) => (
                    <div key={key} className={`grid grid-cols-[1fr_1fr] px-4 py-3 ${i % 2 === 0 ? "" : "bg-brand-bg"} border-b border-brand-border last:border-0`}>
                      <span className="text-[12px] font-mono text-brand">{key}</span>
                      <span className="text-[12px] font-mono text-brand-muted">{String(value ?? "—")}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-brand-surface border border-brand-border overflow-hidden">
                  <div className="grid grid-cols-[1fr_1fr] text-[9px] font-mono text-brand-muted uppercase tracking-widest px-4 py-2.5 border-b border-brand-border bg-brand-bg">
                    <span>Technology</span><span>Role</span>
                  </div>
                  {[
                    ["TypeScript", "Primary language"],
                    ["Next.js 14", "Frontend framework"],
                    ["Express",    "Backend API"],
                    ["AWS Bedrock","AI / LLM layer"],
                    ["DynamoDB",   "Primary database"],
                    ["S3",         "File storage"],
                    ["Probot",     "GitHub App framework"],
                    ["React Flow", "Graph visualization"],
                  ].map(([tech, role], i) => (
                    <div key={tech} className={`grid grid-cols-[1fr_1fr] px-4 py-3 ${i % 2 === 0 ? "" : "bg-brand-bg"} border-b border-brand-border last:border-0`}>
                      <span className="text-[12px] font-mono text-brand">{tech}</span>
                      <span className="text-[12px] font-mono text-brand-muted">{role}</span>
                    </div>
                  ))}
                </div>
              )}
            </DocSection>

            {/* ─── Project Structure ─────────────────────────────── */}
            <DocSection id="structure" icon={FileCode} title="Project Structure">
              <CodeBlock code={structureTree} lang="directory tree" />
            </DocSection>

            {/* ─── Contributors ──────────────────────────────────── */}
            <DocSection id="contributors" icon={Users} title="Contributors">
              {/* Stacked commit bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-brand-muted">{totalCommits} total commits</span>
                  <span className="text-[10px] font-mono text-brand-muted">{DEMO_CONTRIBUTORS.length} contributors</span>
                </div>
                <div className="h-2 flex gap-px overflow-hidden bg-brand-border">
                  {DEMO_CONTRIBUTORS.map((c) => (
                    <div key={c.name} className="h-full" style={{ width: `${(c.commits / totalCommits) * 100}%`, background: c.color }} title={`${c.name}: ${c.commits}`} />
                  ))}
                </div>
                <div className="flex gap-4 mt-2">
                  {DEMO_CONTRIBUTORS.map((c) => (
                    <div key={c.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 shrink-0" style={{ background: c.color }} />
                      <span className="text-[9px] font-mono text-brand-muted">{c.name.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-brand-surface border border-brand-border overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-2.5 border-b border-brand-border bg-brand-bg text-[9px] font-mono text-brand-muted uppercase tracking-widest">
                  <span />
                  <span>Name</span>
                  <span className="text-right">Commits</span>
                  <span className="text-right hidden sm:block">Changes</span>
                  <span>Last active</span>
                </div>
                {DEMO_CONTRIBUTORS.map((c, i) => (
                  <div key={c.name} className={`grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-4 border-b border-brand-border last:border-0 ${i % 2 !== 0 ? "bg-brand-bg" : ""} group hover:bg-brand-card transition-colors`}>
                    {/* avatar */}
                    <div className="w-8 h-8 flex items-center justify-center text-brand-bg text-[10px] font-bold font-mono shrink-0" style={{ background: c.color }}>
                      {c.initials}
                    </div>
                    {/* name + role + modules */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-mono text-brand-text font-semibold">{c.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 border uppercase tracking-wider" style={{ color: c.color, borderColor: `${c.color}40`, background: `${c.color}10` }}>{c.role}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {c.modules.map((m) => (
                          <span key={m} className="text-[9px] font-mono px-1.5 py-0.5 bg-brand-bg border border-brand-border text-brand-muted">{m}</span>
                        ))}
                      </div>
                    </div>
                    {/* commits + bar */}
                    <div className="flex flex-col items-end gap-1 min-w-[80px]">
                      <span className="text-[12px] font-mono font-bold" style={{ color: c.color }}>{c.commits}</span>
                      <div className="w-20 h-0.5 bg-brand-border">
                        <div className="h-full" style={{ width: `${(c.commits / totalCommits) * 100 * 2}%`, maxWidth: "100%", background: c.color }} />
                      </div>
                    </div>
                    {/* additions/deletions */}
                    <div className="hidden sm:flex flex-col items-end gap-0.5">
                      <span className="text-[10px] font-mono text-emerald-400">+{c.additions.toLocaleString()}</span>
                      <span className="text-[10px] font-mono text-red-400">−{c.deletions.toLocaleString()}</span>
                    </div>
                    {/* last active */}
                    <span className="text-[10px] font-mono text-brand-muted whitespace-nowrap">{c.lastActive}</span>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* ─── Ownership Matrix ──────────────────────────────── */}
            <DocSection id="ownership" icon={GitCommit} title="Ownership Matrix">
              <p className="text-sm font-mono text-brand-muted mb-5">
                Which modules each contributor primarily owns (filled) vs. contributes to (outlined).
              </p>
              <div className="bg-brand-surface border border-brand-border overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-bg border-b border-brand-border">
                      <th className="text-[9px] font-mono text-brand-muted uppercase tracking-widest py-3 px-5 w-36">Member</th>
                      {(nodes.length > 0 ? nodes.slice(0, 8).map((n) => n.label) : ["api", "auth", "ui", "db", "infra", "tests", "docs", "ci"]).map((mod) => (
                        <th key={mod} className="text-[9px] font-mono text-brand-muted uppercase tracking-wider py-3 px-3 text-center min-w-[52px]">{mod}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_CONTRIBUTORS.map((c, ri) => {
                      const cols = nodes.length > 0 ? nodes.slice(0, 8).map((n) => n.label) : ["api", "auth", "ui", "db", "infra", "tests", "docs", "ci"];
                      return (
                        <tr key={c.name} className={`border-b border-brand-border last:border-0 ${ri % 2 !== 0 ? "bg-brand-bg" : ""}`}>
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 flex items-center justify-center text-brand-bg text-[8px] font-bold font-mono shrink-0" style={{ background: c.color }}>{c.initials}</div>
                              <span className="text-[11px] font-mono text-brand-text truncate">{c.name.split(" ")[0]}</span>
                            </div>
                          </td>
                          {cols.map((mod) => {
                            const owns = c.modules.some((m) => mod.toLowerCase().includes(m) || m.includes(mod.toLowerCase()));
                            const partial = !owns && ((c.name.length + mod.length) % 3 === 0);
                            return (
                              <td key={mod} className="py-3 px-3 text-center">
                                {owns ? (
                                  <div className="w-5 h-5 mx-auto" style={{ background: c.color }} title="Primary owner" />
                                ) : partial ? (
                                  <div className="w-5 h-5 mx-auto border" style={{ borderColor: c.color, background: `${c.color}20` }} title="Contributor" />
                                ) : (
                                  <div className="w-5 h-5 mx-auto bg-brand-border opacity-20" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-brand" /><span className="text-[9px] font-mono text-brand-muted">Primary owner</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 border border-brand bg-brand/20" /><span className="text-[9px] font-mono text-brand-muted">Contributor</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-brand-border opacity-20" /><span className="text-[9px] font-mono text-brand-muted">No activity</span></div>
              </div>
            </DocSection>

          </div>
        </div>
      )}
    </DemoDashboardLayout>
  );
}
