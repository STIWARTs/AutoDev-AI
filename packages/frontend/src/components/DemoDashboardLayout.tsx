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
  Code2,
  Network,
  Search,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "",              label: "Architecture Map", icon: Map },
  { href: "/animated",    label: "Animated Map",     icon: Play },
  { href: "/canvas",      label: "Code Canvas",      icon: Network },
  { href: "/walkthroughs",label: "Walkthroughs",     icon: BookOpen },
  { href: "/conventions", label: "Conventions",      icon: FileText },
  { href: "/env-setup",   label: "Env Setup",        icon: Terminal },
  { href: "/qa",          label: "Q&A",              icon: MessageCircle },
  { href: "/progress",    label: "My Progress",      icon: BarChart3 },
  { href: "/team",        label: "Team",             icon: Users },
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

  // Derive short repo name for breadcrumb
  const repoShort = decodedRepoId.split("/").pop() ?? decodedRepoId;

  return (
    <div className="flex min-h-screen bg-brand-bg font-body">

      {/* Grid texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(226,90,52,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(226,90,52,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 h-full w-[248px] flex flex-col z-40 bg-brand-bg border-r border-brand-border">

        {/* Logo */}
        <div className="px-5 pt-5 pb-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 group mb-4">
            <div className="w-7 h-7 bg-brand-DEFAULT flex items-center justify-center flex-shrink-0">
              <Code2 className="w-3.5 h-3.5 text-brand-bg" />
            </div>
            <span className="font-heading font-semibold text-brand-text text-base tracking-tight">AutoDev</span>
          </Link>

          {/* Repo badge */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2.5 border border-brand-border hover:border-brand-DEFAULT/40 transition-colors duration-200 group"
          >
            <ChevronLeft className="w-3 h-3 text-brand-muted group-hover:text-brand-DEFAULT transition-colors flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-brand-muted uppercase tracking-widest font-medium">Repository</p>
              <p className="text-xs text-brand-text font-medium truncate mt-0.5">{decodedRepoId}</p>
            </div>
          </Link>

          {/* ⌘K search hint */}
          <button className="mt-2 flex items-center justify-between w-full px-3 py-2 border border-brand-border hover:border-brand-DEFAULT/30 transition-colors group text-left">
            <div className="flex items-center gap-2">
              <Search className="w-3 h-3 text-brand-muted" />
              <span className="text-[11px] text-brand-muted font-mono">Search...</span>
            </div>
            <div className="flex items-center gap-0.5">
              <kbd className="text-[9px] px-1 py-0.5 border border-brand-border text-brand-muted font-mono bg-brand-card">⌘</kbd>
              <kbd className="text-[9px] px-1 py-0.5 border border-brand-border text-brand-muted font-mono bg-brand-card">K</kbd>
            </div>
          </button>
        </div>

        <div className="h-px bg-brand-border mx-5" />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-px overflow-y-auto">
          <p className="px-3 mb-2 text-[9px] uppercase tracking-widest text-brand-muted font-semibold">Features</p>
          {NAV_ITEMS.map((item) => {
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
                className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-all duration-150 group relative ${
                  isActive
                    ? "text-brand-DEFAULT bg-brand-DEFAULT/5 border border-brand-DEFAULT/20"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-surface"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-brand-DEFAULT" />
                )}
                <Icon
                  className={`w-[14px] h-[14px] flex-shrink-0 transition-colors ${
                    isActive ? "text-brand-DEFAULT" : "text-brand-muted group-hover:text-brand-text"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-brand-border space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-brand-DEFAULT/5 border border-brand-DEFAULT/20">
            <Zap className="w-3 h-3 text-brand-DEFAULT flex-shrink-0" />
            <p className="text-[11px] text-brand-DEFAULT font-medium tracking-wide flex-1">Demo Mode</p>
            <span className="text-[9px] font-mono text-brand-DEFAULT/70 border border-brand-DEFAULT/20 px-1.5 py-0.5">LIVE</span>
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono text-brand-muted">v0.1.0</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-mono text-brand-muted">AWS Bedrock</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="ml-[248px] flex-1 min-h-screen relative z-10">
        {/* Top header */}
        <div className="flex items-start justify-between px-8 py-5 border-b border-brand-border bg-brand-bg/95 backdrop-blur-sm sticky top-0 z-30">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <Link href="/dashboard" className="text-[10px] text-brand-muted hover:text-brand-text transition-colors font-mono uppercase tracking-wider">
                Repos
              </Link>
              <span className="text-brand-border font-mono text-[10px]">/</span>
              <span className="text-[10px] text-brand-muted font-mono truncate max-w-[100px]">{repoShort}</span>
              <span className="text-brand-border font-mono text-[10px]">/</span>
              <span className="text-[10px] text-brand-DEFAULT font-mono uppercase tracking-wider">{title}</span>
            </div>
            <h1 className="text-xl font-heading font-semibold text-brand-text tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-brand-muted text-xs mt-0.5 font-mono">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="hidden lg:flex items-center gap-1 text-[10px] text-brand-muted font-mono border border-brand-border px-2 py-1">
              <span>?</span>
              <span className="ml-1 opacity-60">shortcuts</span>
            </div>
            {action && <div className="flex items-center gap-2">{action}</div>}
          </div>
        </div>

        {/* Page body */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
