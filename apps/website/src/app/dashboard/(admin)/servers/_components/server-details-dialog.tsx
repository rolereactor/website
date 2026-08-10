"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Users,
  MessageSquare,
  Mic,
  Terminal,
  TrendingUp,
  Copy,
  Check,
  RefreshCw,
  Crown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDiscordImageUrl } from "@/lib/utils";

interface ServerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string;
  guildName: string;
  guildIcon: string | null;
  onResetProEngine: () => void;
}

interface GuildDetails {
  guildStats: {
    name: string;
    icon: string | null;
    memberCount: number;
    humanCount: number;
    botCount: number;
    onlineCount: number;
    channelCount: number;
    roleCount: number;
    emojiCount: number;
    ownerId: string;
    joinedAt: string;
    latency: number;
    growth: {
      new24h: number;
      new7d: number;
    };
    activity: {
      totalMessages: number;
      totalVoiceMins: number;
      totalCommands: number;
    };
    leaderboard: Array<{
      userId: string;
      username: string;
      avatar: string | null;
      xp: number;
      level: number;
    }>;
  };
  premiumFeatures: {
    pro_engine?: {
      active: boolean;
      isTrial: boolean;
      trialUsed: boolean;
      trialEndsAt: string | null;
      nextDeductionDate: string | null;
    };
  };
}

export function ServerDetailsDialog({
  open,
  onOpenChange,
  guildId,
  guildName,
  guildIcon,
  onResetProEngine,
}: ServerDetailsDialogProps) {
  const [details, setDetails] = useState<GuildDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && guildId) {
      fetchDetails();
    }
  }, [open, guildId]);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/guilds/${guildId}/details`);
      const data = await response.json();
      if (data.status === "success" && data.guildStats) {
        setDetails(data);
      }
    } catch (error) {
      console.error("Failed to fetch guild details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(guildId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getProStatus = () => {
    const premium = details?.premiumFeatures?.pro_engine;
    if (!premium) return { label: "Inactive", color: "zinc" };
    if (premium.isTrial) return { label: "Trial", color: "emerald" };
    if (premium.active) return { label: "Active", color: "cyan" };
    return { label: "Inactive", color: "zinc" };
  };

  const proStatus = getProStatus();
  const stats = details?.guildStats;
  const premium = details?.premiumFeatures?.pro_engine;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 border-white/5 bg-zinc-950/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 italic">
            {stats?.icon ? (
              <Avatar className="size-8">
                <AvatarImage src={stats.icon} alt={stats.name} />
                <AvatarFallback className="bg-zinc-800 text-xs">
                  {stats.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="size-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="text-zinc-400 font-bold text-xs">
                  {stats?.name?.charAt(0) || guildName.charAt(0)}
                </span>
              </div>
            )}
            {stats?.name || guildName}
          </DialogTitle>
          <DialogDescription className="font-mono text-[10px] uppercase tracking-wider">
            ID: <span className="text-cyan-500">{guildId}</span>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="size-6 animate-spin mx-auto text-cyan-500 mb-4" />
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
              Loading server details...
            </p>
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Pro Engine Status */}
            <div className="p-4 rounded-lg bg-zinc-900/50 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  Pro Engine
                </h3>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono ${
                    proStatus.color === "cyan"
                      ? "border-cyan-500/30 text-cyan-500 bg-cyan-500/10"
                      : proStatus.color === "emerald"
                        ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                        : "border-zinc-500/30 text-zinc-500 bg-zinc-500/10"
                  }`}
                >
                  <Crown className="size-2.5 mr-1" />
                  {proStatus.label}
                </Badge>
              </div>
              {premium?.trialEndsAt && (
                <p className="text-[10px] text-zinc-500 font-mono">
                  Expires: {new Date(premium.trialEndsAt).toLocaleDateString()}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onResetProEngine}
                className="mt-3 cursor-pointer font-mono text-[10px] uppercase tracking-widest border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-zinc-950"
              >
                <RefreshCw className="size-3 mr-1" />
                Reset Pro Engine
              </Button>
            </div>

            {/* Server Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={Users}
                label="Members"
                value={stats?.memberCount ?? 0}
                sub={`${stats?.humanCount ?? 0} human, ${stats?.botCount ?? 0} bot`}
              />
              <StatCard
                icon={MessageSquare}
                label="Messages"
                value={stats?.activity?.totalMessages ?? 0}
              />
              <StatCard
                icon={Mic}
                label="Voice Mins"
                value={stats?.activity?.totalVoiceMins ?? 0}
              />
              <StatCard
                icon={Terminal}
                label="Commands"
                value={stats?.activity?.totalCommands ?? 0}
              />
            </div>

            {/* Growth */}
            <div className="p-4 rounded-lg bg-zinc-900/50 border border-white/5">
              <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">
                Growth
              </h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-emerald-500" />
                  <span className="text-sm font-mono">
                    +{stats?.growth?.new24h ?? 0}
                  </span>
                  <span className="text-[10px] text-zinc-500">24h</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-emerald-500" />
                  <span className="text-sm font-mono">
                    +{stats?.growth?.new7d ?? 0}
                  </span>
                  <span className="text-[10px] text-zinc-500">7d</span>
                </div>
              </div>
            </div>

            {/* Top Members */}
            {stats?.leaderboard && stats.leaderboard.length > 0 && (
              <div className="p-4 rounded-lg bg-zinc-900/50 border border-white/5">
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">
                  Top Members (XP)
                </h3>
                <div className="space-y-2">
                  {stats.leaderboard.slice(0, 5).map((member, index) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500 w-4">
                          {index + 1}.
                        </span>
                        <Avatar className="size-6">
                          <AvatarImage
                            src={
                              getDiscordImageUrl(
                                "avatars",
                                member.userId,
                                member.avatar,
                                32
                              ) || undefined
                            }
                            alt={member.username}
                          />
                          <AvatarFallback className="bg-zinc-800 text-[8px]">
                            {member.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-mono">
                          {member.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Lv.{member.level}
                        </span>
                        <span className="text-xs font-mono text-cyan-500">
                          {member.xp.toLocaleString()} XP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyId}
                className="cursor-pointer font-mono text-[10px] uppercase tracking-widest"
              >
                {copied ? (
                  <Check className="size-3 mr-1 text-green-500" />
                ) : (
                  <Copy className="size-3 mr-1" />
                )}
                {copied ? "Copied" : "Copy ID"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
              Failed to load server details
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="size-3 text-zinc-500" />
        <span className="text-[10px] text-zinc-500 font-mono uppercase">
          {label}
        </span>
      </div>
      <p className="text-lg font-mono font-bold">{value.toLocaleString()}</p>
      {sub && <p className="text-[9px] text-zinc-600 font-mono">{sub}</p>}
    </div>
  );
}
