"use client";

import React from "react";
import { UserMenu } from "@/components/ui/user-menu";
import { Showcase } from "@/components/ui/showcase";
import { Separator } from "@/components/ui/separator";

export default function UserMenuTestPage() {
  const mockUser = {
    id: "123",
    name: "Cyberpunk User",
    email: "user@cyberpunk.com",
    image: "https://github.com/shadcn.png",
  };

  return (
    <div className="relative space-y-6 w-full overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-cyan-500/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-purple-500/5 blur-[120px] -z-10 pointer-events-none" />

      <div className="space-y-4 relative">
        <div className="absolute -left-4 top-0 w-1 h-full bg-linear-to-b from-cyan-500 via-purple-500 to-transparent opacity-50" />
        <h1 className="text-6xl font-black text-white tracking-[0.2em] uppercase italic drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          User <span className="text-cyan-400">Menu</span>
        </h1>
        <p className="text-zinc-500 text-sm max-w-2xl font-mono leading-relaxed">
          Official documentation and showcase for the UserMenu component across
          its various states, variants, and integrated balance displays.
        </p>
      </div>

      <Separator className="bg-white/5 shadow-[0_1px_0_rgba(255,255,255,0.02)]" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Showcase
          title="Header Variant"
          description="Standard top-nav integration with balanced profile and core data display."
        >
          <div className="w-full bg-black/60 border border-white/5 p-4 flex justify-between items-center shadow-2xl relative group/header">
            {/* Tech scanline for the mock header */}
            <div className="absolute inset-0 bg-linear-to-r from-cyan-500/5 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-1000" />

            {/* Mock Header Left */}
            <div className="flex items-center gap-6 z-10 transition-transform duration-500 group-hover/header:translate-x-1">
              <div className="h-6 w-6 rounded-sm bg-cyan-500/20 ring-1 ring-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse" />
              <div className="hidden md:flex flex-col gap-0.5 font-mono">
                <span className="text-[10px] text-cyan-400 font-bold tracking-[0.2em]">
                  DASHBOARD_OS
                </span>
                <span className="text-[8px] text-zinc-600 uppercase">
                  / settings / profile_v2
                </span>
              </div>
            </div>

            <UserMenu
              user={mockUser}
              status="authenticated"
              variant="header"
              showCoreBalance={true}
            />
          </div>
        </Showcase>

        <Showcase
          title="Sidebar Variant"
          description="Detailed sidebar integration. Profile data module with upward-expansion functionality."
          className="justify-end"
        >
          <div className="w-80 h-85 border border-white/10 bg-zinc-950/80 flex flex-col justify-end p-3 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group/sidebar">
            {/* Grid overlay for sidebar */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />

            {/* Mock Sidebar Navigation */}
            <div className="absolute inset-x-0 top-0 p-6 space-y-5 opacity-40 group-hover/sidebar:opacity-60 transition-opacity duration-500">
              <div className="flex items-center gap-4">
                <div className="h-4 w-4 rounded-sm bg-white/10 ring-1 ring-white/5" />
                <div className="h-2 w-32 bg-white/10 rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-4 rounded-sm bg-cyan-500/20 ring-1 ring-cyan-500/40" />
                <div className="h-2 w-40 bg-cyan-500/20 rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-4 rounded-sm bg-white/10 ring-1 ring-white/5" />
                <div className="h-2 w-24 bg-white/10 rounded-full" />
              </div>
              <div className="h-px bg-linear-to-r from-white/10 via-white/5 to-transparent my-4" />
              <div className="flex items-center gap-4">
                <div className="h-4 w-4 rounded-sm bg-purple-500/20 ring-1 ring-purple-500/40" />
                <div className="h-2 w-36 bg-purple-500/20 rounded-full" />
              </div>
            </div>

            <UserMenu
              user={mockUser}
              status="authenticated"
              variant="sidebar"
              showCoreBalance={false}
              side="top"
              align="center"
              className="z-10"
            />
          </div>
        </Showcase>

        <Showcase
          title="Loading State"
          description="Skeleton loading states for user data initialization and session mounting."
        >
          <div className="flex flex-col gap-6 w-full max-w-md p-4">
            <div className="flex items-center justify-between w-full p-4 bg-zinc-900/40 border border-white/5 relative overflow-hidden group/item">
              <div className="absolute inset-0 bg-linear-to-r from-cyan-500/5 to-transparent" />
              <div className="absolute top-0 left-0 w-0.5 h-full bg-cyan-500/40 animate-pulse" />
              <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.3em] font-bold">
                SESSION // LOADING
              </span>
              <UserMenu user={null} status="loading" variant="header" />
            </div>

            <div className="w-full border border-white/10 bg-zinc-950 p-2 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 opacity-20">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping" />
              </div>
              <span className="text-[9px] text-zinc-500 font-mono px-2 mb-3 block uppercase tracking-widest border-b border-white/5 pb-2">
                &gt; fetching_user_session...
              </span>
              <UserMenu user={null} status="loading" variant="sidebar" />
            </div>
          </div>
        </Showcase>

        <Showcase
          title="Unauthenticated"
          description="State shown when no active session is detected. Prompts user for login."
        >
          <div className="flex flex-col items-center justify-center p-14 gap-8 relative group/denied w-full overflow-hidden">
            {/* Red alert overlay */}
            <div className="absolute inset-0 bg-red-500/5 border border-red-500/10 group-hover/denied:bg-red-500/10 group-hover/denied:border-red-500/30 transition-all duration-700" />

            {/* Animated alert lines */}
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-red-500/30 to-transparent group-hover/denied:animate-scanline" />

            <div className="flex flex-col items-center gap-2 z-10">
              <div className="flex gap-1 mb-1">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse [animation-delay:200ms]" />
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse [animation-delay:400ms]" />
              </div>
              <div className="text-red-500/60 font-mono text-[11px] font-black uppercase tracking-[0.4em] drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                LOGIN_REQUIRED
              </div>
            </div>

            <UserMenu
              user={mockUser}
              status="unauthenticated"
              className="z-10 scale-110"
            />

            <div className="mt-4 px-3 py-1 bg-red-500/10 border border-red-500/20 text-[8px] text-red-400 font-mono uppercase tracking-widest opacity-0 group-hover/denied:opacity-100 transition-opacity">
              SESSION_TERMINATED
            </div>
          </div>
        </Showcase>
      </div>
    </div>
  );
}
