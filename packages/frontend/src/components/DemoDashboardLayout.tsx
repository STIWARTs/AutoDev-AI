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
} from "lucide-react";

const NAV_ITEMS = [
  { href: "", label: "Architecture Map", icon: Map },
  { href: "/animated", label: "Animated Map", icon: Play },
  { href: "/walkthroughs", label: "Walkthroughs", icon: BookOpen },
  { href: "/conventions", label: "Conventions", icon: FileText },
  { href: "/env-setup", label: "Env Setup", icon: Terminal },
  { href: "/qa", label: "Q&A", icon: MessageCircle },
  { href: "/progress", label: "My Progress", icon: BarChart3 },
  { href: "/team", label: "Team", icon: Users },
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
    <div className="flex min-h-screen bg-[#090b10]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 flex flex-col border-r border-white/[0.05] bg-[#0c0f16]/95 backdrop-blur-xl z-40">
        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 mb-5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">AutoDev</span>
          </Link>

          {/* Repo badge */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors group"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-brand-muted group-hover:text-white transition-colors" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-brand-muted uppercase tracking-widest font-medium">Repository</p>
              <p className="text-xs text-brand-text-secondary font-medium truncate mt-0.5">{decodedRepoId}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                    : "text-brand-text-secondary hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? "text-indigo-400" : "text-brand-muted group-hover:text-brand-text-secondary"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Demo badge */}
        <div className="p-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-xs text-amber-400 font-medium">Demo Mode</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 p-8 min-h-screen">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-brand-text-secondary text-sm mt-1">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>

        {children}
      </main>
    </div>
  );
}
