"use client";

import { useParams } from "next/navigation";
import CodeCanvas from "@/components/CodeCanvas";
import DemoDashboardLayout from "@/components/DemoDashboardLayout";
import { Network, Layers, GitBranch, Info } from "lucide-react";

export default function CanvasPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);

  const LEGEND = [
    { color: "#3b82f6", label: "Component" },
    { color: "#8b5cf6", label: "Service" },
    { color: "#10b981", label: "Database" },
    { color: "#6b7280", label: "Module" },
  ];

  return (
    <DemoDashboardLayout
      title="Code Canvas"
      subtitle="Interactive infinite graph — drag nodes, scroll to zoom"
      action={
        <div className="flex items-center gap-2 text-[10px] font-mono text-brand-muted border border-brand-border px-2 py-1">
          <Info className="w-3 h-3" />
          <span>Drag nodes to rearrange</span>
        </div>
      }
    >
      {/* Stats strip */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {[
          { icon: Layers, label: "7 Nodes" },
          { icon: GitBranch, label: "7 Connections" },
          { icon: Network, label: "React Flow" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-[10px] font-mono text-brand-muted border border-brand-border px-2.5 py-1.5">
            <Icon className="w-3 h-3 text-brand" />
            {label}
          </div>
        ))}
        {/* Legend */}
        <div className="ml-auto flex items-center gap-4">
          {LEGEND.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-[10px] font-mono text-brand-muted">
              <span className="w-2 h-2 flex-shrink-0" style={{ backgroundColor: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="border border-brand-border overflow-hidden" style={{ height: "calc(100vh - 340px)", minHeight: 500 }}>
        <CodeCanvas repoId={decodedRepoId} />
      </div>

      {/* Footer hints */}
      <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-brand-muted">
        <span>Scroll to zoom</span>
        <span className="text-brand-border">·</span>
        <span>Click + drag to pan</span>
        <span className="text-brand-border">·</span>
        <span>Drag nodes to rearrange</span>
      </div>
    </DemoDashboardLayout>
  );
}
