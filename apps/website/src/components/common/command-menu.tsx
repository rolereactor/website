"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Radio,
  Settings,
  Terminal,
  Activity,
  Layers,
  Image as ImageIcon,
  Sparkles,
  User,
  Search,
  Server,
  Command,
} from "lucide-react";
import { useServerStore } from "@/store/use-server-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  category: "navigation" | "tools" | "admin";
  badge?: string;
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { guilds, lastActiveGuildId } = useServerStore();

  const activeGuildId = lastActiveGuildId || guilds[0]?.id || "";

  // Keyboard shortcut listener (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const serverActions: CommandItem[] = activeGuildId
    ? [
        {
          id: "overview",
          title: "Server Overview",
          description: "Guild overview metrics and control modules",
          icon: Layers,
          href: `/dashboard/${activeGuildId}`,
          category: "navigation",
        },
        {
          id: "roles",
          title: "Reaction Roles",
          description: "Configure button & emoji role assignment",
          icon: Settings,
          href: `/dashboard/${activeGuildId}/roles`,
          category: "tools",
        },
        {
          id: "welcome",
          title: "Welcome System",
          description: "Automatic greetings and member onboarding",
          icon: User,
          href: `/dashboard/${activeGuildId}/welcome`,
          category: "tools",
        },
        {
          id: "xp",
          title: "XP & Leveling",
          description: "Member leveling, roles & leaderboards",
          icon: Sparkles,
          href: `/dashboard/${activeGuildId}/xp`,
          category: "tools",
        },
        {
          id: "live-reactor",
          title: "Live Reactor",
          description: "Twitch stream alerts, notifications & chat bot",
          icon: Radio,
          href: `/dashboard/${activeGuildId}/live-reactor`,
          category: "tools",
          badge: "PRO",
        },
        {
          id: "commands",
          title: "Command Settings",
          description: "Custom server prefixes and command toggles",
          icon: Terminal,
          href: `/dashboard/${activeGuildId}/commands`,
          category: "tools",
        },
        {
          id: "analytics",
          title: "Server Analytics",
          description: "Member growth trends & activity stats",
          icon: Activity,
          href: `/dashboard/${activeGuildId}/analytics`,
          category: "tools",
        },
      ]
    : [];

  const globalTools: CommandItem[] = [
    {
      id: "image-tools",
      title: "Image Tools",
      description: "Welcome banners, rank cards, meme maker & upscaler",
      icon: ImageIcon,
      href: "/dashboard/image-tools",
      category: "tools",
    },
    {
      id: "health",
      title: "System Health & Diagnostics",
      description: "Bot cluster status, shard connectivity, and node health",
      icon: Activity,
      href: "/dashboard/health",
      category: "admin",
    },
    {
      id: "profile",
      title: "Profile & Account",
      description: "Manage subscription, API keys, and notification preferences",
      icon: User,
      href: "/dashboard/profile",
      category: "navigation",
    },
  ];

  const filterCmds = (list: CommandItem[]) =>
    list.filter(
      (c) =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase())
    );

  const filteredServerActions = filterCmds(serverActions);
  const filteredGlobalTools = filterCmds(globalTools);

  const filteredGuilds = guilds.filter((g) =>
    (g.name || "").toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        variant="glitch"
        hideClose
        className="max-w-[calc(100vw-2rem)] sm:max-w-xl p-0"
      >
        <DialogHeader className="sr-only">
          <DialogTitle variant="glitch">Command Palette</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-cyan-500/30 bg-zinc-950/80 shadow-[0_0_20px_-4px_rgba(6,182,212,0.2)] focus-within:border-cyan-500/60 focus-within:shadow-[0_0_25px_-2px_rgba(6,182,212,0.35)] transition-all">
            <Search className="w-4 h-4 text-cyan-400 shrink-0" />
            <input
              type="text"
              placeholder="Type a command, tool, or server name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none text-sm text-zinc-100 placeholder:text-zinc-500 font-medium p-0 m-0 h-auto"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/30 shrink-0">
              ESC
            </kbd>
          </div>

          {/* Results Area */}
          <div className="max-h-80 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 pr-1">
            {/* Server Actions */}
            {filteredServerActions.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/70 px-2 py-1 flex items-center justify-between">
                  <span>Current Server Actions</span>
                  <span className="text-[9px] text-zinc-600 font-sans">Active Server</span>
                </p>
                {filteredServerActions.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd.href)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 group hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center justify-center size-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:border-cyan-500/40 shrink-0">
                          <Icon className="size-4" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-300">
                              {cmd.title}
                            </span>
                            {cmd.badge && (
                              <Badge className="text-[9px] h-3.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-1">
                                {cmd.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 truncate">
                            {cmd.description}
                          </p>
                        </div>
                      </div>
                      <Command className="w-3.5 h-3.5 text-zinc-600 group-hover:text-cyan-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Global Tools */}
            {filteredGlobalTools.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 px-2 py-1">
                  Global Tools & Account
                </p>
                {filteredGlobalTools.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd.href)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 group hover:bg-white/5 border border-transparent"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-800 border border-white/10 text-zinc-300 group-hover:text-white shrink-0">
                          <Icon className="size-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                            {cmd.title}
                          </span>
                          <p className="text-[11px] text-zinc-500 truncate">
                            {cmd.description}
                          </p>
                        </div>
                      </div>
                      <Command className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Manageable Servers */}
            {filteredGuilds.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-purple-400/70 px-2 py-1 flex items-center justify-between">
                  <span>Switch Servers</span>
                  <span className="text-[9px] text-zinc-600 font-sans">1-Click Jump</span>
                </p>
                {filteredGuilds.slice(0, 5).map((guild) => (
                  <button
                    key={guild.id}
                    onClick={() => handleSelect(`/dashboard/${guild.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 group hover:bg-purple-500/10 hover:border-purple-500/30 border border-transparent"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center size-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                        <Server className="size-4" />
                      </div>
                      <span className="text-xs font-medium text-zinc-300 group-hover:text-purple-300 truncate">
                        {guild.name}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-purple-400/80 border-purple-500/30">
                      Switch Server
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {filteredServerActions.length === 0 &&
              filteredGlobalTools.length === 0 &&
              filteredGuilds.length === 0 && (
                <div className="text-center py-8 text-xs text-zinc-500">
                  No actions or servers matching &quot;{query}&quot;
                </div>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
