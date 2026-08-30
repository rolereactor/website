"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, RefreshCcw, Home, Terminal } from "lucide-react";
import { Audiowide } from "next/font/google"; // Using direct import for consistency
import { cn } from "@/lib/utils";
import Link from "next/link";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface ErrorViewProps {
  title?: string;
  message?: string;
  errorId?: string;
  onRetry?: () => void;
  showHome?: boolean;
  className?: string; // Additional classes for positioning if needed
}

export function ErrorView({
  title = "Unexpected Error",
  message = "The dashboard encountered an unexpected issue. Please try reloading the page or return to the main dashboard.",
  errorId,
  onRetry,
  showHome = true,
  className,
}: ErrorViewProps) {
  return (
    <div
      className={cn(
        "flex min-h-100 w-full items-center justify-center p-4",
        className
      )}
    >
      <div className="relative w-full max-w-lg group">
        {/* Glow Effects */}
        <div className="absolute -inset-1 rounded-2xl bg-linear-to-br from-red-500/20 via-transparent to-purple-500/20 blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-1000" />

        <Card className="relative overflow-hidden border-white/5 bg-black/80 backdrop-blur-xl">
          {/* Cyberpunk Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-6 pointer-events-none opacity-20" />
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-red-500/50 to-transparent opacity-30" />

          <div className="relative z-10 flex flex-col items-center p-8 sm:p-12 text-center space-y-8">
            {/* Icon Group */}
            <div className="relative">
              <div className="absolute -inset-4 bg-red-500/20 blur-xl rounded-full animate-pulse" />
              <div className="relative h-20 w-20 rounded-2xl bg-linear-to-br from-red-500/10 to-transparent border border-red-500/20 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(220,38,38,0.3)]">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-md bg-zinc-900 border border-red-500/30 flex items-center justify-center">
                  <Terminal className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 max-w-sm">
              <h2
                className={cn(
                  "text-2xl font-black text-white uppercase tracking-widest",
                  audiowide.className
                )}
              >
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed">
                {message}
              </p>
              {errorId && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/5 rounded-full border border-red-500/10">
                  <span className="text-[10px] text-red-500/50 font-mono uppercase tracking-widest">
                    CODE:
                  </span>
                  <span className="text-[10px] text-red-400 font-mono">
                    {errorId}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {showHome && (
                <Button
                  asChild
                  variant="outline"
                  className="h-11 px-8 border-white/5 hover:bg-white/5 text-zinc-400 font-black uppercase tracking-widest text-[10px]"
                >
                  <Link href="/dashboard">
                    <Home className="w-3.5 h-3.5 mr-2" />
                    Return
                  </Link>
                </Button>
              )}
              {onRetry && (
                <Button
                  variant="destructive"
                  className="h-11 px-8 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_-5px_rgba(220,38,38,0.4)]"
                  onClick={onRetry}
                >
                  <RefreshCcw className="w-3.5 h-3.5 mr-2" />
                  Try Again
                </Button>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 flex items-center gap-3 opacity-50">
              <div className="h-px w-12 bg-linear-to-r from-transparent to-red-500/30" />
              <span className="text-[9px] text-red-500/70 font-mono uppercase tracking-[0.3em]">
                System Alert
              </span>
              <div className="h-px w-12 bg-linear-to-l from-transparent to-red-500/30" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
