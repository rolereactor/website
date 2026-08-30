"use client";

import { useState, useEffect, useRef } from "react";
import {
  Cable,
  Settings,
  Terminal,
  MessageSquareQuote,
  Timer,
  Activity,
  Shield,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

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
  isLive?: boolean;
}

export function LiveReactorNav({
  activeTab,
  onTabChange,
  isConnected,
  isLive = false,
}: LiveReactorNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentItem = navItems.find((item) => item.id === activeTab) || navItems[0];
  const CurrentIcon = currentItem.icon;

  const getStatusColor = (itemId: string) => {
    if (itemId === "connection") {
      if (isLive)
        return "bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.6)]";
      return isConnected
        ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
        : "bg-zinc-600";
    }
    return null;
  };

  return (
    <nav className="w-full lg:w-56 shrink-0">
      {/* Mobile: Cyberpunk Select Dropdown */}
      <div className="lg:hidden relative mb-4" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
            "bg-zinc-950/90 backdrop-blur-xl border shadow-[0_0_20px_-4px_rgba(6,182,212,0.15)]",
            isOpen
              ? "border-cyan-500/50 text-white shadow-[0_0_25px_-2px_rgba(6,182,212,0.3)]"
              : "border-cyan-500/25 text-zinc-200 hover:border-cyan-500/40"
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center size-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
              <CurrentIcon className="size-4" />
            </div>
            <div className="flex items-center gap-2 truncate text-left">
              <span className="text-sm font-semibold tracking-wide truncate">
                {currentItem.label}
              </span>
              {activeTab === "connection" && isLive && (
                <span className="text-[9px] font-extrabold text-red-400 tracking-widest uppercase bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/40 shrink-0">
                  LIVE
                </span>
              )}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "size-4 text-cyan-400 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 4, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full z-50 p-1.5 rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_12px_40px_-5px_rgba(0,0,0,0.85),0_0_25px_-5px_rgba(6,182,212,0.25)] space-y-1 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800"
            >
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const statusColor = getStatusColor(item.id);
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 relative group",
                      isActive
                        ? "bg-cyan-500/15 text-cyan-200 border-l-2 border-cyan-400 font-semibold"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            isActive ? "text-cyan-400" : "text-zinc-500 group-hover:text-zinc-300"
                          )}
                        />
                        {statusColor && (
                          <div
                            className={cn(
                              "absolute -top-0.5 -right-0.5 size-1.5 rounded-full border border-zinc-950",
                              statusColor
                            )}
                          />
                        )}
                      </div>
                      <span className="text-xs font-medium truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.id === "connection" && isLive && (
                        <span className="text-[9px] font-extrabold text-red-400 tracking-widest uppercase bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/30">
                          LIVE
                        </span>
                      )}
                      {isActive && <Check className="size-4 text-cyan-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
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

                <span className="text-[13px] font-medium truncate flex-1">
                  {item.label}
                </span>

                {item.id === "connection" && isLive && (
                  <span className="text-[10px] font-bold text-red-400 tracking-widest uppercase shrink-0">
                    Live
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
