"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Shield,
  MessageSquare,
  Trophy,
  Sparkles,
  ArrowRight,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const features: Feature[] = [
  {
    title: "Reaction Roles",
    description: "Let members self-assign roles by clicking emojis",
    icon: Shield,
    href: "/dashboard/roles",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Welcome Messages",
    description: "Greet new members with custom messages",
    icon: MessageSquare,
    href: "/dashboard/welcome",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "XP & Levels",
    description: "Reward activity with experience points",
    icon: Trophy,
    href: "/dashboard/xp",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Pro Engine",
    description: "Unlock premium features for your server",
    icon: Sparkles,
    href: "/dashboard/pro-engine",
    color: "from-amber-500 to-orange-500",
  },
];

interface ServerOnboardingProps {
  guildId?: string;
}

export function ServerOnboarding(_props: ServerOnboardingProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-linear-to-br from-zinc-900/80 to-zinc-950/80 p-6 backdrop-blur-sm"
    >
      <div className="absolute -right-20 -top-20 size-64 rounded-full bg-cyan-500/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 size-48 rounded-full bg-cyan-500/5 blur-2xl" />

      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Zap className="size-5 text-cyan-400" />
              Get Started with Role Reactor
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Set up these popular features to enhance your server
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            className="text-zinc-500 hover:text-zinc-300"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group flex items-center gap-4 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 transition-all hover:border-cyan-500/30 hover:bg-zinc-800/50"
              >
                <div
                  className={
                    feature.color +
                    " flex size-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br"
                  }
                >
                  <Icon className="size-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-200 group-hover:text-cyan-300">
                      {feature.title}
                    </span>
                    <ArrowRight className="size-3 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="text-xs text-zinc-500">{feature.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            💡 Tip: You can configure these anytime from the sidebar
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="text-zinc-500 hover:text-zinc-300"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
