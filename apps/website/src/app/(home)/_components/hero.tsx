"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Audiowide } from "next/font/google";
import { FaDiscord, FaRocket, FaCheck } from "react-icons/fa";
import { ArrowRight, ShieldCheck, Zap as ZapIcon } from "lucide-react";
import { cn } from "fumadocs-ui/utils/cn";

import { Button } from "@/components/ui/button";
import { links } from "@/constants/links";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export function Hero() {
  const [botOnline, setBotOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function checkBotStatus() {
      try {
        const res = await fetch("/api/bot-status");
        if (!res.ok) {
          if (isMounted) setBotOnline(false);
          return;
        }
        const text = await res.text();
        const data = JSON.parse(text);
        if (isMounted) setBotOnline(data?.online ?? false);
      } catch {
        if (isMounted) setBotOnline(false);
      }
    }
    checkBotStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden -mt-16 pt-24 pb-12">
      {/* Clean mesh gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-zinc-950" />
        {/* Aurora glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-125 bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 left-1/4 w-100 h-100 bg-cyan-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-125 h-100 bg-purple-600/15 rounded-full blur-[100px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-2"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-5xl mx-auto flex flex-col items-center relative z-10 text-center space-y-8"
      >
        {/* Bot status pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              botOnline === null
                ? "bg-zinc-500 animate-pulse"
                : botOnline
                  ? "bg-emerald-500 shadow-[0_0_8px_var(--color-emerald-500)]"
                  : "bg-red-500 shadow-[0_0_8px_var(--color-red-500)]"
            )}
          />
          <span className="text-sm text-zinc-300 font-medium">
            {botOnline === null
              ? "Checking status..."
              : botOnline
                ? "Online and ready"
                : "Currently offline"}
          </span>
        </motion.div>

        {/* Main Title */}
        <h1
          className={cn(
            "text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight text-white",
            audiowide.className
          )}
        >
          Role{" "}
          <span className="bg-linear-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Reactor
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          The all-in-one Discord bot for role management, temporary roles, XP
          tracking, welcome systems, and more.
          <span className="text-zinc-300 font-medium">
            {" "}
            Free and easy to set up.
          </span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-2">
          <Button
            asChild
            size="lg"
            variant="discord"
            className="w-full sm:w-auto gap-2 h-13 px-10 min-w-52 group text-sm"
          >
            <Link
              href={links.inviteBot}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDiscord size={20} />
              <span>Add to Server</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto gap-2 h-13 px-10 min-w-52 group text-sm"
          >
            <Link href="/docs">
              <FaRocket className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
              <span>Documentation</span>
            </Link>
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-10 gap-y-3 pt-6 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <FaCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Free to use</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
            <span>Secure & trusted</span>
          </div>
          <div className="flex items-center gap-2">
            <ZapIcon className="w-3.5 h-3.5 text-zinc-500" />
            <span>Instant setup</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
