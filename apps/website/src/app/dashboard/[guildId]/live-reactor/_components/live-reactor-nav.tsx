"use client";

import {
  Cable,
  Settings,
  Terminal,
  MessageSquareQuote,
  Timer,
  Activity,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  group?: string;
}

const navItems: NavItem[] = [
  { id: "connection", label: "Connection", icon: Cable },
  { id: "config", label: "Configuration", icon: Settings, group: "config" },
  { id: "commands", label: "Commands", icon: Terminal },
  { id: "quotes", label: "Quotes", icon: MessageSquareQuote, group: "content" },
  { id: "timers", label: "Timers", icon: Timer, group: "content" },
  { id: "filters", label: "Filters", icon: Shield, group: "moderation" },
  { id: "diagnostics", label: "Diagnostics", icon: Activity, group: "system" },
];

interface LiveReactorNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isConnected: boolean;
}

export function LiveReactorNav({
  activeTab,
  onTabChange,
  isConnected,
}: LiveReactorNavProps) {
  const getStatusColor = (itemId: string) => {
    if (itemId === "connection") {
      return isConnected
        ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
        : "bg-zinc-600";
    }
    return null;
  };

  return (
    <nav className="w-full lg:w-56 shrink-0">
      {/* Mobile: Horizontal scrollable nav */}
      <div className="lg:hidden">
        <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const statusColor = getStatusColor(item.id);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all duration-200 shrink-0 whitespace-nowrap",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
                  isActive
                    ? "bg-white/5 text-zinc-100"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "size-3.5 shrink-0 transition-colors",
                      isActive ? "text-cyan-400" : "text-zinc-500"
                    )}
                  />
                  {statusColor && (
                    <div
                      className={cn(
                        "absolute -top-0.5 -right-0.5 size-1.5 rounded-full border border-zinc-900",
                        statusColor
                      )}
                    />
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: Vertical sidebar */}
      <div className="sticky top-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent hidden lg:block">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const statusColor = getStatusColor(item.id);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 relative group",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900",
                  isActive
                    ? "bg-white/5 text-zinc-100"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="live-reactor-nav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                    style={{ willChange: "transform" }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 35,
                      mass: 0.8,
                    }}
                  />
                )}

                <div className="relative">
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isActive ? "text-cyan-400" : "text-zinc-500"
                    )}
                  />
                  {statusColor && (
                    <div
                      className={cn(
                        "absolute -top-0.5 -right-0.5 size-2 rounded-full border border-zinc-900",
                        statusColor
                      )}
                    />
                  )}
                </div>

                <span className="text-[13px] font-medium truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
