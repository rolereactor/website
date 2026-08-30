"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Showcase } from "@/components/ui/showcase";
import { Separator } from "@/components/ui/separator";
import { Power, Zap, Moon, Plane } from "lucide-react";

export default function SwitchTestPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-widest uppercase italic font-audiowide">
          Logic Gates
        </h1>
        <p className="text-zinc-400 max-w-3xl font-mono text-sm uppercase tracking-tight">
          {"//"} High-impedance binary state toggles.
        </p>
      </div>

      <Separator className="bg-white/10" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Showcase title="Binary Toggles">
          <div className="flex flex-col gap-8 w-full items-center">
            <div className="flex items-center justify-between w-full max-w-60 p-4 bg-zinc-950/40 border border-white/5 rounded-2xl group transition-all hover:border-cyan-500/30">
              <div className="flex items-center gap-3">
                <Plane className="h-4 w-4 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                <Label
                  htmlFor="airplane-mode"
                  className="font-mono text-xs uppercase cursor-pointer"
                >
                  Stealth_Link
                </Label>
              </div>
              <Switch id="airplane-mode" />
            </div>

            <div className="flex items-center justify-between w-full max-w-60 p-4 bg-zinc-950/40 border border-white/5 rounded-2xl group transition-all hover:border-purple-500/30">
              <div className="flex items-center gap-3">
                <Moon className="h-4 w-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                <Label
                  htmlFor="dark-mode"
                  className="font-mono text-xs uppercase cursor-pointer"
                >
                  Shadow_Filter
                </Label>
              </div>
              <Switch id="dark-mode" defaultChecked />
            </div>

            <div className="flex items-center justify-between w-full max-w-60 p-4 bg-zinc-950/40 border border-white/5 rounded-2xl group transition-all hover:border-emerald-500/30">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                <Label
                  htmlFor="power-save"
                  className="font-mono text-xs uppercase cursor-pointer"
                >
                  Auto_Throttling
                </Label>
              </div>
              <Switch id="power-save" />
            </div>
          </div>
        </Showcase>

        <Showcase
          title="Access Status"
          description="Locked or restricted logic branches."
        >
          <div className="flex flex-col gap-8 w-full items-center opacity-70">
            <div className="flex items-center justify-between w-full max-w-60 p-4 bg-zinc-950/20 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <Power className="h-4 w-4 text-zinc-700" />
                <Label
                  htmlFor="disabled"
                  className="font-mono text-xs uppercase text-zinc-600"
                >
                  Core_Offline
                </Label>
              </div>
              <Switch id="disabled" disabled />
            </div>

            <div className="flex items-center justify-between w-full max-w-60 p-4 bg-zinc-950/20 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <Power className="h-4 w-4 text-emerald-900" />
                <Label
                  htmlFor="disabled-checked"
                  className="font-mono text-xs uppercase text-emerald-900"
                >
                  Force_Bypass
                </Label>
              </div>
              <Switch id="disabled-checked" disabled defaultChecked />
            </div>
          </div>
        </Showcase>
      </div>
    </div>
  );
}
