"use client";

import { MonitorPlay } from "lucide-react";

import { OverlayUrlGenerator } from "@/app/dashboard/[guildId]/_components/overlay-url-generator";

interface OverlaysPanelProps {
  guildId: string;
}

export function OverlaysPanel({ guildId }: OverlaysPanelProps) {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <MonitorPlay className="size-4 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Stream Overlays</h2>
          <p className="text-xs text-zinc-500">
            Add live overlays to your stream — pick a widget, choose a theme,
            and paste the URL into OBS, Streamlabs, or any software with
            browser-source support.
          </p>
        </div>
      </div>

      <OverlayUrlGenerator guildId={guildId} />
    </div>
  );
}
