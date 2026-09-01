"use client";

import { useEffect, useState } from "react";
import {
  LayoutGrid,
  Power,
  PowerOff,
  Hash,
  MessageSquare,
  MessageSquareText,
  Clock,
  Trash2,
  ExternalLink,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import {
  useTicketStore,
  type TicketPanel,
} from "@/store/use-ticket-store";
import { toast } from "@/lib/toast";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PanelCard({
  guildId,
  panel,
  onToggle,
  onEdit,
  onDelete,
}: {
  guildId: string;
  panel: TicketPanel;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { refreshPanel } = useTicketStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const ok = await refreshPanel(guildId, panel.panelId);
    setIsRefreshing(false);
    if (ok) {
      toast.success("Panel message refreshed in Discord.");
    } else {
      toast.error("Failed to refresh — the panel message may have been deleted.");
    }
  };

  const categories = panel.categories || [];
  const accentColor = categories[0]?.color
    ? `#${categories[0].color.toString(16).padStart(6, "0")}`
    : "#06b6d4";
  const ticketCount = panel.ticketCount ?? 0;

  return (
    <Card variant="glass" className="relative group overflow-hidden">
      {/* Colored accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: accentColor }}
      />

      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardContent className="p-6 pl-5 relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <h4
              className="text-sm font-semibold text-white truncate"
              title={panel.title}
            >
              <MessageSquareText className="w-3.5 h-3.5 inline mr-1.5 opacity-50" />
              {panel.title || "Untitled Panel"}
            </h4>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <Hash className="w-3 h-3 text-cyan-400" />
                <span>{panel.channelName || panel.channelId}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <MessageSquare className="w-3 h-3" />
                {ticketCount} {ticketCount === 1 ? "ticket" : "tickets"}
              </div>
              {panel.lastUsedAt && (
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                  <Clock className="w-3 h-3" />
                  Last used {formatDate(panel.lastUsedAt)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {panel.enabled ? (
              <Badge
                variant="accent"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              >
                Active
              </Badge>
            ) : (
              <Badge
                variant="accent"
                className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
              >
                Disabled
              </Badge>
            )}
            {categories.length > 0 && (
              <Badge
                variant="accent"
                className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
              >
                {categories.length}{" "}
                {categories.length === 1 ? "Category" : "Categories"}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        {panel.description && (
          <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">
            {panel.description}
          </p>
        )}

        {/* Category chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {categories.slice(0, 6).map((cat) => (
              <Badge
                key={cat.id}
                variant="outline"
                className="border-white/10 bg-black/30 gap-1.5 py-1"
              >
                <span className="text-sm leading-none">{cat.emoji || "📧"}</span>
                <span className="text-[10px] font-medium text-zinc-300">
                  {cat.label}
                </span>
              </Badge>
            ))}
            {categories.length > 6 && (
              <Badge
                variant="outline"
                className="border-white/10 bg-black/30 text-zinc-500"
              >
                +{categories.length - 6} more
              </Badge>
            )}
          </div>
        )}

        {/* Action bar */}
        <div className="flex gap-2 pt-3 mt-auto border-t border-white/5">
          {panel.messageId ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-white/10 hover:bg-white/5"
              asChild
            >
              <a
                href={`https://discord.com/channels/${guildId}/${panel.channelId}/${panel.messageId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View in Discord
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="flex-1 border-white/10" disabled>
              <ExternalLink className="w-4 h-4 mr-2" />
              Not Posted
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 hover:bg-cyan-500/5 hover:border-cyan-500/20 hover:text-cyan-400 transition-colors"
            onClick={onEdit}
            title="Edit panel"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          {panel.messageId && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-cyan-500/5 hover:border-cyan-500/20 hover:text-cyan-400 transition-colors"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh panel message in Discord"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 hover:bg-amber-500/5 hover:border-amber-500/20 hover:text-amber-400 transition-colors"
            onClick={onToggle}
            title={panel.enabled ? "Disable panel" : "Enable panel"}
          >
            {panel.enabled ? (
              <PowerOff className="w-4 h-4" />
            ) : (
              <Power className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 hover:bg-red-500/5 hover:border-red-500/20 hover:text-red-400 transition-colors"
            onClick={onDelete}
            title="Delete panel"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivePanels({
  guildId,
  onEdit,
}: {
  guildId: string;
  onEdit: (panel: TicketPanel) => void;
}) {
  const { dataCache, isLoading, fetchPanels, togglePanel, deletePanel } =
    useTicketStore();
  const panels = dataCache[guildId]?.panels ?? [];

  useEffect(() => {
    if (guildId) {
      fetchPanels(guildId);
    }
  }, [guildId, fetchPanels]);

  if (isLoading && panels.length === 0) {
    return (
      <Card variant="default" className="overflow-hidden">
        <CardContent className="p-12 flex items-center justify-center relative z-10">
          <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
        </CardContent>
      </Card>
    );
  }

  if (panels.length === 0) {
    return (
      <Card variant="glass" className="overflow-hidden">
        <EmptyState
          icon={LayoutGrid}
          title="No panels configured"
          description="Create a panel so members can open support tickets."
          color="cyan"
        />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {panels.map((panel) => (
        <PanelCard
          key={panel.panelId || panel.channelId}
          guildId={guildId}
          panel={panel}
          onToggle={() => togglePanel(guildId, panel.panelId)}
          onEdit={() => onEdit(panel)}
          onDelete={() => {
            if (confirm("Delete this panel? This cannot be undone.")) {
              deletePanel(guildId, panel.panelId);
            }
          }}
        />
      ))}
    </div>
  );
}
