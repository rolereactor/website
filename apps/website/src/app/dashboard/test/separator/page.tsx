"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { Showcase } from "@/components/ui/showcase";
import { Terminal, Activity, Zap, Cpu } from "lucide-react";

export default function SeparatorTestPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-widest uppercase italic font-audiowide">
          Neural Dividers
        </h1>
        <p className="text-zinc-400 max-w-3xl font-mono text-sm uppercase tracking-tight">
          {"//"} Circuit Isolation Frameworks.
        </p>
      </div>

      <Separator className="bg-white/10" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Showcase title="Module Isolation">
          <div className="w-full max-w-sm bg-zinc-950/60 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <Activity className="h-4 w-4 text-cyan-500 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold leading-none text-white font-mono uppercase tracking-wide flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-cyan-500" />
                Kernel_Node_01
              </h4>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">
                {"//"} Active Neural Thread
              </p>
            </div>

            <Separator className="my-6 bg-white/10" />

            <div className="flex h-5 items-center space-x-4 text-[10px] text-zinc-400 font-mono uppercase tracking-widest">
              <div className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1">
                <Zap className="h-3 w-3" /> Sync
              </div>
              <Separator orientation="vertical" className="bg-white/10 h-3" />
              <div className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1">
                <Activity className="h-3 w-3" /> Logs
              </div>
              <Separator orientation="vertical" className="bg-white/10 h-3" />
              <div className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1">
                <Cpu className="h-3 w-3" /> Core
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
              <div className="flex justify-between text-[8px] font-mono text-zinc-600">
                <span>PACKET_LOSS: 0%</span>
                <span>UPLINK: STABLE</span>
              </div>
            </div>
          </div>
        </Showcase>

        <Showcase
          title="Visual Rhythm"
          description="Subtle separation for complex telemetry."
        >
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <div className="h-12 bg-white/5 rounded-lg border border-white/5 flex items-center px-4 font-mono text-xs text-zinc-500">
              Row_Alpha
            </div>
            <Separator className="bg-linear-to-r from-transparent via-cyan-500/20 to-transparent h-px" />
            <div className="h-12 bg-white/5 rounded-lg border border-white/5 flex items-center px-4 font-mono text-xs text-zinc-500">
              Row_Beta
            </div>
            <Separator className="bg-linear-to-r from-transparent via-purple-500/20 to-transparent h-px" />
            <div className="h-12 bg-white/5 rounded-lg border border-white/5 flex items-center px-4 font-mono text-xs text-zinc-500">
              Row_Gamma
            </div>
          </div>
        </Showcase>
      </div>
    </div>
  );
}
