"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { CoreBalance } from "@/components/common/core-balance";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Search, Command, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoteStatus } from "@/hooks/use-vote-status";

export function DashboardHeader() {
  const { canVote } = useVoteStatus();

  const triggerCommandMenu = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true })
    );
  };

  return (
    <header
      className="h-16 sticky top-0 z-50 flex items-center justify-between rounded-t-xl border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl transition-all duration-300 ease-in-out"
      style={{ paddingLeft: "var(--page-px)", paddingRight: "var(--page-px)" }}
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger className="hover:bg-primary/10 transition-colors" />

        {/* Mobile Search Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={triggerCommandMenu}
          className="flex sm:hidden h-9 w-9 items-center justify-center text-zinc-400 bg-zinc-900/60 border-white/10 hover:border-cyan-500/30 hover:bg-zinc-900 hover:text-white transition-all shadow-inner shrink-0"
          aria-label="Search tools and servers"
        >
          <Search className="w-4 h-4 text-cyan-400" />
        </Button>

        {/* Tablet & Desktop Expanded ⌘K Search Bar */}
        <Button
          variant="outline"
          onClick={triggerCommandMenu}
          className="hidden sm:flex items-center justify-between gap-2 h-9 px-3 w-44 md:w-56 lg:w-72 text-xs text-zinc-400 bg-zinc-900/60 border-white/10 hover:border-cyan-500/30 hover:bg-zinc-900 hover:text-white transition-all shadow-inner shrink-0"
        >
          <div className="flex items-center gap-2 min-w-0 truncate">
            <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Search tools & servers...</span>
          </div>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 shrink-0">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </Button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {canVote && (
          <a
            href="https://top.gg/bot/1392714201558159431/vote"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-500/20 hover:border-purple-500/50 text-[11px] font-mono font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] active:scale-95 animate-pulse whitespace-nowrap shrink-0 leading-none"
            title="Vote on Top.gg to claim your free +1 Core credit"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-purple-300 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap leading-none">
              Vote +1 Core
            </span>
            <span className="sm:hidden whitespace-nowrap leading-none">+1</span>
          </a>
        )}
        <NotificationBell />
        <CoreBalance />
      </div>
    </header>
  );
}
