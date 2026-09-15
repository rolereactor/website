"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useServerStore } from "@/store/use-server-store";
import { useEmojiStore } from "@/store/use-emoji-store";
import { useGuildStore } from "@/store/use-guild-store";
import { DiscordRole, DiscordEmoji, DiscordChannel } from "@/types/discord";
import { toast } from "@/lib/toast";
import {
  deployReactionRoles,
  updateReactionRoles,
} from "@/app/dashboard/_actions/roles";
import { mutate } from "swr";
import { useProEngineStore } from "@/store/use-pro-engine-store";
import type { EditData } from "@/app/dashboard/[guildId]/roles/_components/roles-tabs";

const EMPTY_EMOJIS: DiscordEmoji[] = [];

export interface ReactionMapping {
  emoji: string;
  roleName: string;
  roleId: string;
  roleColor: number;
  // Multi-role support (bundles/arrays)
  roleIds?: string[];
  roleNames?: string[];
  roleColors?: number[];
}

export function useRoleBuilder(
  propGuildId?: string,
  editData?: EditData | null
) {
  const params = useParams();
  const guildId = propGuildId || (params.guildId as string);
  const { guilds } = useServerStore();

  const fetchEmojis = useEmojiStore((state) => state.fetchEmojis);
  const serverEmojis = useEmojiStore(
    (state) => state.guildEmojis[guildId] || EMPTY_EMOJIS
  );
  const isLoadingEmojis = useEmojiStore(
    (state) => state.isLoading[guildId] || false
  );
  const emojiError = useEmojiStore((state) => state.errors[guildId] || null);
  const hasFetchedEmojis = useEmojiStore(
    (state) => state.lastFetched[guildId] !== undefined
  );

  const currentGuild = useMemo(
    () => guilds.find((g) => g.id === guildId),
    [guilds, guildId]
  );

  const guildIconUrl = useMemo(() => {
    if (currentGuild?.icon) {
      return `https://cdn.discordapp.com/icons/${guildId}/${currentGuild.icon}.png`;
    }
    return null;
  }, [currentGuild, guildId]);

  const [title, setTitle] = useState(editData?.title || "Role Reactions");
  const [description, setDescription] = useState(
    editData?.description ||
      "Choose which updates you'd like to receive by reacting below. You can toggle these roles at any time!"
  );
  const [color, setColor] = useState(editData?.color || "#9b8bf0");
  const [reactions, setReactions] = useState<ReactionMapping[]>(
    editData?.reactions || []
  );
  const [selectedChannel, setSelectedChannel] = useState(
    editData?.channelId || ""
  );
  const [selectionMode, setSelectionMode] = useState(
    editData?.selectionMode || "standard"
  );
  const [hideList, setHideList] = useState(editData?.hideList || false);
  const [isActivatingPremium, setIsActivatingPremium] = useState(false);

  // Re-populate form when editData changes (e.g., clicking edit on a different card)
  useEffect(() => {
    if (editData) {
      setTitle(editData.title);
      setDescription(editData.description);
      setColor(editData.color);
      setReactions(editData.reactions);
      setSelectedChannel(editData.channelId);
      setSelectionMode(editData.selectionMode);
      setHideList(editData.hideList);
    }
  }, [editData]);

  const [debouncedTitle, setDebouncedTitle] = useState(title);
  const [debouncedDescription, setDebouncedDescription] = useState(description);
  const [debouncedColor, setDebouncedColor] = useState(color);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTitle(title), 150);
    return () => clearTimeout(t);
  }, [title]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedDescription(description), 150);
    return () => clearTimeout(t);
  }, [description]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedColor(color), 100);
    return () => clearTimeout(t);
  }, [color]);

  const [openEmojiPicker, setOpenEmojiPicker] = useState<number | null>(null);

  const {
    guildData,
    fetchRoles,
    fetchChannels,
    isLoading: storeLoading,
  } = useGuildStore();

  const proSettings = useProEngineStore((state) =>
    state.currentGuildId === guildId
      ? state.settingsCache[guildId] ?? null
      : null,
  );
  const fetchProSettings = useProEngineStore((state) => state.fetchSettings);

  const serverRoles = useMemo(() => {
    const roles = guildData[guildId]?.roles || [];
    return roles.filter(
      (r: DiscordRole) => r.name !== "@everyone" && !r.managed
    );
  }, [guildData, guildId]);

  // Sync reaction colors with actual Discord colors from serverRoles
  useEffect(() => {
    if (serverRoles.length === 0) return;

    setReactions((prev) =>
      prev.map((r) => {
        const roleIds = r.roleIds?.length ? r.roleIds : r.roleId ? [r.roleId] : [];
        const needsUpdate = roleIds.some((id) => {
          const serverRole = serverRoles.find((sr) => sr.id === id);
          return serverRole && serverRole.color !== 0;
        });

        if (!needsUpdate) return r;

        const updatedRoleColors = roleIds.map((id, idx) => {
          const serverRole = serverRoles.find((sr) => sr.id === id);
          return serverRole?.color ?? r.roleColors?.[idx] ?? r.roleColor ?? 0;
        });

        return {
          ...r,
          roleColor: updatedRoleColors[0] ?? r.roleColor,
          roleColors: updatedRoleColors,
        };
      })
    );
  }, [serverRoles]);

  const serverChannels = useMemo(() => {
    const channels = guildData[guildId]?.channels || [];
    return channels.filter((ch: DiscordChannel) => ch.type === 0);
  }, [guildData, guildId]);

  const isPremium = proSettings?.isPremium?.pro || false;

  const isLoadingRoles =
    (storeLoading[guildId]?.roles ?? true) &&
    (guildData[guildId]?.roles === null ||
      guildData[guildId]?.roles === undefined);
  const isLoadingChannels =
    (storeLoading[guildId]?.channels ?? true) &&
    (guildData[guildId]?.channels === null ||
      guildData[guildId]?.channels === undefined);

  // Validation
  const validation = useMemo(() => {
    const hasTitle = title.trim().length > 0;
    const hasDescription = description.trim().length > 0;
    const hasReactions = reactions.length > 0;
    const hasChannel = selectedChannel.length > 0;
    const incompleteReactions = reactions.filter(
      (r) => (!r.roleId && !r.roleIds?.length) || !r.emoji
    );
    const isReady =
      hasTitle &&
      hasDescription &&
      hasReactions &&
      hasChannel &&
      incompleteReactions.length === 0;

    return {
      hasTitle,
      hasDescription,
      hasReactions,
      hasChannel,
      incompleteReactions,
      isReady,
    };
  }, [title, description, reactions, selectedChannel]);

  useEffect(() => {
    if (!guildId) return;

    fetchRoles(guildId);
    fetchChannels(guildId);
    fetchProSettings(guildId);
    fetchEmojis(guildId);
  }, [guildId, fetchRoles, fetchChannels, fetchProSettings, fetchEmojis]);

  useEffect(() => {
    if (serverRoles.length > 0) {
      setReactions((prev) =>
        prev.map((r) => {
          if (!r.roleId && r.roleName) {
            const matched = serverRoles.find(
              (sr: DiscordRole) => sr.name === r.roleName
            );
            if (matched) {
              return {
                ...r,
                roleId: matched.id,
                roleName: matched.name,
                roleColor: matched.color,
              };
            }
          }
          return r;
        })
      );
    }
  }, [serverRoles]);

  const addReaction = useCallback(() => {
    setReactions((prev) => [
      ...prev,
      {
        emoji: "🔘",
        roleName: "",
        roleId: "",
        roleColor: 0,
        roleIds: [],
        roleNames: [],
        roleColors: [],
      },
    ]);
  }, []);

  const removeReaction = useCallback((index: number) => {
    setReactions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateReaction = useCallback(
    (index: number, updates: Partial<ReactionMapping>) => {
      setReactions((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...updates };
        return next;
      });
    },
    []
  );

  const handleActivatePremium = useCallback(async () => {
    if (isActivatingPremium) return;
    setIsActivatingPremium(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/premium/activate`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Pro Engine activated successfully!");
        await fetchProSettings(guildId, true);
        return true;
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to activate Pro Engine");
        return false;
      }
    } catch {
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsActivatingPremium(false);
    }
  }, [guildId, isActivatingPremium, fetchProSettings]);

  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = useCallback(async () => {
    if (!validation.isReady || isDeploying) return;

    setIsDeploying(true);
    const deployToastId = toast.loading("Deploying system links...");

    try {
      const result = await deployReactionRoles(guildId, {
        title,
        description,
        color,
        channelId: selectedChannel,
        selectionMode,
        hideList,
        reactions,
      });

      if (result.success) {
        toast.success(result.message, { id: deployToastId });
        mutate(
          (key: unknown) =>
            typeof key === "string" &&
            key.startsWith(`/api/guilds/${guildId}/role-reactions`),
          undefined,
          { revalidate: true }
        );
        return true;
      } else {
        toast.error(result.message || "Deployment failed", {
          id: deployToastId,
        });
        return false;
      }
    } catch {
      toast.error("An unexpected error occurred during deployment", {
        id: deployToastId,
      });
      return false;
    } finally {
      setIsDeploying(false);
    }
  }, [
    guildId,
    title,
    description,
    color,
    selectedChannel,
    selectionMode,
    hideList,
    reactions,
    validation.isReady,
    isDeploying,
  ]);

  const handleUpdate = useCallback(async () => {
    if (!editData?.messageId || !validation.isReady || isDeploying)
      return false;

    setIsDeploying(true);
    const updateToastId = toast.loading("Updating setup...");

    try {
      const result = await updateReactionRoles(guildId, editData.messageId, {
        title,
        description,
        color,
        selectionMode,
        hideList,
        reactions,
      });

      if (result.success) {
        toast.success(result.message, { id: updateToastId });
        mutate(
          (key: unknown) =>
            typeof key === "string" &&
            key.startsWith(`/api/guilds/${guildId}/role-reactions`),
          undefined,
          { revalidate: true }
        );
        return true;
      } else {
        toast.error(result.message || "Update failed", {
          id: updateToastId,
        });
        return false;
      }
    } catch {
      toast.error("An unexpected error occurred during update", {
        id: updateToastId,
      });
      return false;
    } finally {
      setIsDeploying(false);
    }
  }, [
    guildId,
    editData?.messageId,
    title,
    description,
    color,
    selectionMode,
    hideList,
    reactions,
    validation.isReady,
    isDeploying,
  ]);

  return {
    guildId,
    currentGuild,
    guildIconUrl,
    title,
    setTitle,
    description,
    setDescription,
    color,
    setColor,
    reactions,
    setReactions,
    serverRoles,
    serverChannels,
    selectedChannel,
    setSelectedChannel,
    isLoadingRoles,
    isLoadingChannels,
    selectionMode,
    setSelectionMode,
    hideList,
    setHideList,
    debouncedTitle,
    debouncedDescription,
    debouncedColor,
    validation,
    serverEmojis,
    isLoadingEmojis,
    emojiError,
    hasFetchedEmojis,
    fetchEmojis,
    openEmojiPicker,
    setOpenEmojiPicker,
    addReaction,
    removeReaction,
    updateReaction,
    isPremium,
    proSettings,
    isActivatingPremium,
    handleActivatePremium,
    isDeploying,
    handleDeploy,
    handleUpdate,
  };
}
