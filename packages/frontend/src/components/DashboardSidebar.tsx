"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  Play,
  Footprints,
  Ruler,
  Terminal,
  MessageCircle,
  BarChart3,
  Users,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { href: "", label: "Architecture Map", Icon: Map },
  { href: "/animated", label: "Animated Map", Icon: Play },
  { href: "/walkthroughs", label: "Walkthroughs", Icon: Footprints },
  { href: "/conventions", label: "Conventions", Icon: Ruler },
  { href: "/env-setup", label: "Env Setup", Icon: Terminal },
  { href: "/qa", label: "Q&A", Icon: MessageCircle },
  { href: "/progress", label: "My Progress", Icon: BarChart3 },
  { href: "/team", label: "Team", Icon: Users },
];

interface DashboardSidebarProps {
  repoId: string;
  decodedRepoId: string;
}

export default function DashboardSidebar({ repoId, decodedRepoId }: DashboardSidebarProps) {
  const pathname = usePathname();
  const basePath = `/dashboard/${repoId}`;

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="fixed left-0 top-0 w-[260px] h-full bg-brand-bg/95 backdrop-blur-xl border-r border-white/[0.06] flex flex-col z-40">
        {/* Logo */}
        <div className="px-5 pt-5 pb-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow duration-300">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-heading font-bold text-gradient">AutoDev</span>
          </Link>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* Repo name */}
        <div className="px-5 py-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-brand-text-secondary hover:text-brand-text transition-colors duration-200 cursor-pointer group"
              >
                <ChevronLeft className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="truncate font-medium">{decodedRepoId}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Back to repositories</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-0.5">
            {navItems.map(({ href, label, Icon }) => {
              const fullHref = `${basePath}${href}`;
              const isActive = href === ""
                ? pathname === basePath
                : pathname.startsWith(fullHref);

              return (
                <Link
                  key={href}
                  href={fullHref}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 cursor-pointer group relative",
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      : "text-brand-text-secondary hover:text-brand-text hover:bg-white/[0.04] border border-transparent"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-indigo-500" />
                  )}
                  <Icon className={cn(
                    "w-4 h-4 transition-colors duration-200",
                    isActive ? "text-indigo-400" : "text-brand-muted group-hover:text-brand-text-secondary"
                  )} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 status-dot" />
            <span className="text-xs text-brand-muted">Connected</span>
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
}
