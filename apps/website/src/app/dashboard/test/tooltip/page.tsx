"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Showcase } from "@/components/ui/showcase";
import { Separator } from "@/components/ui/separator";
import { Plus, Terminal, Info, Zap } from "lucide-react";

export default function TooltipTestPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-widest uppercase italic font-audiowide">
          Neural Hints
        </h1>
        <p className="text-zinc-400 max-w-3xl font-mono text-sm uppercase tracking-tight">
          {"//"} Transient sensory data overlays.
        </p>
      </div>

      <Separator className="bg-white/10" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Showcase title="Data Protocol">
          <div className="flex flex-col items-center gap-8 w-full">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl group hover:border-cyan-500/40 transition-all"
                  >
                    <Plus className="h-5 w-5 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                    <span className="sr-only">Add</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="font-mono text-[10px] uppercase">
                  <p>Initialize_New_Link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex gap-4">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="font-mono text-[10px] uppercase tracking-widest"
                    >
                      Instant_Ping
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="border-cyan-500/20 bg-cyan-950/80 text-cyan-400 font-mono text-[9px]"
                  >
                    <p>{"//"} Low Latency Response</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="font-mono text-[10px] uppercase tracking-widest"
                    >
                      Delayed_Sync
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="border-purple-500/20 bg-purple-950/80 text-purple-400 font-mono text-[9px]"
                  >
                    <p>Standard buffering interval.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </Showcase>

        <Showcase title="Telemetry Context">
          <div className="p-6 border border-white/5 bg-zinc-950/40 rounded-2xl flex flex-col gap-6 w-full max-w-xs items-center">
            <div className="flex items-center gap-3 w-full p-3 bg-zinc-950/60 border border-white/5 rounded-xl">
              <Terminal className="h-4 w-4 text-emerald-500" />
              <span className="font-mono text-[10px] text-zinc-500 uppercase flex-1">
                Status: Operational
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-zinc-700 hover:text-cyan-500 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-45 font-mono text-[9px] uppercase leading-relaxed">
                    Neural kernels are synchronized at 99.8% efficiency.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-3 w-full p-3 bg-zinc-950/60 border border-white/5 rounded-xl">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="font-mono text-[10px] text-zinc-500 uppercase flex-1">
                Load: 12%
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-zinc-700 hover:text-cyan-500 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-45 font-mono text-[9px] uppercase leading-relaxed">
                    Current power consumption is within safety parameters.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </Showcase>
      </div>
    </div>
  );
}
