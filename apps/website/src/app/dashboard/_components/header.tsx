"use client";

import type { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CoreBalance } from "@/components/common/core-balance";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Search, Command } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  /**
   * Server-rendered balance chip (Suspense-wrapped). Falls back to the
   * client-only CoreBalance when not provided.
   */
  balanceSlot?: ReactNode;
}

export function DashboardHeader({ balanceSlot }: DashboardHeaderProps) {
  const triggerCommandMenu = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true })
    );
  };

  return (
    <header
      className="h-16 sticky top-0 z-50 flex items-center justify-between gap-4 rounded-t-xl border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl transition-all duration-300 ease-in-out"
      style={{ paddingLeft: "var(--page-px)", paddingRight: "var(--page-px)" }}
    >
      {/* Left: Sidebar trigger + Command Search (mr-4 guarantees gap from right cluster) */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 mr-4 sm:mr-6">
        <SidebarTrigger className="hover:bg-primary/10 transition-colors shrink-0" />

        {/* Search Trigger Button — Sized to preserve generous gap on all screens */}
        <Button
          variant="outline"
          onClick={triggerCommandMenu}
          className="flex items-center justify-between gap-2 h-9 px-2.5 sm:px-3 text-xs text-zinc-400 bg-zinc-900/60 border-white/10 hover:border-cyan-500/30 hover:bg-zinc-900 hover:text-white transition-all shadow-inner w-9 sm:w-36 md:w-44 lg:w-48 xl:w-56 shrink-0"
        >
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden sm:inline truncate font-medium">Search...</span>
          </div>

          {/* Keyboard Shortcut Badge (>= md) */}
          <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 shrink-0">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </Button>
      </div>

      {/* Right: Notifications + Core & Spark Balance */}
      <div className="flex items-center gap-2 shrink-0">
        <NotificationBell />
        {balanceSlot ?? <CoreBalance />}
      </div>
    </header>
  );
}
