"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Showcase } from "@/components/ui/showcase";
import { Separator } from "@/components/ui/separator";
import { Globe, Cpu, Database } from "lucide-react";

export default function SelectTestPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-widest uppercase italic font-audiowide">
          Uplink Select
        </h1>
        <p className="text-zinc-400 max-w-3xl font-mono text-sm uppercase tracking-tight">
          {"//"} Neural node targeting system.
        </p>
      </div>

      <Separator className="bg-white/10" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Showcase title="Node Hub">
          <div className="flex flex-col gap-6 w-full items-center">
            <Select>
              <SelectTrigger className="w-full max-w-60 font-mono text-xs uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 text-cyan-500" />
                  <SelectValue placeholder="Primary Source" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="font-mono text-xs uppercase text-zinc-500">
                    Local Servers
                  </SelectLabel>
                  <SelectItem value="apple">Silicon_V1</SelectItem>
                  <SelectItem value="banana">Carbon_X2</SelectItem>
                  <SelectItem value="blueberry">Neon_Grid</SelectItem>
                  <SelectItem value="grapes">Shadow_Host</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select defaultValue="cpu-core">
              <SelectTrigger className="w-full max-w-60 font-mono text-xs uppercase tracking-widest border-purple-500/20 bg-purple-500/5 text-purple-300">
                <div className="flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-purple-400" />
                  <SelectValue placeholder="Target CPU" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpu-core">Kernel_Zero</SelectItem>
                <SelectItem value="cpu-alpha">Alpha_Drive</SelectItem>
                <SelectItem value="cpu-beta">Beta_Sync</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Showcase>

        <Showcase title="Global Relay">
          <Select>
            <SelectTrigger className="w-full max-w-75 font-mono text-xs uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-emerald-500" />
                <SelectValue placeholder="Relay Zone" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="font-mono text-[10px] uppercase text-zinc-500">
                  Sector: West
                </SelectLabel>
                <SelectItem value="est">NYC_GRID (EST)</SelectItem>
                <SelectItem value="cst">CHI_NODE (CST)</SelectItem>
                <SelectItem value="pst">SF_RELAY (PST)</SelectItem>
              </SelectGroup>
              <SelectSeparator className="bg-white/5" />
              <SelectGroup>
                <SelectLabel className="font-mono text-[10px] uppercase text-zinc-500">
                  Sector: East
                </SelectLabel>
                <SelectItem value="gmt">LDN_HUB (GMT)</SelectItem>
                <SelectItem value="cet">PARIS_PX (CET)</SelectItem>
                <SelectItem value="tokyo">TYO_SYNC (JST)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Showcase>
      </div>
    </div>
  );
}
