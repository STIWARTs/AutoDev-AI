"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  Map,
  Play,
  BookOpen,
  FileText,
  Terminal,
  MessageCircle,
  BarChart3,
  Users,
  ChevronLeft,
  Zap,
  Sparkles,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Explore",
    items: [
      { href: "",            label: "Architecture Map", icon: Map },
      { href: "/animated",   label: "Animated Map",    icon: Play },
      { href: "/walkthroughs", label: "Walkthroughs",  icon: BookOpen },
    ],
  },
  {
    label: "Understand",
    items: [
      { href: "/conventions", label: "Conventions", icon: FileText },
      { href: "/env-setup",   label: "Env Setup",   icon: Terminal },
      { href: "/qa",          label: "Q&A",          icon: MessageCircle },
    ],
  },
  {
    label: "Progress",
    items: [
      { href: "/progress", label: "My Progress", icon: BarChart3 },
      { href: "/team",     label: "Team",         icon: Users },
    ],
  },
];

interface DemoDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function DemoDashboardLayout({
  children,
  title,
  subtitle,
  action,
}: DemoDashboardLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const basePath = `/dashboard/${repoId}`;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-mid)" }}>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 h-full w-[220px] flex flex-col z-40 sidebar">

        {/* Top gradient line */}
        <div className="h-[1px] w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)" }} />

        {/* Logo */}
        <div className="px-4 pt-5 pb-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 mb-4 group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 animate-glow-pulse"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
            >
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-heading font-semibold text-white text-sm tracking-tight gradient-text-indigo">
              AutoDev
            </span>
          </Link>

          {/* Repo badge */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all duration-200 group"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.06)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
            }}
          >
            <ChevronLeft className="w-3 h-3 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>
                Repository
              </p>
              <p className="text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>
                {decodedRepoId}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto space-y-5 pb-4">
          {NAV_SECTIONS.map((section) => {
            return (
              <div key={section.label}>
                <p
                  className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const href = `${basePath}${item.href}`;
                    const isActive =
                      item.href === ""
                        ? pathname === basePath
                        : pathname.startsWith(`${basePath}${item.href}`);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={href}
                        className="nav-item"
                        style={isActive ? {
                          background: "rgba(99,102,241,0.12)",
                          color: "#a5b4fc",
                          boxShadow: "inset 2px 0 0 rgba(99,102,241,0.7)",
                        } : {}}
                      >
                        <Icon
                          className="w-[15px] h-[15px] flex-shrink-0 nav-icon"
                          style={{ color: isActive ? "#818cf8" : "var(--text-muted)" }}
                        />
                        <span>{item.label}</span>
                        {isActive && (
                          <span
                            className="ml-auto w-1 h-1 rounded-full"
                            style={{ background: "#818cf8" }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Demo Mode badge */}
        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.15)" }}
          >
            <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: "#fbbf24" }} />
            <p className="text-xs font-semibold" style={{ color: "#fbbf24" }}>Demo Mode</p>
            <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#fbbf24" }} />
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="ml-[220px] flex-1 min-h-screen" style={{ background: "var(--bg-mid)" }}>

        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-8 py-4"
          style={{
            background: "rgba(8,12,24,0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="page-header-line" />
            <div>
              <h1
                className="text-lg font-heading font-semibold tracking-tight"
                style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
              >
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>

        {/* Page body */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
