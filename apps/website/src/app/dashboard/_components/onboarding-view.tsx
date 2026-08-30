"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Audiowide } from "next/font/google";
import { FaDiscord } from "react-icons/fa";
import { CyberpunkBackground } from "@/components/common/cyberpunk-background";
import { links } from "@/constants/links";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface OnboardingViewProps {
  inviteUrl: string;
}

export function OnboardingView({ inviteUrl }: OnboardingViewProps) {
  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Onboarding Hero - Fluid Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[1.5rem] sm:rounded-4xl overflow-hidden border border-white/10 bg-zinc-950/50 shadow-2xl min-h-95 sm:min-h-105 flex items-center group"
      >
        {/* Cinematic Background Layer */}
        <div className="absolute inset-0 z-0 select-none">
          <div className="absolute inset-0 bg-linear-to-b from-zinc-950 via-transparent to-zinc-950/90 z-10" />
          <div className="absolute inset-0 bg-linear-to-r from-zinc-950 via-zinc-950/40 to-transparent z-10" />

          {/* Main Hero Illustration */}
          <div
            className="absolute inset-0 scale-100 opacity-60 group-hover:opacity-80 transition-all duration-1000 ease-in-out"
            style={{
              backgroundImage: `url('/images/onboarding-hero-v4.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <CyberpunkBackground
            gridSize={42}
            gridOpacity={0.04}
            gridColor="#3b82f6"
            showGlows={true}
            showNoise={true}
            showScanlines={true}
            showGlitchLines={true}
            showFlicker={true}
            primaryGlow="rgba(59, 130, 246, 0.12)"
            secondaryGlow="rgba(168, 85, 247, 0.08)"
          />
        </div>

        <CardContent className="relative z-50 p-6 sm:p-12 flex flex-col items-center lg:items-start text-center lg:text-left w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex items-center gap-4"
          >
            <Badge
              variant="pro"
              className="px-3 py-1 sm:px-4 sm:py-1.5 gap-1.5 sm:gap-2 text-[10px] sm:text-xs backdrop-blur-2xl border-white/10 ring-1 ring-blue-500/20"
            >
              <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,1)] animate-pulse" />
              SYSTEMS ONLINE
            </Badge>
            <div className="h-px w-12 bg-zinc-800 hidden lg:block" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 hidden lg:block font-mono">
              CONNECTION_ESTABLISHED
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <h1
              className={cn(
                "text-xl xs:text-2xl sm:text-5xl md:text-6xl font-black leading-[1.1] sm:leading-[0.9] mb-4 text-white tracking-tighter",
                audiowide.className
              )}
            >
              IGNITE THE <br />
              <span className="relative inline-block bg-linear-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,211,238,0.4)] py-1">
                COMMUNITY
                <div className="absolute -bottom-1 left-0 w-full h-px sm:h-0.75 bg-cyan-500/20 rounded-full blur-[2px]" />
                <div className="absolute -bottom-1 left-0 w-2/3 h-px sm:h-0.75 bg-cyan-400 shadow-[0_0_15px_#22d3ee] rounded-full" />
              </span>
            </h1>
          </motion.div>

          <p className="text-zinc-400 text-xs sm:text-lg mb-8 max-w-xl leading-relaxed font-medium">
            Elevate your Discord experience with advanced{" "}
            <span className="text-blue-400 font-bold">role automation</span>.
            Bridge the gap between your members and their identity.
          </p>

          <div className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
            <Button
              asChild
              variant="glitch"
              data-text="ADD TO SERVER"
              className="rounded-lg px-4 sm:px-7 h-9 sm:h-11 text-[8px] sm:text-xs shadow-[0_0_20px_rgba(59,130,246,0.1)] border border-blue-400/20 group w-full xs:w-auto"
            >
              <a
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 sm:gap-2.5"
              >
                <FaDiscord
                  size={14}
                  className="group-hover:scale-110 transition-transform"
                />
                ADD TO SERVER
              </a>
            </Button>

            <Button
              variant="neon"
              asChild
              className="rounded-lg px-4 sm:px-7 h-9 sm:h-11 text-[8px] sm:text-xs border-white/5 bg-white/5 hover:bg-white/10 w-full xs:w-auto"
            >
              <Link href="/docs" className="flex items-center gap-2 sm:gap-2.5">
                <Shield size={12} className="text-zinc-400" />
                COMMAND LIST
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-8 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/5 w-full">
            {[
              { icon: Shield, label: "Secure", color: "text-blue-500" },
              { icon: Zap, label: "Instant", color: "text-yellow-500" },
              { icon: Server, label: "Cloud", color: "text-emerald-500" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <item.icon
                  size={14}
                  className={cn(
                    item.color,
                    "drop-shadow-[0_0_8px_currentColor]"
                  )}
                />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 font-mono">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </motion.div>

      {/* Grid - Mission Hub */}
      <section className="space-y-8">
        <div className="flex flex-col items-center lg:items-start gap-3">
          <div className="w-10 h-1 bg-blue-600 rounded-full" />
          <h2
            className={cn(
              "text-xl font-black text-white tracking-widest uppercase",
              audiowide.className
            )}
          >
            CORE SERVICES
          </h2>
          <p className="text-zinc-500 text-[10px] font-bold tracking-[0.3em] uppercase">
            Initialize your server configuration
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "DOCUMENTATION",
              desc: "Guides and technical specifications.",
              icon: Server,
              accent: "text-blue-400",
              href: "/docs",
              glow: "group-hover:shadow-blue-500/10",
            },
            {
              title: "SUPPORT CENTER",
              desc: "Join our community support server.",
              icon: Shield,
              accent: "text-purple-400",
              href: links.support,
              glow: "group-hover:shadow-purple-500/10",
            },
            {
              title: "UPGRADE TO PRO",
              desc: "Unlock advanced features & limits.",
              icon: Zap,
              accent: "text-emerald-400",
              href: "/dashboard/billing",
              glow: "group-hover:shadow-emerald-500/10",
            },
          ].map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + 0.1 * i }}
              className={cn(i === 2 && "sm:col-span-2 lg:col-span-1")}
            >
              <Link href={action.href} className="group block h-full">
                <Card
                  className={cn(
                    "h-full border-white/5 bg-zinc-950/40 hover:bg-zinc-900/60 transition-all duration-500 rounded-[1.2rem] sm:rounded-[1.5rem] relative overflow-hidden group shadow-2xl backdrop-blur-xl ring-1 ring-white/5",
                    action.glow
                  )}
                >
                  <CardContent className="p-5 sm:p-7 flex flex-col items-center text-center gap-4 sm:gap-5 h-full">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-950 border border-white/10 shadow-[inner_0_0_15px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-all duration-500",
                        action.accent
                      )}
                    >
                      <action.icon
                        size={20}
                        className="filter drop-shadow-[0_0_10px_currentColor]"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <h3
                        className={cn(
                          "text-xs sm:text-base font-black text-white tracking-widest uppercase",
                          audiowide.className
                        )}
                      >
                        {action.title}
                      </h3>
                      <p className="text-zinc-500 text-[10px] sm:text-xs leading-relaxed font-semibold">
                        {action.desc}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 sm:pt-6 flex items-center gap-2 text-[8px] sm:text-[9px] font-black text-blue-400 tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-y-3 group-hover:translate-y-0">
                      ACCESS{" "}
                      <Zap size={8} className="text-blue-400 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
