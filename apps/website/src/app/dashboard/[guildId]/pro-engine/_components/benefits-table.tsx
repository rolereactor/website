"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Zap, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const benefits = [
  {
    name: "Reaction Messages",
    free: "3",
    pro: "15",
    tooltip: "Maximum role reaction messages you can create per server",
    type: "limit",
    category: "Role Reactions",
  },
  {
    name: "Emojis per Message",
    free: "3",
    pro: "20",
    tooltip: "Maximum emojis/roles per reaction message",
    type: "limit",
    category: "Role Reactions",
  },
  {
    name: "Max Usage Limits",
    free: true,
    pro: true,
    tooltip: "Set maximum number of users who can claim a reaction role",
    type: "feature",
    category: "Role Reactions",
  },
  {
    name: "Active Giveaways",
    free: "3",
    pro: "20",
    tooltip: "Maximum concurrent giveaways running at once",
    type: "limit",
    category: "Giveaways",
  },
  {
    name: "Max Entries",
    free: "2,500",
    pro: "50,000",
    tooltip: "Maximum participants per giveaway",
    type: "limit",
    category: "Giveaways",
  },
  {
    name: "Max Winners",
    free: "5",
    pro: "20",
    tooltip: "Maximum winners per giveaway",
    type: "limit",
    category: "Giveaways",
  },
  {
    name: "Level Rewards",
    free: "5",
    pro: "Unlimited",
    tooltip: "Maximum role rewards for level-ups",
    type: "limit",
    category: "Leveling",
  },
  {
    name: "Replace Role Mode",
    free: false,
    pro: true,
    tooltip: "Replace lower roles instead of stacking them",
    type: "feature",
    category: "Leveling",
  },
  {
    name: "Scheduled Roles",
    free: "25",
    pro: "500",
    tooltip: "Maximum scheduled role assignments",
    type: "limit",
    category: "Automation",
  },
  {
    name: "Role Bundles",
    free: "5",
    pro: "15",
    tooltip: "Reusable groups of roles for quick setup",
    type: "limit",
    category: "Automation",
  },
  {
    name: "Bulk Actions",
    free: "25",
    pro: "250",
    tooltip: "Maximum users per bulk moderation action",
    type: "limit",
    category: "Automation",
  },
  {
    name: "Tickets per Month",
    free: "50",
    pro: "500",
    tooltip: "Monthly ticket creation limit",
    type: "limit",
    category: "Ticketing",
  },
  {
    name: "Categories per Panel",
    free: "3",
    pro: "20",
    tooltip: "Maximum ticket categories per panel",
    type: "limit",
    category: "Ticketing",
  },
  {
    name: "Transcript Retention",
    free: "7 days",
    pro: "Unlimited",
    tooltip: "How long closed ticket transcripts are stored",
    type: "limit",
    category: "Ticketing",
  },
  {
    name: "Export Formats",
    free: "MD",
    pro: "HTML, JSON",
    tooltip: "Transcript export format options",
    type: "feature",
    category: "Ticketing",
  },
  {
    name: "Staff Analytics",
    free: false,
    pro: true,
    tooltip: "Track staff ticket handling performance",
    type: "feature",
    category: "Ticketing",
  },
  {
    name: "Ticket Automation",
    free: false,
    pro: true,
    tooltip: "Auto-close, reminders, and escalation rules",
    type: "feature",
    category: "Ticketing",
  },
  {
    name: "Domain Allowlisting",
    free: false,
    pro: true,
    tooltip: "Whitelist trusted domains while blocking all other links",
    type: "feature",
    category: "Auto-Moderation",
  },
  {
    name: "Wildcard Filters",
    free: false,
    pro: true,
    tooltip: "Use wildcard patterns (e.g. *spam*) for flexible word filtering",
    type: "feature",
    category: "Auto-Moderation",
  },
  {
    name: "Regex Filters",
    free: false,
    pro: true,
    tooltip: "Advanced regex patterns for precise content moderation",
    type: "feature",
    category: "Auto-Moderation",
  },
];

const categoryStyles: Record<
  string,
  { bg: string; badge: string; badgeBg: string }
> = {
  "Role Reactions": {
    bg: "bg-cyan-500/5",
    badge: "text-cyan-400",
    badgeBg: "bg-cyan-500/20",
  },
  Giveaways: {
    bg: "bg-pink-500/5",
    badge: "text-pink-400",
    badgeBg: "bg-pink-500/20",
  },
  Leveling: {
    bg: "bg-emerald-500/5",
    badge: "text-emerald-400",
    badgeBg: "bg-emerald-500/20",
  },
  Automation: {
    bg: "bg-purple-500/5",
    badge: "text-purple-400",
    badgeBg: "bg-purple-500/20",
  },
  Ticketing: {
    bg: "bg-amber-500/5",
    badge: "text-amber-400",
    badgeBg: "bg-amber-500/20",
  },
  "Auto-Moderation": {
    bg: "bg-red-500/5",
    badge: "text-red-400",
    badgeBg: "bg-red-500/20",
  },
};

function BenefitRow({
  item,
  style,
  isFirstOfCategory,
}: {
  item: (typeof benefits)[0];
  style: (typeof categoryStyles)[keyof typeof categoryStyles];
  isFirstOfCategory: boolean;
}) {
  const isFeature = item.type === "feature";
  return (
    <div
      className={cn(
        "group grid grid-cols-12 gap-2 px-4 py-3 items-center text-xs transition-colors hover:bg-white/2",
        isFirstOfCategory && "border-t border-white/5",
        isFirstOfCategory && style.bg
      )}
    >
      {/* Feature Name with Category Badge & Tooltip */}
      <div className="col-span-5 flex items-center gap-2">
        {isFirstOfCategory && (
          <span
            className={cn(
              "text-[9px] font-bold px-2 py-0.5 rounded shrink-0",
              style.badgeBg,
              style.badge
            )}
          >
            {item.category}
          </span>
        )}
        <span
          className={cn(
            "text-zinc-400 flex items-center gap-1",
            isFirstOfCategory && "font-medium"
          )}
        >
          {item.name}
        </span>
        <div className="relative group/info">
          <Info className="w-3 h-3 text-zinc-600 cursor-help" />
          <div className="absolute left-0 bottom-full mb-1 px-2 py-1 bg-zinc-800 text-[10px] text-zinc-300 rounded whitespace-nowrap z-10 shadow-lg border border-white/10 hidden group-hover/info:block">
            {item.tooltip}
          </div>
        </div>
      </div>

      {/* Free Value */}
      <div className="col-span-3 text-center flex items-center justify-center">
        {typeof item.free === "boolean" ? (
          item.free ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <span className="font-mono text-xs text-zinc-700">—</span>
          )
        ) : (
          <span
            className={cn(
              "font-mono text-xs",
              isFeature ? "text-zinc-600" : "text-zinc-500"
            )}
          >
            {item.free}
          </span>
        )}
      </div>

      {/* Pro Value */}
      <div className="col-span-4 text-center flex items-center justify-center gap-1">
        {typeof item.pro === "boolean" ? (
          item.pro ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <X className="w-4 h-4 text-zinc-700" />
          )
        ) : (
          <span className="text-purple-400 font-bold">{item.pro}</span>
        )}
      </div>
    </div>
  );
}

interface ProEngineBenefitsProps {
  isActive?: boolean;
}

export function ProEngineBenefits({
  isActive = false,
}: ProEngineBenefitsProps) {
  return (
    <Card className="border-purple-500/20 bg-zinc-950/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-purple-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-white">
              Pro Engine Benefits
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isActive ? (
              <Badge
                variant="outline"
                className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]"
              >
                <Check className="w-3 h-3 mr-1" />
                ACTIVE
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-[10px]"
              >
                <Zap className="w-3 h-3 mr-1" />
                20 Cores / week
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-b border-white/5 bg-zinc-900/30 flex items-center gap-4 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="font-mono text-zinc-400">3</span> = Limit
        </span>
        <span className="flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-400" /> = Included
        </span>
        <span className="flex items-center gap-1">
          <span className="text-zinc-700">—</span> = Not available
        </span>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 bg-zinc-900/50 text-[10px] font-black uppercase tracking-widest text-zinc-500">
        <div className="col-span-5">Feature</div>
        <div className="col-span-3 text-center">Free</div>
        <div className="col-span-4 text-center text-purple-400">Pro Engine</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-white/5">
        {benefits.map((item, index) => {
          const style = categoryStyles[item.category];
          const isFirstOfCategory =
            index === 0 || benefits[index - 1].category !== item.category;

          return (
            <BenefitRow
              key={item.name}
              item={item}
              style={style}
              isFirstOfCategory={isFirstOfCategory}
            />
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5 bg-zinc-900/30">
        <p className="text-[10px] text-zinc-500 text-center">
          All limits reset monthly. Upgrade anytime for instant access.
        </p>
      </div>
    </Card>
  );
}
