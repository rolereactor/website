"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, RefreshCcw, Home, Terminal } from "lucide-react";
import { Audiowide } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from "next/link";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white min-h-screen antialiased flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg group">
          {/* Glow Effects */}
          <div className="absolute -inset-1 rounded-3xl bg-linear-to-br from-red-500/20 via-transparent to-purple-500/20 blur-2xl opacity-60" />

          <Card className="relative overflow-hidden border-white/10 bg-zinc-950/90 backdrop-blur-2xl rounded-3xl shadow-2xl">
            {/* Cyberpunk Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-6 pointer-events-none opacity-20" />
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-red-500/50 to-transparent opacity-40" />

            <div className="relative z-10 flex flex-col items-center p-8 sm:p-12 text-center space-y-8">
              {/* Icon Group */}
              <div className="relative">
                <div className="absolute -inset-4 bg-red-500/20 blur-xl rounded-full animate-pulse" />
                <div className="relative h-20 w-20 rounded-2xl bg-linear-to-br from-red-500/15 to-transparent border border-red-500/30 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(239,68,68,0.4)]">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                  <div className="absolute -top-2 -right-2 h-6 w-6 rounded-md bg-zinc-900 border border-red-500/40 flex items-center justify-center">
                    <Terminal className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4 max-w-sm">
                <h1
                  className={cn(
                    "text-2xl sm:text-3xl font-black tracking-tight bg-linear-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent uppercase",
                    audiowide.className
                  )}
                >
                  System Fault
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed">
                  An unexpected core exception occurred. Safe mode initialized to protect session state.
                </p>
                {error.digest && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                    <span className="text-[10px] text-red-400/60 font-mono uppercase tracking-widest">
                      DIGEST:
                    </span>
                    <span className="text-[10px] text-red-400 font-mono">
                      {error.digest}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <Button
                  variant="destructive"
                  size="lg"
                  className="h-11 px-8 font-black uppercase tracking-widest text-[11px]"
                  onClick={reset}
                >
                  <RefreshCcw className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Re-initialize System
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-11 px-6 border-white/10 hover:border-cyan-500/40 font-black uppercase tracking-widest text-[11px]"
                >
                  <Link href="/">
                    <Home className="w-3.5 h-3.5 mr-2" />
                    Return Home
                  </Link>
                </Button>
              </div>

              {/* Footer */}
              <div className="pt-2 flex items-center gap-3 opacity-40">
                <div className="h-px w-12 bg-linear-to-r from-transparent to-red-500/40" />
                <span className="text-[9px] text-red-400 font-mono uppercase tracking-[0.3em]">
                  System Fault // Core Exception
                </span>
                <div className="h-px w-12 bg-linear-to-l from-transparent to-red-500/40" />
              </div>
            </div>
          </Card>
        </div>
      </body>
    </html>
  );
}
