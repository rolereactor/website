"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ShowcaseProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function Showcase({
  className,
  children,
  title,
  description,
  ...props
}: ShowcaseProps) {
  const [displayId, setDisplayId] = React.useState("-------");

  React.useEffect(() => {
    setDisplayId(Math.random().toString(36).substring(2, 9).toUpperCase());
  }, []);

  return (
    <div className="group flex flex-col h-full space-y-4">
      <div className="flex items-end justify-between px-2 shrink-0">
        <div className="space-y-1">
          {title && (
            <h3 className="text-xl font-black text-white tracking-tighter uppercase italic group-hover:text-cyan-400 transition-colors">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-zinc-500 font-mono tracking-tight leading-none uppercase">
              {"//"} {description}
            </p>
          )}
        </div>
        <div className="text-[10px] font-mono text-zinc-700 hidden sm:block">
          REF_ID: <span className="text-zinc-500">{displayId}</span>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col">
        {/* Tech Accents - Corners */}
        <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-sm z-10 group-hover:border-cyan-500/60 transition-colors" />
        <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-white/10 rounded-tr-sm z-10" />
        <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-white/10 rounded-bl-sm z-10" />
        <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-purple-500/30 rounded-br-sm z-10 group-hover:border-purple-500/60 transition-colors" />

        {/* Data Grid Background */}
        <div
          className={cn(
            "relative flex-1 p-8 rounded-sm border border-white/5 bg-zinc-950/40 backdrop-blur-xl flex flex-col items-center justify-center gap-4 min-h-75 transition-all duration-500 group-hover:bg-zinc-950/60",
            className
          )}
          {...props}
        >
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-3 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent via-white/5 to-transparent h-2 w-full -translate-y-full group-hover:animate-scanline" />

          <div className="relative z-20 w-full flex flex-col items-center justify-center">
            {children}
          </div>

          {/* Diagnostic Label */}
          <div className="absolute bottom-2 left-2 flex gap-2">
            <div className="w-1 h-1 bg-cyan-500/40 animate-pulse" />
            <div className="w-1 h-1 bg-cyan-500/20" />
            <div className="w-1 h-1 bg-cyan-500/10" />
            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
              Diagnostic_active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
