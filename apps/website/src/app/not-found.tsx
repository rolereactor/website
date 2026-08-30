"use client";

import Link from "next/link";
import Image from "next/image";
import { Audiowide } from "next/font/google";
import { motion } from "motion/react";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export default function NotFound() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 bg-zinc-950 overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Image
            src="/logo.png"
            width={80}
            height={80}
            alt="Role Reactor"
            className="drop-shadow-2xl rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-3"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <h1
            className={`text-8xl md:text-9xl font-black tracking-tighter mb-4 bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent ${audiowide.className}`}
          >
            404
          </h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Search className="w-5 h-5 text-zinc-500" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Page Not Found
            </h2>
          </div>
          <p className="text-zinc-400 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist or has been moved to
            another location.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex justify-center"
        >
          <Button
            asChild
            size="lg"
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl shadow-lg shadow-[#5865F2]/20 transition-all group"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 flex items-center gap-6 text-xs text-zinc-600 font-bold uppercase tracking-widest"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Error
          </div>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            404
          </div>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            Not Found
          </div>
        </motion.div>
      </div>
    </main>
  );
}
