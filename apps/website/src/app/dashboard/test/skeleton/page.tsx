"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Showcase } from "@/components/ui/showcase";
import { Separator } from "@/components/ui/separator";

export default function SkeletonTestPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-widest uppercase italic font-audiowide">
          Neural Ghosting
        </h1>
        <p className="text-zinc-400 max-w-3xl font-mono text-sm uppercase tracking-tight">
          {"//"} Structural pre-visualization modules.
        </p>
      </div>

      <Separator className="bg-white/10" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Showcase title="Data Profile">
          <div className="flex items-center space-x-4 w-full justify-center">
            <Skeleton className="h-12 w-12 rounded-full border border-white/5" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-62.5 border border-white/5" />
              <Skeleton className="h-4 w-50 border border-white/5" />
            </div>
          </div>
        </Showcase>

        <Showcase title="Information Shell">
          <div className="flex flex-col space-y-3 w-full items-center">
            <Skeleton className="h-31.25 w-62.5 rounded-2xl border border-white/5" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-62.5 border border-white/5" />
              <Skeleton className="h-4 w-50 border border-white/5" />
            </div>
          </div>
        </Showcase>

        <Showcase title="Grid Reconstruction">
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-20 rounded-xl border border-white/5"
              />
            ))}
          </div>
        </Showcase>
      </div>
    </div>
  );
}
