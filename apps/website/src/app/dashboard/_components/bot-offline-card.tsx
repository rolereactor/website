"use client";

import Link from "next/link";
import Image from "next/image";
import { Audiowide } from "next/font/google";
import { motion } from "motion/react";
import { LayoutDashboard, WifiOff, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export function BotOfflineCard() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[80vh] text-center px-4 overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-red-600 to-orange-600 opacity-30 blur-lg" />
            <Image
              src="/logo.png"
              width={80}
              height={80}
              alt="Role Reactor"
              className="relative drop-shadow-2xl rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-sm p-3"
              priority
            />
            <div className="absolute -bottom-2 -right-2 bg-zinc-900 text-red-500 p-1.5 rounded-full border-2 border-zinc-800 shadow-lg">
              <WifiOff className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 space-y-4"
        >
          <h1
            className={`text-5xl md:text-7xl font-black tracking-tighter bg-linear-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent ${audiowide.className}`}
          >
            OFFLINE
          </h1>

          <p className="text-zinc-400 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            The bot service is currently unreachable. Dashboard data and server
            management are temporarily unavailable.
          </p>

          <p className="text-zinc-600 text-sm">
            This is usually temporary. Please try again in a few minutes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="h-12 border border-white/10 hover:bg-white/5 text-zinc-300 font-bold rounded-xl"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>

          <Button
            size="lg"
            onClick={() => router.refresh()}
            className="h-12 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 px-8"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 flex items-center gap-6 text-[10px] md:text-xs text-zinc-600 font-bold uppercase tracking-widest"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Offline
          </div>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            Retrying
          </div>
        </motion.div>
      </div>
    </div>
  );
}
