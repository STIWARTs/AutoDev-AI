"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import CodeCanvas from "@/components/CodeCanvas";
import DemoDashboardLayout from "@/components/DemoDashboardLayout";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import type { ArchitectureMap as ArchMapType } from "@autodev/shared";
import { Layers, GitBranch, FileCode2 } from "lucide-react";

export default function CanvasPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [archData, setArchData] = useState<ArchMapType | null>(null);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const fetchArch = useCallback(async () => {
    if (!owner || !repo) { setLoading(false); return; }
    try {
      const token = await getToken();
      const res = await fetchApi(
        `${getApiBase(decodedRepoId)}/analysis/${owner}/${repo}/architecture`,
        {},
        token
      );
      if (!res.ok) return;
      const data = await res.json();
      setArchData(data.content ?? data);
    } catch { /* fall through to demo data */ } finally {
      setLoading(false);
    }
  }, [owner, repo, decodedRepoId, getToken]);

  useEffect(() => { fetchArch(); }, [fetchArch]);

  // Stats — real if available, demo fallback
  const DEMO_COUNTS = { modules: 12, files: 45, edges: 18 };
  const moduleCount = archData ? archData.nodes.length : DEMO_COUNTS.modules;
  const fileCount   = archData ? archData.nodes.reduce((s, n) => s + n.files.length, 0) : DEMO_COUNTS.files;
  const edgeCount   = archData ? archData.edges.length : DEMO_COUNTS.edges;

  return (
    <DemoDashboardLayout
      title="Code Canvas"
      subtitle="Interactive dependency graph with module explorer and connection analysis"
      action={
        <div className="flex items-center gap-2 text-[10px] font-mono text-brand-muted">
          <span className="border border-brand-border px-2 py-1">Scroll to zoom</span>
          <span className="border border-brand-border px-2 py-1">Drag to pan</span>
          <span className="border border-brand-border px-2 py-1">Click nodes to explore</span>
        </div>
      }
    >
      {/* Stats strip */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        {[
          { icon: Layers,    label: `${moduleCount} modules` },
          { icon: FileCode2, label: `${fileCount} files` },
          { icon: GitBranch, label: `${edgeCount} connections` },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 text-[10px] font-mono text-brand-muted border border-brand-border px-2.5 py-1.5"
          >
            <Icon className="w-3 h-3 text-brand" />
            {label}
          </div>
        ))}

        {!archData && (
          <span className="ml-auto text-[10px] font-mono text-brand-muted/50">
            Demo data — run analysis for your repo
          </span>
        )}
      </div>

      {/* Canvas — full height, 3-panel layout handled inside CodeCanvas */}
      <div
        className="border border-brand-border overflow-hidden"
        style={{ height: "calc(100vh - 260px)", minHeight: 560 }}
      >
        {loading ? (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: "#0d0d0c" }}
          >
            <div className="text-center">
              <div className="flex items-end gap-1 mx-auto mb-5" style={{ width: 52, height: 40 }}>
                {[0.45, 0.75, 1.0, 0.75, 0.45].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-brand eq-bar"
                    style={{ height: `${h * 100}%`, animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
              <p className="text-brand-muted text-sm font-mono">Building canvas...</p>
            </div>
          </div>
        ) : (
          <CodeCanvas repoId={decodedRepoId} data={archData} />
        )}
      </div>
    </DemoDashboardLayout>
  );
}
