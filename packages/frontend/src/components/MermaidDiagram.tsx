"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export default function MermaidDiagram({ chart, className = "" }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const id = useRef(`mermaid-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor: "#1E1D1C",
            primaryTextColor: "#F0EEE6",
            primaryBorderColor: "#2A2726",
            lineColor: "#4a4845",
            secondaryColor: "#1A1918",
            tertiaryColor: "#1E1D1C",
            background: "#111110",
            mainBkg: "#1E1D1C",
            nodeBorder: "#2A2726",
            clusterBkg: "#1A1918",
            titleColor: "#F0EEE6",
            edgeLabelBackground: "#1E1D1C",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
          },
          flowchart: { curve: "linear", htmlLabels: true, rankSpacing: 60, nodeSpacing: 40 },
        });

        const { svg: rendered } = await mermaid.render(id.current, chart);
        if (!cancelled) setSvg(rendered);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Render error");
      }
    }
    render();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) return (
    <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-400 font-mono text-xs">{error}</div>
  );

  if (!svg) return (
    <div className="flex items-center justify-center py-10">
      <div className="flex gap-1">
        {[0.4, 0.7, 1, 0.7, 0.4].map((h, i) => (
          <div key={i} className="w-1 bg-brand animate-pulse" style={{ height: `${h * 24}px`, animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      className={`mermaid-container overflow-x-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ filter: "invert(0)" }}
    />
  );
}
