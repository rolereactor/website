"use client";

import Link from "next/link";
import Image from "next/image";
import { Audiowide } from "next/font/google"; // turbo
import { motion } from "motion/react";
import { Plus, LayoutDashboard, Database, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface BotInviteCardProps {
  guildId: string;
}

export function BotInviteCard({ guildId }: BotInviteCardProps) {
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=8&integration_type=0&scope=bot+applications.commands&guild_id=${guildId}&disable_guild_select=true`;

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[80vh] text-center px-4 overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
            <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-blue-600 to-purple-600 opacity-30 blur-lg" />
            <Image
              src="/logo.png"
              width={80}
              height={80}
              alt="Role Reactor"
              className="relative drop-shadow-2xl rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-sm p-3"
              priority
            />
            <div className="absolute -bottom-2 -right-2 bg-zinc-900 text-red-500 p-1.5 rounded-full border-2 border-zinc-800 shadow-lg">
              <Database className="w-4 h-4" />
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
            className={`text-5xl md:text-7xl font-black tracking-tighter bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent ${audiowide.className}`}
          >
            NOT CONNECTED
          </h1>

          <div className="flex items-center justify-center gap-2 text-zinc-300">
            <Shield className="w-5 h-5 text-red-400" />
            <h2 className="text-xl md:text-2xl font-bold">Bot Required</h2>
          </div>

          <p className="text-zinc-400 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Role Reactor is not in this server yet. Invite the bot to access the
            dashboard, manage roles, and track XP.
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
            <Link href="/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            className="h-12 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl shadow-lg shadow-[#5865F2]/20 transition-all hover:scale-105 active:scale-95 px-8"
          >
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add to Server
            </a>
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
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Not Installed
          </div>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            Invite Bot
          </div>
        </motion.div>
      </div>
    </div>
  );
}
