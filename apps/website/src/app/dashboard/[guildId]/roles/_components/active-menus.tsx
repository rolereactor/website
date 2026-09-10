"use client";

import { NodeLoader } from "@/components/common/node-loader";
import { StatePanel } from "@/components/common/state-panel";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ExternalLink,
  Hash,
  Activity,
  Trash2,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Pencil,
  MoreVertical,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/lib/toast";
import { useGuildStore } from "@/store/use-guild-store";
import { BundleSection } from "./bundle-section";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RoleConfig {
  emoji: string;
  roleId: string;
  roleName: string;
  roleColor: number;
  roleIds?: string[];
  roleNames?: string[];
  roleColors?: number[];
}

interface RoleMapping {
  messageId: string;
  channelId: string;
  channelName: string;
  embedTitle: string | null;
  embedDescription: string | null;
  embedColor: number | null;
  roles: Record<string, RoleConfig>;
  hideList: boolean;
  selectionMode?: string;
  createdAt: string;
  updatedAt: string;
}

function toHex(decimal: number) {
  if (!decimal || decimal === 0) return "#b9bbbe";
  return `#${decimal.toString(16).padStart(6, "0")}`;
}

function toEmbedColorHex(decimal: number | null) {
  if (!decimal) return "#9b8bf0";
  return `#${decimal.toString(16).padStart(6, "0")}`;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const ITEMS_PER_PAGE = 6;

import type { EditData } from "./roles-tabs";

export function ActiveMenus({
  guildId,
  onEdit,
}: {
  guildId: string;
  onEdit?: (data: EditData) => void;
}) {
  const [additionalMenus, setAdditionalMenus] = useState<RoleMapping[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreOverride, setHasMoreOverride] = useState<boolean | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Fetch guild roles to get actual Discord colors
  const { guildData, fetchRoles } = useGuildStore();
  const guildRoles = guildData[guildId]?.roles;

  useEffect(() => {
    if (!guildRoles) {
      fetchRoles(guildId);
    }
  }, [guildId, guildRoles, fetchRoles]);

  // Build a map of role ID -> color for quick lookup
  const roleColorMap = useMemo(() => {
    const map = new Map<string, number>();
    if (guildRoles) {
      for (const role of guildRoles) {
        map.set(role.id, role.color);
      }
    }
    return map;
  }, [guildRoles]);

  // Helper to get actual role color from Discord
  const getRoleColor = useCallback(
    (roleId: string, fallbackColor: number): number => {
      return roleColorMap.get(roleId) ?? fallbackColor;
    },
    [roleColorMap]
  );

  // Initial load — SWR caches page 1 data so it's available instantly on re-mount
  const { data, error, isLoading } = useSWR(
    `/api/guilds/${guildId}/role-reactions?page=1&limit=${ITEMS_PER_PAGE}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenHidden: false,
      dedupingInterval: 30_000,
    }
  );

  const firstPageMenus: RoleMapping[] = data?.roleMappings || [];
  const total = (data?.total || 0) - deletedIds.size;
  const hasMore = hasMoreOverride ?? (data?.hasMore || false);

  // Merge page 1 + additional pages, excluding deleted items
  const roleMappings = [...firstPageMenus, ...additionalMenus].filter(
    (m) => !deletedIds.has(m.messageId)
  );

  const [deleteTarget, setDeleteTarget] = useState<RoleMapping | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/guilds/${guildId}/role-reactions/${deleteTarget.messageId}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Track deleted ID so it's filtered out of both SWR data and additional pages
        setDeletedIds((prev) => new Set(prev).add(deleteTarget.messageId));
        setDeleteTarget(null);
        toast.success(data.message || "Role reaction setup deleted successfully");
      } else {
        toast.error(data.error || "Failed to delete role reaction setup");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await fetch(
        `/api/guilds/${guildId}/role-reactions?page=${nextPage}&limit=${ITEMS_PER_PAGE}`
      );
      const pageData = await res.json();
      if (pageData?.roleMappings) {
        setAdditionalMenus((prev) => [...prev, ...pageData.roleMappings]);
        setHasMoreOverride(pageData.hasMore || false);
        setCurrentPage(nextPage);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoadingMore(false);
    }
  }, [guildId, currentPage, hasMore, isLoadingMore]);

  if (error) {
    return (
      <div className="space-y-6">
        <StatePanel
          variant="error"
          icon={AlertTriangle}
          title="Data Synchronization Failed"
          description="Failed to load active setups. Please refresh the page or try again later."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-background">
        <NodeLoader
          title="Loading Dashboard"
          subtitle="Synchronizing your data..."
        />
      </div>
    );
  }

  if (roleMappings.length === 0) {
    return (
      <StatePanel
        variant="empty"
        icon={Activity}
        title="No Active Setups"
        description='You haven&apos;t created any Reaction Role setups yet. Switch to the "Create Setup" tab to get started.'
      />
    );
  }

  const deleteRoleEntries = deleteTarget
    ? Object.values(deleteTarget.roles || {})
    : [];

  // Calculate total role count across all emojis
  const deleteTotalRoles = deleteRoleEntries.reduce((acc, role) => {
    return acc + (role.roleNames?.length || 1);
  }, 0);

  return (
    <>
      {/* Bundle Section */}
      <BundleSection guildId={guildId} />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null);
        }}
      >
        <DialogContent variant="glitch" className="sm:max-w-sm">
          <div className="p-5 space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <DialogTitle
                    variant="glitch"
                    className="text-red-400! text-sm!"
                  >
                    Delete Setup
                  </DialogTitle>
                  <DialogDescription
                    variant="glitch"
                    className="text-zinc-500! text-[11px]!"
                  >
                    This action cannot be undone
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {deleteTarget && (
              <>
                {/* Setup preview */}
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[13px] font-medium text-white truncate">
                      {deleteTarget.embedTitle || "Untitled Setup"}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-[9px] h-4 px-1.5 border-white/5 bg-zinc-800/50 text-zinc-400 shrink-0"
                    >
                      {deleteTotalRoles}{" "}
                      {deleteTotalRoles === 1 ? "role" : "roles"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mb-2">
                    <Hash className="w-2.5 h-2.5 text-zinc-600" />
                    {deleteTarget.channelName}
                  </div>
                  {deleteRoleEntries.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {deleteRoleEntries.slice(0, 4).map((role) => {
                        const rolesForEmoji = role.roleNames?.length
                          ? role.roleNames
                          : [role.roleName];
                        const roleIdsForEmoji = role.roleIds?.length
                          ? role.roleIds
                          : [role.roleId];
                        const storedColors = role.roleIds?.length
                          ? (role.roleColors || rolesForEmoji.map(() => role.roleColor))
                          : [role.roleColor];
                        const colorsForEmoji = roleIdsForEmoji.map((id, i) =>
                          getRoleColor(id, storedColors[i] || 0)
                        );

                        return (
                          <Badge
                            key={role.emoji}
                            variant="outline"
                            className="border-white/5 bg-zinc-800/50 gap-1 py-0.5 text-[10px]"
                          >
                            <span>
                              {role.emoji.startsWith("<") ? "✦" : role.emoji}
                            </span>
                            {rolesForEmoji.map((name, i) => (
                              <span key={i} className="whitespace-nowrap">
                                <span style={{ color: toHex(colorsForEmoji[i] || 0) }}>
                                  @{name}
                                </span>
                                {i < rolesForEmoji.length - 1 && (
                                  <span className="text-zinc-600">, </span>
                                )}
                              </span>
                            ))}
                          </Badge>
                        );
                      })}
                      {deleteRoleEntries.length > 4 && (
                        <Badge
                          variant="outline"
                          className="border-white/5 bg-zinc-800/50 text-zinc-500 text-[10px]"
                        >
                          +{deleteRoleEntries.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Warning */}
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  This will{" "}
                  <strong className="text-red-400">permanently delete</strong>{" "}
                  the role-reaction message from Discord and remove its data.
                  Members will no longer be able to self-assign roles from this
                  setup.
                </p>
              </>
            )}

            <DialogFooter className="gap-2 sm:gap-2 pt-0">
              <Button
                variant="ghost"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="h-8 px-3 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={handleDelete}
                className="h-8 px-3"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Setup Cards */}
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {roleMappings.map((menu) => {
            const roleEntries = Object.values(menu.roles || {});
            const roleCount = roleEntries.length;
            const embedColorHex = toEmbedColorHex(menu.embedColor);

            return (
              <Card
                key={menu.messageId}
                variant="glass"
                className="relative group min-h-full"
              >
                {/* Colored accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ backgroundColor: embedColorHex }}
                />

                {/* Hover gradient */}
                <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardContent className="p-4 pl-5 relative z-10 flex flex-col h-full min-h-0 overflow-hidden">
                  {/* Embed Title + Description */}
                  <div className="mb-2.5 shrink-0">
                    {menu.embedTitle && (
                      <h4 className="text-[13px] font-semibold text-white mb-0.5 truncate">
                        {menu.embedTitle}
                      </h4>
                    )}
                    {menu.embedDescription && (
                      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                        {menu.embedDescription}
                      </p>
                    )}
                  </div>

                  {/* Roles - grouped by emoji */}
                  <div className="space-y-1 mb-3 min-h-0 flex-1 overflow-hidden">
                    {roleEntries.slice(0, 6).map((role) => {
                      const rolesForEmoji = role.roleNames?.length
                        ? role.roleNames
                        : [role.roleName];
                      const roleIdsForEmoji = role.roleIds?.length
                        ? role.roleIds
                        : [role.roleId];
                      const storedColors = role.roleIds?.length
                        ? (role.roleColors || rolesForEmoji.map(() => role.roleColor))
                        : [role.roleColor];
                      const colorsForEmoji = roleIdsForEmoji.map((id, i) =>
                        getRoleColor(id, storedColors[i] || 0)
                      );

                      return (
                        <div key={role.emoji} className="flex items-start gap-1.5">
                          <span className="text-sm leading-none shrink-0 mt-0.5">
                            {role.emoji.startsWith("<") ? "✦" : role.emoji}
                          </span>
                          <div className="flex flex-wrap gap-x-0.5 gap-y-0.5 min-w-0 text-[11px] overflow-hidden">
                            {rolesForEmoji.map((name, i) => (
                              <span key={i} className="whitespace-nowrap">
                                <span
                                  className="font-medium"
                                  style={{ color: toHex(colorsForEmoji[i] || 0) }}
                                >
                                  @{name}
                                </span>
                                {i < rolesForEmoji.length - 1 && (
                                  <span className="text-zinc-600">, </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {roleCount > 6 && (
                      <p className="text-[10px] text-zinc-500 pl-6">
                        +{roleCount - 6} more
                      </p>
                    )}
                  </div>

                  {/* Footer region - fixed height */}
                  <div className="shrink-0">
                    {/* Divider */}
                    <div className="h-px bg-white/5" />

                    {/* Metadata + Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2.5 h-9">
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 min-w-0">
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3 text-cyan-400/70" />
                          <span className="truncate">{menu.channelName}</span>
                        </div>
                        <span className="text-zinc-700">•</span>
                        {menu.selectionMode === "unique" ? (
                          <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-amber-500/30 text-amber-400 bg-amber-500/5">
                            Unique
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-white/10 text-zinc-400 bg-white/5">
                            Toggle
                          </Badge>
                        )}
                        <span className="text-zinc-700">•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-600" />
                          <span>{formatRelativeTime(menu.updatedAt)}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-500 hover:text-white hover:bg-white/5"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(
                                `https://discord.com/channels/${guildId}/${menu.channelId}/${menu.messageId}`,
                                "_blank"
                              )
                            }
                            className="gap-2 text-zinc-400 focus:text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View in Discord
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (!onEdit) return;
                              const roles = menu.roles || {};
                              const reactions = Object.entries(roles).map(
                                ([emoji, config]) => {
                                  const c = config as RoleConfig;
                            return {
                              emoji,
                              roleId: c.roleId ?? "",
                              roleName: c.roleName ?? "",
                              roleColor: c.roleColor ?? 0,
                              roleIds:
                                c.roleIds ?? (c.roleId ? [c.roleId] : []),
                              roleNames:
                                c.roleNames ?? (c.roleName ? [c.roleName] : []),
                              roleColors:
                                c.roleColors ??
                                (c.roleIds ?? [c.roleId]).map(
                                  () => c.roleColor ?? 0
                                ),
                            };
                                }
                              );
                              onEdit({
                                messageId: menu.messageId,
                                title: menu.embedTitle || "Role Reactions",
                                description:
                                  menu.embedDescription || "React to get a role!",
                                color: toEmbedColorHex(menu.embedColor),
                                hideList: menu.hideList || false,
                                selectionMode: menu.selectionMode || "standard",
                                channelId: menu.channelId,
                                channelName: menu.channelName,
                                reactions,
                              });
                            }}
                            className="gap-2 text-zinc-400 focus:text-cyan-400"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit Setup
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(menu)}
                            className="gap-2 text-zinc-400 focus:text-red-400 focus:bg-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isLoadingMore}
              className="border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white gap-2"
              onClick={loadMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show More ({total - roleMappings.length} remaining)
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
