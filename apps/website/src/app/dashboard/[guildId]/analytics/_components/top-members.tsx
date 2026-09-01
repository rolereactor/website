"use client";

import { Audiowide } from "next/font/google";
import { LayoutGrid, MessageSquare, Mic, Crown } from "lucide-react";
import { cn, getDiscordImageUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CyberpunkBackground } from "@/components/common/cyberpunk-background";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface TopMember {
  userId: string;
  username: string;
  avatar: string | null;
  count: number;
}

interface TopMembersProps {
  chatters: TopMember[];
  voiceUsers: TopMember[];
  isPremium: boolean;
  onUpgrade?: () => void;
}

function formatVoiceTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

const rankColors = [
  {
    bg: "bg-amber-500",
    text: "text-amber-500",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]",
    ring: "ring-amber-500/30",
  },
  {
    bg: "bg-zinc-400",
    text: "text-zinc-400",
    border: "border-zinc-400/30",
    glow: "shadow-[0_0_10px_rgba(161,161,170,0.15)]",
    ring: "ring-zinc-400/30",
  },
  {
    bg: "bg-amber-700",
    text: "text-amber-700",
    border: "border-amber-700/30",
    glow: "shadow-[0_0_10px_rgba(180,83,9,0.15)]",
    ring: "ring-amber-700/30",
  },
  {
    bg: "bg-zinc-600",
    text: "text-zinc-500",
    border: "border-zinc-700/30",
    glow: "",
    ring: "ring-zinc-700/30",
  },
  {
    bg: "bg-zinc-700",
    text: "text-zinc-600",
    border: "border-zinc-800/30",
    glow: "",
    ring: "ring-zinc-800/30",
  },
];

function MemberList({
  members,
  icon: Icon,
  title,
  subtitle,
  accentColor,
  formatValue,
}: {
  members: TopMember[];
  icon: React.ElementType;
  title: string;
  subtitle: string;
  accentColor: string;
  formatValue: (count: number) => string;
}) {
  const colorMap: Record<string, string> = {
    cyan: "border-cyan-500/20 hover:border-cyan-500/40",
    purple: "border-purple-500/20 hover:border-purple-500/40",
  };

  const iconColorMap: Record<string, string> = {
    cyan: "text-cyan-500",
    purple: "text-purple-500",
  };

  return (
    <Card
      variant="cyberpunk"
      className={cn("overflow-hidden", colorMap[accentColor])}
    >
      <CyberpunkBackground />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-2 mb-5">
          <Icon className={cn("w-4 h-4", iconColorMap[accentColor])} />
          <div>
            <h3
              className={cn(
                "text-sm font-bold text-white uppercase tracking-wider",
                audiowide.className
              )}
            >
              {title}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-4">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <p className="text-sm text-zinc-400 font-medium">No data yet</p>
            <p className="text-xs text-zinc-600 mt-1">
              Activity data will appear as members engage.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member, index) => {
              const rank = rankColors[index] || rankColors[4];
              return (
                <div
                  key={member.userId}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-xl transition-all",
                    "bg-zinc-900/30 border border-white/5",
                    "hover:bg-zinc-800/40 hover:border-white/10",
                    index === 0 && "bg-amber-500/5 border-amber-500/10"
                  )}
                >
                  {/* Rank */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-black shrink-0",
                      rank.bg,
                      rank.glow
                    )}
                  >
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  <Avatar
                    className={cn(
                      "h-8 w-8 shrink-0 rounded-lg ring-2",
                      rank.ring
                    )}
                  >
                    <AvatarImage
                      src={
                        getDiscordImageUrl(
                          "avatars",
                          member.userId,
                          member.avatar,
                          64
                        ) || undefined
                      }
                      alt={member.username}
                      width={32}
                      height={32}
                    />
                    <AvatarFallback className="bg-zinc-800 text-zinc-400 text-[10px] font-black rounded-lg">
                      {member.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-xs font-bold text-white truncate",
                        index === 0 && "text-amber-300"
                      )}
                    >
                      {member.username}
                    </p>
                  </div>

                  {/* Count */}
                  <span
                    className={cn(
                      "text-xs font-black tabular-nums shrink-0",
                      audiowide.className,
                      index === 0 ? "text-amber-400" : "text-zinc-400"
                    )}
                  >
                    {formatValue(member.count)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TopMembers({
  chatters,
  voiceUsers,
  isPremium,
  onUpgrade,
}: TopMembersProps) {
  return (
    <div className="relative">
      {/* Premium blur overlay */}
      {!isPremium && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm rounded-2xl">
          <button
            onClick={onUpgrade}
            className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-3 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer group"
          >
            <Crown className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span
              className={cn(
                "text-xs font-black text-amber-400 uppercase tracking-widest",
                audiowide.className
              )}
            >
              Unlock with Pro Engine
            </span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MemberList
          members={chatters}
          icon={MessageSquare}
          title="Top Chatters"
          subtitle="Most messages sent (all-time)"
          accentColor="cyan"
          formatValue={(count) => count.toLocaleString()}
        />
        <MemberList
          members={voiceUsers}
          icon={Mic}
          title="Top Voice Users"
          subtitle="Most time in voice (all-time)"
          accentColor="purple"
          formatValue={(count) => formatVoiceTime(count)}
        />
      </div>
    </div>
  );
}
