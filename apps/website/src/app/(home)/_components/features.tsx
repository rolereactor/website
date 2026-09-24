"use client";

import { motion } from "motion/react";
import {
  Zap,
  Target,
  Clock,
  Users,
  Trophy,
  Bot,
  MessageSquare,
  Mic,
  BarChart3,
  ArrowUpRight,
  Radio,
  ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Zap,
    title: "Reaction Roles",
    description:
      "Let users self-assign roles by reacting to messages. Organize into categories for clean management.",
    color: "cyan",
  },
  {
    icon: Clock,
    title: "Temporary Roles",
    description:
      "Auto-expire roles after a set time. Perfect for events, trials, and temporary access.",
    color: "purple",
  },
  {
    icon: Target,
    title: "Scheduled Roles",
    description:
      "Schedule future role assignments with natural time formats. Supports one-time and recurring.",
    color: "emerald",
  },
  {
    icon: Users,
    title: "Welcome System",
    description:
      "Auto-welcome new members with customizable embeds and automatic role assignment.",
    color: "orange",
  },
  {
    icon: MessageSquare,
    title: "Goodbye System",
    description:
      "Custom goodbye messages when members leave. Supports embeds and placeholder variables.",
    color: "amber",
  },
  {
    icon: Mic,
    title: "Voice Permissions",
    description:
      "Automatically enforces Connect/Speak restrictions for all role assignments.",
    color: "violet",
  },
  {
    icon: Trophy,
    title: "XP & Levels",
    description:
      "Reward active members with XP, levels, and leaderboards. Fully configurable and optional.",
    color: "indigo",
  },
  {
    icon: BarChart3,
    title: "Poll System",
    description:
      "Create interactive polls with emoji reactions and track results in real-time.",
    color: "green",
  },
  {
    icon: Radio,
    title: "Live Reactor",
    description:
      "Twitch stream alerts, live notifications, and a real-time chat bot for your community.",
    color: "rose",
    pro: true,
    comingSoon: true,
  },
  {
    icon: ImageIcon,
    title: "Image Tools",
    description:
      "Generate welcome banners, rank cards, memes, and upscale images — directly in Discord.",
    color: "sky",
  },
];

const colorMap: Record<
  string,
  { bg: string; text: string; border: string; glow: string }
> = {
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "hover:border-cyan-500/30",
    glow: "hover:shadow-[0_0_30px_-8px_rgba(6,182,212,0.25)]",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "hover:border-purple-500/30",
    glow: "hover:shadow-[0_0_30px_-8px_rgba(168,85,247,0.25)]",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "hover:border-emerald-500/30",
    glow: "hover:shadow-[0_0_30px_-8px_rgba(16,185,129,0.25)]",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "hover:border-orange-500/30",
    glow: "hover:shadow-[0_0_30px_-8px_rgba(249,115,22,0.25)]",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "hover:border-amber-500/30",
    glow: "hover:shadow-[0_0_30px_-8px_rgba(245,158,11,0.25)]",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "hover:border-violet-500/30",
    glow: "hover:shadow-[0_0_30px_-8px_rgba(139,92,246,0.25)]",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "hover:border-indigo-500/30",
    glow: "hover:shadow-[0_0_30px_-8px_rgba(99,102,241,0.25)]",
  },
  green: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "hover:border-green-500/30",
    glow: "hover:shadow-[0_0_30px_-8px_rgba(34,197,94,0.25)]",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "hover:border-rose-500/30",
    glow: "hover:shadow-[0_0_30px_-8px_rgba(244,63,94,0.25)]",
  },
  sky: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "hover:border-sky-500/30",
    glow: "hover:shadow-[0_0_30px_-8px_rgba(14,165,233,0.25)]",
  },
};

export function Features() {
  return (
    <section className="py-20 sm:py-28 px-4 relative">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <Badge
            variant="secondary"
            className="mb-4 bg-white/5 text-zinc-400 border-white/10 gap-2"
          >
            <Bot className="w-3 h-3" />
            <span>Features</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Everything your server needs
          </h2>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto">
            Powerful role management and community tools. Set up in minutes, not
            hours.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const colors = colorMap[feature.color];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`group relative p-5 rounded-xl border border-white/6 bg-white/2 backdrop-blur-sm transition-all duration-300 hover:bg-white/4 hover:border-white/12 ${colors.border} ${colors.glow}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                  >
                    <feature.icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  {feature.comingSoon ? (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 uppercase tracking-widest">
                      Coming Soon
                    </span>
                  ) : feature.pro ? (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/25 uppercase tracking-widest">
                      PRO
                    </span>
                  ) : null}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  {feature.title}
                  <ArrowUpRight className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
