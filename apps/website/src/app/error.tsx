"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Audiowide } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from "next/link";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center space-y-12">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-red-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
      </div>

      <div className="relative z-10 space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-red-500/10 rounded-full border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-12 h-12 text-red-500 animate-pulse" />
        </div>

        <div className="space-y-4">
          <h1
            className={cn(
              "text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic",
              audiowide.className
            )}
          >
            Fatal_Exception
          </h1>
          <div className="space-y-4">
            <p className="text-zinc-500 max-w-md mx-auto text-sm md:text-base leading-relaxed font-medium">
              The neural interface has experienced a complete breakdown. All
              systems have been put into safe mode.
            </p>
            {error.digest && (
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest bg-red-500/5 py-1 px-3 rounded border border-red-500/10 inline-block">
                Error Code: {error.digest}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={reset}
            size="lg"
            className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest px-8 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Attempt Recovery
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-white/10 hover:bg-white/5 text-zinc-400 font-black uppercase tracking-widest px-8"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Return Mainframe
            </Link>
          </Button>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 opacity-20 z-10">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">
          Hardware failure // Connection lost // Error_666
        </p>
      </div>
    </div>
  );
}
