"use client";

import { useState, useEffect, useRef } from "react";
import {
  UserPlus,
  Gift,
  Trophy,
  Ticket,
  Wallet,
  Radio,
  Trash2,
} from "lucide-react";
import { useSSE } from "@/hooks/use-sse";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityEvent {
  type: string;
  username: string;
  details?: string;
  timestamp: number;
}

const EVENT_ICONS: Record<string, React.ElementType> = {
  member_join: UserPlus,
  giveaway_enter: Gift,
  giveaway_ended: Trophy,
  giveaway_reroll: Trophy,
  giveaway_win: Trophy,
  ticket_create: Ticket,
  donation: Wallet,
};

const EVENT_COLORS: Record<string, string> = {
  member_join: "text-emerald-400",
  giveaway_enter: "text-amber-400",
  giveaway_ended: "text-red-400",
  giveaway_reroll: "text-orange-400",
  giveaway_win: "text-yellow-400",
  ticket_create: "text-violet-400",
  donation: "text-green-400",
};

const EVENT_LABELS: Record<string, string> = {
  member_join: "Joined",
  giveaway_enter: "Entered Giveaway",
  giveaway_ended: "Giveaway Ended",
  giveaway_reroll: "Giveaway Rerolled",
  giveaway_win: "Won Giveaway",
  ticket_create: "Ticket Created",
  donation: "Donation",
};

interface LiveActivityFeedProps {
  guildId: string;
}

export function LiveActivityFeed({ guildId }: LiveActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { isConnected } = useSSE(guildId, (eventType, data) => {
    if (eventType === "activity") {
      setEvents((prev) => [...prev.slice(-49), data as ActivityEvent]);
    }
  });

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const clearEvents = () => setEvents([]);

  return (
    <Card className="bg-zinc-950/50 border-zinc-800/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-sm font-semibold">Live Activity</CardTitle>
          <Badge
            variant={isConnected ? "default" : "secondary"}
            className={
              isConnected
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-zinc-700/50 text-zinc-400"
            }
          >
            <Radio
              className={`mr-1 h-3 w-3 ${isConnected ? "animate-pulse" : ""}`}
            />
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        {events.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearEvents}
            className="h-7 text-xs text-zinc-400 hover:text-zinc-200"
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]" ref={scrollRef}>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <Radio className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Waiting for activity...</p>
              <p className="text-xs mt-1">
                Events will appear here in real-time
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event, i) => (
                <ActivityItem key={`${event.timestamp}-${i}`} event={event} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ event }: { event: ActivityEvent }) {
  const Icon = EVENT_ICONS[event.type] || Radio;
  const colorClass = EVENT_COLORS[event.type] || "text-zinc-400";
  const label = EVENT_LABELS[event.type] || event.type;

  const timeAgo = formatTimeAgo(event.timestamp);

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 animate-in slide-in-from-right-2 duration-300">
      <div
        className={`mt-0.5 p-1.5 rounded-md bg-zinc-800/50 ${colorClass}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-100 truncate">
            {event.username}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
            {label}
          </span>
        </div>
        {event.details && (
          <p className="text-xs text-zinc-400 mt-0.5 truncate">
            {event.details}
          </p>
        )}
      </div>
      <span className="text-[10px] text-zinc-600 shrink-0 mt-0.5">
        {timeAgo}
      </span>
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}
