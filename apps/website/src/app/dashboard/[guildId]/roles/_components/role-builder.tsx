"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DiscordPreview } from "./discord-preview";
import { PremiumGuard } from "../../../_components/premium-guard";
import { useRoleBuilder, type ReactionMapping } from "@/hooks/use-role-builder";
import {
  EmojiPicker,
  EmojiPickerTrigger,
  EmojiPickerContent,
  EmojiDisplay,
} from "@/components/ui/emoji-picker";
import { NodeLoader } from "@/components/common/node-loader";
import {
  Plus,
  Trash2,
  Rocket,
  Shield,
  Info,
  Layers,
  MousePointer2,
  Zap,
  Hash,
  Package,
} from "lucide-react";
import { DiscordRole, DiscordChannel, DiscordEmoji } from "@/types/discord";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RoleBundle {
  _id: string;
  guildId: string;
  name: string;
  roles: Array<{ roleId: string; roleName: string }>;
}

const PRESET_COLORS = [
  { name: "Default", hex: "#9b8bf0" },
  { name: "Neon Blue", hex: "#00BFFF" },
  { name: "Matrix Green", hex: "#00FF00" },
  { name: "Cyber Red", hex: "#FF0040" },
  { name: "Electric Yellow", hex: "#FFFF00" },
  { name: "Quantum Purple", hex: "#8A2BE2" },
  { name: "Plasma Orange", hex: "#FF4500" },
  { name: "Synth Pink", hex: "#FF1493" },
  { name: "Hologram Cyan", hex: "#00FFFF" },
  { name: "Steel Brown", hex: "#8B4513" },
  { name: "Chrome Gray", hex: "#C0C0C0" },
];

function toHex(decimal: number) {
  if (!decimal || decimal === 0) return "#b9bbbe";
  return `#${decimal.toString(16).padStart(6, "0")}`;
}

import type { EditData } from "./roles-tabs";

interface RoleBuilderProps {
  guildId?: string;
  editData?: EditData | null;
  onCancelEdit?: () => void;
  onSaveComplete?: () => void;
}

export function RoleBuilder({
  guildId: propGuildId,
  editData,
  onCancelEdit,
  onSaveComplete,
}: RoleBuilderProps) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Fetch bundles
  const { data: bundlesData } = useSWR(
    propGuildId ? `/api/guilds/${propGuildId}/role-bundles` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  const bundles: RoleBundle[] = bundlesData?.bundles || [];

  const {
    guildId,
    guildIconUrl,
    title,
    setTitle,
    description,
    setDescription,
    color,
    setColor,
    reactions,
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
    isActivatingPremium,
    handleActivatePremium,
    isDeploying,
    handleDeploy,
    handleUpdate,
    maxRolesPerEmoji,
  } = useRoleBuilder(propGuildId, editData);

  if (isLoadingRoles) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-background">
        <NodeLoader
          title="Loading Dashboard"
          subtitle="Synchronizing your data..."
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_520px] gap-6 items-start">
        {/* Configuration Form */}

        <div className="space-y-8 order-2 xl:order-1">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Configuration</h3>
            <Card variant="cyberpunk" showGrid>
              <CardContent className="p-6 space-y-6">
                <ConfigurationFields
                  title={title}
                  setTitle={setTitle}
                  description={description}
                  setDescription={setDescription}
                  color={color}
                  setColor={setColor}
                  validation={validation}
                />

                <ChannelSelector
                  channels={serverChannels}
                  selectedChannel={selectedChannel}
                  setSelectedChannel={setSelectedChannel}
                  isLoadingChannels={isLoadingChannels}
                  disabled={!!editData}
                />

                <SelectionModePicker
                  mode={selectionMode}
                  setMode={setSelectionMode}
                  isPremium={isPremium}
                  setShowPremiumModal={setShowPremiumModal}
                />

                {/* Hide Role List Toggle */}
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Hide Role List</Label>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      When enabled, the embed won&apos;t show the "Available
                      Roles" field. Useful if you describe roles in the
                      description.
                    </p>
                  </div>
                  <Switch checked={hideList} onCheckedChange={setHideList} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reaction Role Mappings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Role Mappings</h3>
              <Button variant="outline" size="sm" onClick={addReaction}>
                <Plus className="w-4 h-4 mr-2" />
                Add Mapping
              </Button>
            </div>

            <Card variant="cyberpunk">
              <CardContent className="p-4 space-y-2">
                <RoleMappingList
                  reactions={reactions}
                  removeReaction={removeReaction}
                  updateReaction={updateReaction}
                  serverRoles={serverRoles}
                  isLoadingRoles={isLoadingRoles}
                  serverEmojis={serverEmojis}
                  openEmojiPicker={openEmojiPicker}
                  setOpenEmojiPicker={setOpenEmojiPicker}
                  guildId={guildId}
                  isLoadingEmojis={isLoadingEmojis}
                  hasFetchedEmojis={hasFetchedEmojis}
                  emojiError={emojiError}
                  fetchEmojis={fetchEmojis}
                  guildIconUrl={guildIconUrl}
                  bundles={bundles}
                  maxRolesPerEmoji={maxRolesPerEmoji}
                />
                {reactions.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-zinc-600 text-sm italic">
                      Add a mapping to get started...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <Button
              disabled={!validation.isReady || isDeploying}
              variant="cyber"
              size="lg"
              className="w-full h-14 px-10 tracking-widest"
              onClick={async () => {
                let success;
                if (editData) {
                  success = await handleUpdate();
                } else {
                  success = await handleDeploy();
                }
                if (success && onSaveComplete) {
                  onSaveComplete();
                }
              }}
            >
              <Rocket
                className={cn("w-4 h-4 mr-2", isDeploying && "animate-bounce")}
              />
              {isDeploying
                ? "Synchronizing..."
                : editData
                  ? "Update Discord Panel"
                  : "Create Discord Panel"}
            </Button>
            {editData && onCancelEdit && (
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white/10"
                onClick={onCancelEdit}
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </div>

        {/* Live Preview */}

        <div className="space-y-4 order-1 xl:order-2 sticky top-24">
          <h3 className="text-lg font-medium">Discord Preview</h3>
          <div className="relative group transition-all">
            <DiscordPreview
              title={debouncedTitle}
              description={debouncedDescription}
              color={debouncedColor}
              hideList={hideList}
              reactions={reactions}
              serverEmojis={serverEmojis}
              serverRoles={serverRoles}
            />
          </div>
          <PreviewInfo />
        </div>
      </div>
      <PremiumGuard
        open={showPremiumModal}
        onOpenChange={setShowPremiumModal}
        isActivating={isActivatingPremium}
        onActivate={handleActivatePremium}
      />
    </>
  );
}

// Sub-components

interface ConfigurationFieldsProps {
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  color: string;
  setColor: (val: string) => void;
  validation: {
    hasTitle: boolean;
    hasDescription: boolean;
  };
}

function ConfigurationFields({
  title,
  setTitle,
  description,
  setDescription,
  color,
  setColor,
  validation,
}: ConfigurationFieldsProps) {
  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Embed Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Rank Selection"
            className={cn(
              !validation.hasTitle && title.length > 0 && "border-red-500/50"
            )}
          />
          {!validation.hasTitle && (
            <p className="text-[10px] text-red-500 font-medium px-1">
              Title is required
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell users what to do..."
            className={cn(
              "min-h-35 resize-none",
              !validation.hasDescription &&
                description.length > 0 &&
                "border-destructive"
            )}
          />
          {!validation.hasDescription && (
            <p className="text-xs text-destructive font-medium">
              Description is required
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Embed Color</Label>
          <div className="flex gap-2">
            <Select
              value={
                PRESET_COLORS.find(
                  (c) => c.hex.toLowerCase() === color.toLowerCase()
                )?.name || "Custom"
              }
              onValueChange={(val) => {
                const preset = PRESET_COLORS.find((c) => c.name === val);
                if (preset) setColor(preset.hex);
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: color }}
                    />
                    {PRESET_COLORS.find(
                      (c) => c.hex.toLowerCase() === color.toLowerCase()
                    )?.name || "Custom Color"}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PRESET_COLORS.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
                {!PRESET_COLORS.some(
                  (c) => c.hex.toLowerCase() === color.toLowerCase()
                ) && (
                  <SelectItem value="Custom" disabled>
                    Custom Hex
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-25 font-mono uppercase"
            />
          </div>
        </div>
      </div>
    </>
  );
}

interface ChannelSelectorProps {
  channels: DiscordChannel[];
  selectedChannel: string;
  setSelectedChannel: (val: string) => void;
  isLoadingChannels: boolean;
  disabled?: boolean;
}

function ChannelSelector({
  channels,
  selectedChannel,
  setSelectedChannel,
  isLoadingChannels,
  disabled,
}: ChannelSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Target Channel</Label>
      <Select
        value={selectedChannel}
        onValueChange={setSelectedChannel}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a channel..." />
        </SelectTrigger>
        <SelectContent className="max-h-75">
          {channels.length > 0 ? (
            channels.map((ch: DiscordChannel) => (
              <SelectItem key={ch.id} value={ch.id}>
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 opacity-50" />
                  {ch.name}
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-[11px] text-zinc-500 italic text-center">
              {isLoadingChannels
                ? "Fetching channels..."
                : "No text channels found"}
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

interface SelectionModePickerProps {
  mode: string;
  setMode: (val: string) => void;
  isPremium: boolean;
  setShowPremiumModal: (val: boolean) => void;
}

function SelectionModePicker({
  mode,
  setMode,
  isPremium,
  setShowPremiumModal,
}: SelectionModePickerProps) {
  const modes = [
    {
      id: "standard",
      label: "Toggle",
      icon: Layers,
      desc: "Multiple roles allowed. Click to Add/Remove.",
      color: "blue",
    },
    {
      id: "unique",
      label: "Unique",
      icon: MousePointer2,
      desc: "Strictly one role allowed. Swaps on click.",
      color: "amber",
      premium: true,
    },
  ];

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between px-1">
        <Label className="flex items-center gap-2">Selection Mode</Label>
        {mode !== "standard" && (
          <div className="flex items-center gap-1 bg-amber-500/10 px-2 rounded-full border border-amber-500/20">
            <Zap className="w-2.5 h-2.5 text-amber-400" />
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-tighter">
              Premium
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {modes.map((m) => {
          const isActive = mode === m.id;
          const isToggle = m.id === "standard";
          const isUnique = m.id === "unique";

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                if (m.premium && !isPremium) {
                  setShowPremiumModal(true);
                  return;
                }
                setMode(m.id);
              }}
              className={cn(
                "relative h-20 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-200 overflow-hidden group/btn cursor-pointer",
                // Default (inactive)
                !isActive && "border-white/8 bg-white/3 hover:bg-white/6",
                // Toggle active
                isActive &&
                  isToggle && [
                    "border-cyan-500/60 bg-cyan-500/10",
                    "shadow-[0_0_24px_rgba(6,182,212,0.18)]",
                  ],
                // Toggle hover (inactive)
                !isActive &&
                  isToggle &&
                  "hover:border-cyan-500/30 hover:bg-cyan-500/5",
                // Unique active
                isActive &&
                  isUnique && [
                    "border-amber-500/60 bg-amber-500/10",
                    "shadow-[0_0_24px_rgba(245,158,11,0.18)]",
                  ],
                // Unique hover (inactive)
                !isActive &&
                  isUnique &&
                  "hover:border-amber-500/30 hover:bg-amber-500/5"
              )}
            >
              {/* Active glow overlay */}
              {isActive && (
                <div
                  className={cn(
                    "absolute inset-0 opacity-6 bg-radial-[ellipse_at_center]",
                    isToggle && "from-cyan-400 to-transparent",
                    isUnique && "from-amber-400 to-transparent"
                  )}
                />
              )}

              {/* Icon */}
              <m.icon
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isActive &&
                    isToggle &&
                    "text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]",
                  isActive &&
                    isUnique &&
                    "text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]",
                  !isActive &&
                    isToggle &&
                    "text-zinc-500 group-hover/btn:text-cyan-400/70 transition-colors",
                  !isActive &&
                    isUnique &&
                    "text-zinc-500 group-hover/btn:text-amber-400/70 transition-colors"
                )}
              />

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.18em] transition-colors duration-200",
                  isActive && isToggle && "text-cyan-400",
                  isActive && isUnique && "text-amber-400",
                  !isActive &&
                    isToggle &&
                    "text-zinc-500 group-hover/btn:text-cyan-400/70",
                  !isActive &&
                    isUnique &&
                    "text-zinc-500 group-hover/btn:text-amber-400/70"
                )}
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-zinc-500 font-medium px-1 leading-relaxed">
        {mode === "standard" &&
          "Standard behavior: Reacting to an emoji adds the role, reacting again removes it."}
        {mode === "unique" &&
          "Users can only have one role from this group. Selecting a new one cancels the previous selection."}
      </p>
    </div>
  );
}

interface RoleMappingListProps {
  reactions: ReactionMapping[];
  removeReaction: (idx: number) => void;
  updateReaction: (idx: number, updates: Partial<ReactionMapping>) => void;
  serverRoles: DiscordRole[];
  isLoadingRoles: boolean;
  serverEmojis: DiscordEmoji[];
  openEmojiPicker: number | null;
  setOpenEmojiPicker: (idx: number | null) => void;

  guildId: string;
  isLoadingEmojis: boolean;
  hasFetchedEmojis: boolean;
  emojiError: string | null;
  fetchEmojis: (guildId: string, force?: boolean) => void;
  guildIconUrl: string | null;
  bundles: RoleBundle[];
  maxRolesPerEmoji: number;
}

function RoleMappingList({
  reactions,
  removeReaction,
  updateReaction,
  serverRoles,
  isLoadingRoles,
  serverEmojis,
  openEmojiPicker,
  setOpenEmojiPicker,

  guildId,
  isLoadingEmojis,
  hasFetchedEmojis,
  emojiError,
  fetchEmojis,
  guildIconUrl,
  bundles,
  maxRolesPerEmoji,
}: RoleMappingListProps) {
  const customEmojis = useMemo(() => {
    return serverEmojis.map((emoji: DiscordEmoji) => ({
      id: emoji.identifier,
      name: emoji.name,
      keywords: [emoji.name, emoji.id],
      skins: [{ src: emoji.url }],
    }));
  }, [serverEmojis]);

  return (
    <>
      {reactions.map((r: ReactionMapping, i: number) => {
        // Multi-role: use roleIds/roleNames if available, otherwise fall back to single
        const selectedRoleIds = r.roleIds?.length
          ? r.roleIds
          : r.roleId
            ? [r.roleId]
            : [];
        const selectedRoleNames = r.roleNames?.length
          ? r.roleNames
          : r.roleName
            ? [r.roleName]
            : [];
        // Get colors from stored data, fallback to serverRoles for actual Discord colors
        const selectedRoleColors = r.roleColors?.length
          ? r.roleIds?.map((id, idx) => {
              const serverRole = serverRoles.find((sr: DiscordRole) => sr.id === id);
              return serverRole?.color ?? r.roleColors?.[idx] ?? r.roleColor ?? 0;
            }) ?? r.roleColors
          : r.roleColor
            ? [r.roleColor]
            : [];

        const availableRoles = serverRoles.filter(
          (sr: DiscordRole) => !selectedRoleIds.includes(sr.id)
        );

        return (
          <Card
            key={i}
            variant="glass"
            className="group p-3 rounded-lg hover:bg-white/5 border-transparent hover:border-white/10 transition-colors"
            contentClassName="flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <EmojiPicker
                open={openEmojiPicker === i}
                onOpenChange={(open) => setOpenEmojiPicker(open ? i : null)}
                guildId={guildId}
                isLoadingEmojis={isLoadingEmojis}
                hasFetchedEmojis={hasFetchedEmojis}
                emojiError={emojiError}
                onRefresh={() => fetchEmojis(guildId, true)}
                customEmojis={customEmojis}
                guildIconUrl={guildIconUrl}
                onEmojiSelect={(emoji) => {
                  const val = emoji.native || emoji.id;
                  updateReaction(i, { emoji: val });
                  setOpenEmojiPicker(null);
                }}
              >
                <EmojiPickerTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-11 w-11 shrink-0 relative group/emoji transition-all duration-200",
                      openEmojiPicker === i &&
                        "border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_20px_0_rgba(6,182,212,0.2)] scale-105"
                    )}
                    title="Click to select emoji"
                  >
                    <EmojiDisplay
                      emoji={r.emoji}
                      serverEmojis={serverEmojis}
                      className="z-10"
                    />
                  </Button>
                </EmojiPickerTrigger>
                <EmojiPickerContent align="start" side="top" sideOffset={8} />
              </EmojiPicker>

              <div className="flex-1">
                <Select
                  value=""
                  onValueChange={(val) => {
                    if (selectedRoleIds.length >= maxRolesPerEmoji) {
                      toast.error(`Maximum ${maxRolesPerEmoji} roles per emoji. Remove a role first.`);
                      return;
                    }
                    const role = serverRoles.find(
                      (sr: DiscordRole) => sr.id === val
                    );
                    if (role) {
                      const newRoleIds = [...selectedRoleIds, role.id];
                      const newRoleNames = [...selectedRoleNames, role.name];
                      const newRoleColors = [...selectedRoleColors, role.color];
                      updateReaction(i, {
                        roleId: newRoleIds[0],
                        roleName: newRoleNames[0],
                        roleColor: newRoleColors[0],
                        roleIds: newRoleIds,
                        roleNames: newRoleNames,
                        roleColors: newRoleColors,
                      });
                    }
                  }}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue
                      placeholder={
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Shield className="w-3.5 h-3.5" />
                          <span>
                            {isLoadingRoles
                              ? "Loading..."
                              : selectedRoleIds.length > 0
                                ? "Add another role..."
                                : "Select a role..."}
                          </span>
                        </div>
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="min-w-50">
                    {availableRoles.length > 0 ? (
                      availableRoles.map((role: DiscordRole) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: toHex(role.color) }}
                            />
                            <span style={{ color: toHex(role.color) }}>
                              {role.name}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-xs text-muted-foreground italic text-center">
                        {isLoadingRoles
                          ? "Fetching roles..."
                          : "No roles available"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Bundle Selector */}
              {bundles.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-2 shrink-0 border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10"
                      title="Use a role bundle"
                    >
                      <Package className="w-4 h-4 text-purple-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
                    {bundles.map((bundle) => (
                      <DropdownMenuItem
                        key={bundle._id}
                        className="flex items-center gap-2 cursor-pointer focus:bg-purple-500/10"
                        onSelect={() => {
                          // Check per-emoji role limit before adding
                          const newRoleIds = [
                            ...selectedRoleIds,
                            ...bundle.roles
                              .map((r) => r.roleId)
                              .filter((id) => !selectedRoleIds.includes(id)),
                          ];
                          if (newRoleIds.length > maxRolesPerEmoji) {
                            toast.error(
                              `Bundle has ${bundle.roles.length} role${bundle.roles.length !== 1 ? "s" : ""}. Adding it would exceed the ${maxRolesPerEmoji} roles per emoji limit (${selectedRoleIds.length} currently). Remove some roles first.`
                            );
                            return;
                          }
                          const newRoleNames = [
                            ...selectedRoleNames,
                            ...bundle.roles
                              .filter((r) => !selectedRoleIds.includes(r.roleId))
                              .map((r) => r.roleName),
                          ];
                          // Get colors from serverRoles for bundle roles
                          const newRoleColors = newRoleIds.map((id) => {
                            const serverRole = serverRoles.find(
                              (sr: DiscordRole) => sr.id === id
                            );
                            return serverRole?.color ?? 0;
                          });
                          updateReaction(i, {
                            roleId: newRoleIds[0],
                            roleName: newRoleNames[0],
                            roleColor: newRoleColors[0],
                            roleIds: newRoleIds,
                            roleNames: newRoleNames,
                            roleColors: newRoleColors,
                          });
                        }}
                      >
                        <Package className="w-4 h-4 text-purple-400" />
                        <div className="flex-1">
                          <div className="text-zinc-200 text-sm">{bundle.name}</div>
                          <div className="text-zinc-500 text-xs">
                            {bundle.roles.length} role{bundle.roles.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeReaction(i)}
                className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>

            {/* Selected role badges */}
            {selectedRoleIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pl-14">
                {selectedRoleIds.map((roleId, idx) => (
                  <span
                    key={roleId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-white/10 bg-white/5 transition-colors hover:bg-white/8"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: toHex(selectedRoleColors[idx] || 0),
                      }}
                    />
                    <span
                      style={{
                        color: toHex(selectedRoleColors[idx] || 0),
                      }}
                    >
                      {selectedRoleNames[idx] || roleId}
                    </span>
                    <button
                      type="button"
                      className="ml-0.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      onClick={() => {
                        const newRoleIds = selectedRoleIds.filter(
                          (_, j) => j !== idx
                        );
                        const newRoleNames = selectedRoleNames.filter(
                          (_, j) => j !== idx
                        );
                        const newRoleColors = selectedRoleColors.filter(
                          (_, j) => j !== idx
                        );
                        updateReaction(i, {
                          roleId: newRoleIds[0] || "",
                          roleName: newRoleNames[0] || "",
                          roleColor: newRoleColors[0] || 0,
                          roleIds: newRoleIds,
                          roleNames: newRoleNames,
                          roleColors: newRoleColors,
                        });
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </>
  );
}

function PreviewInfo() {
  return (
    <div className="p-4 bg-muted/50 rounded-lg flex gap-3 text-muted-foreground">
      <Info className="w-5 h-5 shrink-0" />
      <p className="text-xs leading-relaxed">
        Your community can click the reactions below the message to toggle roles
        automatically. Everything you see here is exactly what they will see in
        Discord.
      </p>
    </div>
  );
}
