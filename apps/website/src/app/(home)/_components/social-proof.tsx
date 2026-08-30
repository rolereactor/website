"use client";

import { motion } from "motion/react";
import { Server, TrendingUp, Shield, Terminal } from "lucide-react";

function formatExecutions(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M+`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}k+`;
  return "100k+";
}

interface SocialProofProps {
  totalExecutions?: number;
  totalGuilds?: number;
  totalCommands?: number;
}

function formatGuilds(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k+`;
  return count.toString();
}

export function SocialProof({
  totalExecutions = 0,
  totalGuilds = 0,
  totalCommands = 0,
}: SocialProofProps) {
  const stats = [
    {
      value: totalGuilds >= 1 ? formatGuilds(totalGuilds) : "1k+",
      label: "Servers",
      icon: Server,
      color: "text-indigo-400",
    },
    {
      value:
        totalExecutions >= 1000 ? formatExecutions(totalExecutions) : "100k+",
      label: "Commands Run",
      icon: TrendingUp,
      color: "text-emerald-400",
    },
    {
      value: "99.9%",
      label: "Uptime",
      icon: Shield,
      color: "text-cyan-400",
    },
    {
      value: `${totalCommands}+`,
      label: "Commands",
      icon: Terminal,
      color: "text-purple-400",
    },
  ];

  return (
    <section className="py-20 sm:py-28 px-4 relative">
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="text-center group"
            >
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/4 border border-white/6 flex items-center justify-center group-hover:bg-white/6 transition-colors">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-500 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
