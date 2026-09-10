"use client";

import { useState, use, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Ticket,
  Clock,
  CheckCircle2,
  Archive,
  ChevronDown,
  ChevronUp,
  User,
  MessageSquare,
  AlertCircle,
  Users,
  BookOpen,
  Loader2,
  LayoutGrid,
  ShieldCheck,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useTicketStore,
  type Ticket as TicketType,
  type Transcript,
  type StaffMember,
} from "@/store/use-ticket-store";
import { useServerStore } from "@/store/use-server-store";
import { useGuildStore } from "@/store/use-guild-store";
import { audiowide, orbitron } from "@/lib/fonts";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/app/dashboard/_components/page-header";
import { StatePanel } from "@/components/common/state-panel";
import { NodeLoader } from "@/components/common/node-loader";
import { SetupWizard } from "./_components/setup-wizard";
import { SectionSettings } from "./_components/section-settings";
import { TicketsNav, TICKET_SECTIONS } from "./_components/tickets-nav";
import { SectionPanels } from "./_components/section-panels";

interface TicketsPageProps {
  params: Promise<{ guildId: string }>;
}

const STATUS_CONFIG = {
  open: { label: "Open", variant: "accent" as const, icon: Ticket },
  closed: { label: "Closed", variant: "success" as const, icon: CheckCircle2 },
  archived: { label: "Archived", variant: "outline" as const, icon: Archive },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", variant: "outline" as const },
  medium: { label: "Medium", variant: "info" as const },
  high: { label: "High", variant: "warning" as const },
  urgent: { label: "Urgent", variant: "destructive" as const },
};

function formatDuration(minutes: number): string {
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const COLOR_STYLES: Record<string, { border: string; text: string; bg: string; via: string }> = {
  cyan: { border: "border-cyan-500/20 hover:border-cyan-500/40", text: "text-cyan-500", bg: "bg-cyan-500/20", via: "via-cyan-500/20" },
  emerald: { border: "border-emerald-500/20 hover:border-emerald-500/40", text: "text-emerald-500", bg: "bg-emerald-500/20", via: "via-emerald-500/20" },
  purple: { border: "border-purple-500/20 hover:border-purple-500/40", text: "text-purple-500", bg: "bg-purple-500/20", via: "via-purple-500/20" },
  amber: { border: "border-amber-500/20 hover:border-amber-500/40", text: "text-amber-500", bg: "bg-amber-500/20", via: "via-amber-500/20" },
};

function StatsCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  const styles = COLOR_STYLES[color] ?? COLOR_STYLES.cyan;

  return (
    <Card variant="stat" className={cn("p-5 flex flex-col justify-center min-h-25", styles.border)}>
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className={cn("w-20 h-20 rotate-12", styles.text)} />
      </div>
      <div className="flex items-center gap-2 text-zinc-500 mb-2 relative z-10 min-w-0">
        <Icon className={cn("w-4 h-4 shrink-0", styles.text)} />
        <span
          className={cn(
            "text-[10px] font-black uppercase tracking-wider truncate",
            audiowide.className
          )}
        >
          {label}
        </span>
      </div>
      <div
        className={cn(
          "text-3xl font-black text-white relative z-10 tabular-nums tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]",
          orbitron.className
        )}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[10px] text-zinc-500 font-mono mt-1 relative z-10">{sub}</div>
      )}
      <div className={cn("absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent to-transparent", styles.via)} />
    </Card>
  );
}

function TicketRow({
  ticket,
  isExpanded,
  onToggle,
}: {
  ticket: TicketType;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const statusConf = STATUS_CONFIG[ticket.status];
  const priorityConf = PRIORITY_CONFIG[ticket.priority];

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto_auto_auto] items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-mono text-zinc-400 truncate">
              #{ticket.id.slice(-8)}
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-sm text-zinc-300 truncate">{ticket.creatorName}</span>
          </div>
          <Badge variant={statusConf.variant} className="text-[10px] shrink-0">
            <statusConf.icon className="w-3 h-3 mr-1" />
            {statusConf.label}
          </Badge>
          <Badge variant={priorityConf.variant} className="text-[10px] shrink-0">
            {priorityConf.label}
          </Badge>
          <span className="text-xs text-zinc-500 truncate">
            {ticket.claimedByName || "—"}
          </span>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <MessageSquare className="w-3 h-3" />
            {ticket.messageCount}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 font-mono whitespace-nowrap">
              {formatDate(ticket.createdAt)}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </div>
        </div>
        <div className="md:hidden grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <span className="text-xs font-mono text-zinc-400 truncate block">
              #{ticket.id.slice(-8)}
            </span>
            <span className="text-xs text-zinc-500 truncate block">{ticket.creatorName}</span>
          </div>
          <Badge variant={statusConf.variant} className="text-[10px] shrink-0">
            {statusConf.label}
          </Badge>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 bg-black/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">Channel</span>
              <p className="text-zinc-300 font-mono mt-1">#{ticket.channelId}</p>
            </div>
            <div>
              <span className="text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">Participants</span>
              <p className="text-zinc-300 mt-1">{ticket.participantCount} user{ticket.participantCount !== 1 ? "s" : ""}</p>
            </div>
            <div>
              <span className="text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">Category</span>
              <p className="text-zinc-300 mt-1">{ticket.category || "General"}</p>
            </div>
            <div>
              <span className="text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">Last Activity</span>
              <p className="text-zinc-300 font-mono mt-1">{formatDate(ticket.lastActivityAt)}</p>
            </div>
          </div>
          {ticket.tags && ticket.tags.length > 0 && (
            <div className="mt-3">
              <span className="text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">Tags</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {ticket.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {ticket.closedAt && (
            <div className="mt-3 text-[11px] text-zinc-500">
              Closed: {formatDate(ticket.closedAt)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TranscriptRow({
  transcript,
  isExpanded,
  onToggle,
}: {
  transcript: Transcript;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-mono text-zinc-400 truncate">
              #{transcript.ticketId.slice(-8)}
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-sm text-zinc-300 truncate">{transcript.creatorName}</span>
          </div>
          <Badge variant={transcript.status === "closed" ? "success" : "outline"} className="text-[10px] shrink-0">
            {transcript.status}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <MessageSquare className="w-3 h-3" />
            {transcript.messageCount}
          </div>
          <span className="text-xs text-zinc-500">
            {formatDuration(transcript.durationMinutes)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 font-mono whitespace-nowrap">
              {formatDate(transcript.closedAt)}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </div>
        </div>
        <div className="md:hidden grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <span className="text-xs font-mono text-zinc-400 truncate block">
              #{transcript.ticketId.slice(-8)}
            </span>
            <span className="text-xs text-zinc-500 truncate block">{transcript.creatorName}</span>
          </div>
          <span className="text-xs text-zinc-500 shrink-0">
            {formatDuration(transcript.durationMinutes)}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 bg-black/20 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-3">
            <div>
              <span className="text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">Channel</span>
              <p className="text-zinc-300 font-mono mt-1">#{transcript.channelId}</p>
            </div>
            <div>
              <span className="text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">Category</span>
              <p className="text-zinc-300 mt-1">{transcript.category || "General"}</p>
            </div>
            <div>
              <span className="text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">Participants</span>
              <p className="text-zinc-300 mt-1">{transcript.participantCount} user{transcript.participantCount !== 1 ? "s" : ""}</p>
            </div>
            <div>
              <span className="text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">Staff</span>
              <p className="text-zinc-300 mt-1">{transcript.claimedByName || "—"}</p>
            </div>
          </div>
          {transcript.tags && transcript.tags.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1.5">
                {transcript.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <span className="text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">Messages</span>
            {transcript.messages && transcript.messages.length > 0 ? (
              transcript.messages.map((msg, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="text-zinc-400 font-medium shrink-0">{msg.authorName}</span>
                  <span className="text-zinc-500 font-mono text-[10px] shrink-0">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-zinc-300 break-words">{msg.content}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500">No messages in transcript</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StaffRow({ member, rank }: { member: StaffMember; rank: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5 last:border-b-0">
      <span className="text-xs font-mono text-zinc-500 w-6 text-center">{rank}</span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <User className="w-4 h-4 text-zinc-500 shrink-0" />
        <span className="text-sm text-zinc-200 truncate">{member.staffName}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-zinc-400">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        {member.ticketsClosed} closed
      </div>
      <span className="text-xs text-zinc-500 font-mono">
        {formatDuration(member.avgCloseTimeMinutes)} avg
      </span>
    </div>
  );
}


export default function TicketsPage({ params }: TicketsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <NodeLoader
            title="Loading Tickets"
            subtitle="Synchronizing your data..."
          />
        </div>
      }
    >
      <TicketsPageContent params={params} />
    </Suspense>
  );
}

function TicketsPageContent({ params }: TicketsPageProps) {
  const { guildId } = use(params);
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section");
  const [activeSection, setActiveSection] = useState(
    (TICKET_SECTIONS as readonly string[]).includes(sectionParam ?? "")
      ? sectionParam!
      : "overview"
  );
  const [ticketFilter, setTicketFilter] = useState("all");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [expandedTranscript, setExpandedTranscript] = useState<string | null>(null);

  const { getGuildData, dataCache, isLoading, isError, fetchTicketData } = useTicketStore();

  const hasGuildData = guildId in dataCache;
  const { tickets, stats, panels, transcripts, settings, staffStats } =
    getGuildData(guildId);

  const { guilds } = useServerStore();
  const activeGuild = guilds.find((g) => g.id === guildId);
  const guildName = activeGuild?.name || "this server";

  const { guildData, fetchRoles, fetchChannels } = useGuildStore();
  const guildChannels = guildData[guildId]?.channels;
  const guildRoles = guildData[guildId]?.roles;

  useEffect(() => {
    if (guildId) {
      fetchTicketData(guildId);
      fetchRoles(guildId);
      fetchChannels(guildId);
    }
  }, [guildId, fetchTicketData, fetchRoles, fetchChannels]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedTicket((prev) => (prev === id ? null : id));
  }, []);

  const toggleTranscriptExpand = useCallback((id: string) => {
    setExpandedTranscript((prev) => (prev === id ? null : id));
  }, []);

  const handleSectionChange = useCallback(
    (section: string) => {
      setActiveSection(section);
      window.history.replaceState(
        null,
        "",
        `/dashboard/${guildId}/tickets?section=${section}`
      );
    },
    [guildId]
  );

  const isInitialLoading = !hasGuildData || (isLoading && !tickets.length && !stats);

  if (isInitialLoading) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-background">
        <NodeLoader title="Loading Dashboard" subtitle="Synchronizing your data..." />
      </div>
    );
  }

  if (isError && !tickets.length) {
    const isBotOffline =
      isError.message?.includes("unavailable") || isError.message?.includes("503");

    return (
      <div className="space-y-6 w-full">
        <PageHeader
          category="Engagement Management"
          categoryIcon={Ticket}
          title="Ticket System"
          description="Manage support tickets and track community issues for"
          serverName={guildName}
        />
        <StatePanel
          variant="error"
          icon={AlertTriangle}
          title={isBotOffline ? "Bot Service Offline" : "System Alert"}
          description={
            isBotOffline
              ? "The bot service is currently unavailable. Please ensure the bot is running and try again."
              : isError.message || "Failed to load ticket data."
          }
          actionLabel="Try Again"
          onAction={() => fetchTicketData(guildId, true)}
        />
      </div>
    );
  }

  const needsSetup = hasGuildData && !settings && !isLoading && guildChannels !== undefined && guildRoles !== undefined;

  if (needsSetup) {
    return (
      <div className="space-y-6 w-full">
        <PageHeader
          category="Engagement Management"
          categoryIcon={Ticket}
          title="Ticket System"
          description="Set up the ticket system for"
          serverName={guildName}
        />
        <SetupWizard
          guildId={guildId}
          onComplete={() => fetchTicketData(guildId, true)}
          channels={guildChannels || []}
          roles={guildRoles || []}
        />
      </div>
    );
  }

  const filteredTickets =
    ticketFilter === "all"
      ? tickets
      : tickets.filter((t) => t.status === ticketFilter);

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        category="Engagement Management"
        categoryIcon={Ticket}
        title="Ticket System"
        description="Manage support tickets and track community issues for"
        serverName={guildName}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          label="Open Tickets"
          value={stats?.openCount ?? 0}
          icon={Ticket}
          color="cyan"
        />
        <StatsCard
          label="Closed This Month"
          value={stats?.closedThisMonth ?? 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          label="Total All Time"
          value={stats?.totalAllTime ?? 0}
          icon={Archive}
          color="purple"
        />
        <StatsCard
          label="Avg Close Time"
          value={formatDuration(stats?.avgCloseTimeMinutes ?? 0)}
          icon={Clock}
          color="amber"
          sub={stats?.avgCloseTimeMinutes ? formatDuration(stats.avgCloseTimeMinutes) : "No data"}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <TicketsNav
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          badges={{
            tickets: stats?.openCount,
            panels: panels.filter((p) => p.enabled).length,
          }}
        />

        <div className="flex-1 min-w-0">
        {activeSection === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
              {/* Card 1: Open Tickets Preview */}
              <Card variant="glass" className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 h-7">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-200 tracking-wide truncate">Open Tickets</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-[10px] border-white/10 hover:border-cyan-500/30 hover:text-cyan-400 shrink-0"
                    onClick={() => handleSectionChange("tickets")}
                  >
                    View tickets
                  </Button>
                </div>
                {tickets.filter((t) => t.status === "open").length === 0 ? (
                  <EmptyState
                    icon={Ticket}
                    color="cyan"
                    compact
                    title="No open tickets"
                    description="All support requests are currently resolved"
                  />
                ) : (
                  <div className="space-y-2 flex-1 flex flex-col justify-start">
                    {tickets
                      .filter((t) => t.status === "open")
                      .slice(0, 4)
                      .map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between px-3 py-2.5 bg-black/30 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-mono text-cyan-400 shrink-0">#{ticket.id.slice(-8)}</span>
                            <span className="text-xs text-zinc-300 truncate">{ticket.creatorName}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={PRIORITY_CONFIG[ticket.priority].variant} className="text-[10px]">
                              {PRIORITY_CONFIG[ticket.priority].label}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>

              {/* Card 2: Active Panels Preview */}
              <Card variant="glass" className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 h-7">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <LayoutGrid className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-200 tracking-wide truncate">Panels Overview</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-[10px] border-white/10 hover:border-cyan-500/30 hover:text-cyan-400 shrink-0"
                    onClick={() => handleSectionChange("panels")}
                  >
                    {panels.length > 0 ? "Manage panels" : "+ Create panel"}
                  </Button>
                </div>
                {panels.length === 0 ? (
                  <EmptyState
                    icon={LayoutGrid}
                    color="cyan"
                    compact
                    title="No panels configured"
                    description="Create a panel so members can open support tickets"
                  />
                ) : (
                  <div className="space-y-2 flex-1 flex flex-col justify-start">
                    {panels.slice(0, 4).map((panel) => (
                      <div key={panel.panelId || panel.channelId} className="flex items-center justify-between px-3 py-2.5 bg-black/30 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn("w-2 h-2 rounded-full shrink-0", panel.enabled ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-zinc-600")} />
                          <span className="text-xs text-zinc-300 font-medium truncate">
                            {panel.title || panel.channelName || panel.channelId}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {panel.ticketCount ?? 0} ticket{(panel.ticketCount ?? 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Card 3: Top Staff Leaderboard */}
              <Card variant="glass" className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 h-7">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-200 tracking-wide truncate">Top Staff Performers</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-[10px] border-white/10 hover:border-cyan-500/30 hover:text-cyan-400 shrink-0"
                    onClick={() => handleSectionChange("staff")}
                  >
                    View staff
                  </Button>
                </div>
                {staffStats.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    color="emerald"
                    compact
                    title="No staff stats recorded"
                    description="Metrics update once tickets are claimed and closed"
                  />
                ) : (
                  <div className="space-y-2 flex-1 flex flex-col justify-start">
                    {staffStats.slice(0, 4).map((member, i) => (
                      <div key={member.staffId} className="flex items-center justify-between px-3 py-2.5 bg-black/30 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono font-bold text-emerald-400 w-4 text-center">#{i + 1}</span>
                          <span className="text-xs text-zinc-200 font-medium truncate">{member.staffName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="success" className="text-[10px]">
                            {member.ticketsClosed} closed
                          </Badge>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {formatDuration(member.avgCloseTimeMinutes)} avg
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Card 4: System Health & Quick Config Status */}
              <Card variant="glass" className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 h-7">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-200 tracking-wide truncate">System Configuration</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-[10px] border-white/10 hover:border-cyan-500/30 hover:text-cyan-400 shrink-0"
                    onClick={() => handleSectionChange("settings")}
                  >
                    Settings
                  </Button>
                </div>
                <div className="space-y-2 text-xs flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between px-3 py-2.5 bg-black/30 rounded-lg border border-white/5">
                    <span className="text-zinc-400">Support Staff Role</span>
                    <span className="font-mono text-zinc-200">
                      {settings?.staffRoleName ? `@${settings.staffRoleName}` : "Not configured"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 bg-black/30 rounded-lg border border-white/5">
                    <span className="text-zinc-400">Transcripts Log Channel</span>
                    <span className="font-mono text-zinc-200">
                      {settings?.transcriptChannelName ? `#${settings.transcriptChannelName}` : "Not configured"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 bg-black/30 rounded-lg border border-white/5">
                    <span className="text-zinc-400">Auto-Close Inactive Tickets</span>
                    <span className="font-mono text-zinc-200">
                      {settings?.autoCloseDays ? `${settings.autoCloseDays} days` : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 bg-black/30 rounded-lg border border-white/5">
                    <span className="text-zinc-400">Active Panels</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {panels.filter((p) => p.enabled).length} / {panels.length} Active
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeSection === "panels" && <SectionPanels guildId={guildId} />}

        {activeSection === "tickets" && (
          <>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {(["all", "open", "closed", "archived"] as const).map((filter) => (
              <Button
                key={filter}
                variant={ticketFilter === filter ? "cyber" : "outline"}
                size="sm"
                onClick={() => setTicketFilter(filter)}
                className={cn(
                  "h-8 px-3 text-[11px] font-black uppercase tracking-widest transition-all",
                  ticketFilter === filter
                    ? "shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]"
                    : "border-white/10 hover:border-cyan-500/30 hover:text-cyan-400",
                  audiowide.className
                )}
              >
                {filter === "all" && <Ticket className="w-3 h-3 mr-1.5" />}
                {filter === "open" && <AlertCircle className="w-3 h-3 mr-1.5" />}
                {filter === "closed" && <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                {filter === "archived" && <Archive className="w-3 h-3 mr-1.5" />}
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>

          <Card variant="glass" className="overflow-hidden">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              </div>
            )}

            {!isLoading && filteredTickets.length === 0 && (
              <EmptyState
                icon={Ticket}
                color="cyan"
                title="No tickets found"
                description={
                  ticketFilter === "all"
                    ? "No tickets have been created yet."
                    : `No ${ticketFilter} tickets.`
                }
              />
            )}

            {!isLoading && filteredTickets.length > 0 && (
              <>
                <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto_auto_auto] items-center gap-4 px-4 py-2 border-b border-white/5 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  <span>Ticket</span>
                  <span>Creator</span>
                  <span>Status</span>
                  <span>Priority</span>
                  <span>Claimed</span>
                  <span>Msgs</span>
                  <span>Opened</span>
                </div>
                <div className="md:hidden grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2 border-b border-white/5 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  <span>Ticket</span>
                  <span>Status</span>
                  <span />
                </div>
                {filteredTickets.map((ticket) => (
                  <TicketRow
                    key={ticket.id}
                    ticket={ticket}
                    isExpanded={expandedTicket === ticket.id}
                    onToggle={() => toggleExpand(ticket.id)}
                  />
                ))}
              </>
            )}
          </Card>
          </>
        )}

        {activeSection === "transcripts" && (
          <Card variant="glass" className="overflow-hidden">
            {transcripts.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                color="cyan"
                title="No transcripts yet"
                description="Transcripts will appear here after tickets are closed."
              />
            ) : (
              <>
                <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-2 border-b border-white/5 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  <span>Ticket</span>
                  <span>Creator</span>
                  <span>Status</span>
                  <span>Msgs</span>
                  <span>Duration</span>
                  <span>Closed</span>
                </div>
                <div className="md:hidden grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2 border-b border-white/5 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  <span>Ticket</span>
                  <span>Duration</span>
                  <span />
                </div>
                {transcripts.map((transcript) => (
                  <TranscriptRow
                    key={transcript._id}
                    transcript={transcript}
                    isExpanded={expandedTranscript === transcript._id}
                    onToggle={() => toggleTranscriptExpand(transcript._id)}
                  />
                ))}
              </>
            )}
          </Card>
        )}

        {activeSection === "staff" && (
          <Card variant="glass" className="overflow-hidden">
            {staffStats.length === 0 ? (
              <EmptyState
                icon={Users}
                color="cyan"
                title="No staff data"
                description="Staff performance will appear once tickets are claimed and closed."
              />
            ) : (
              <>
                <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-4 py-2 border-b border-white/5 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  <span className="w-6 text-center">#</span>
                  <span>Staff Member</span>
                  <span>Tickets Closed</span>
                  <span>Avg Close Time</span>
                </div>
                {staffStats.map((member, i) => (
                  <StaffRow key={member.staffId} member={member} rank={i + 1} />
                ))}
              </>
            )}
          </Card>
        )}

        {activeSection === "settings" && (
          <SectionSettings
            guildId={guildId}
            settings={settings}
            channels={guildChannels || []}
            roles={guildRoles || []}
          />
        )}
        </div>
      </div>
    </div>
  );
}
