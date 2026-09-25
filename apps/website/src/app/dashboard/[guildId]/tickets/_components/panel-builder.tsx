"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  AlertTriangle,
  Hash,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useTicketStore,
  type TicketPanel,
} from "@/store/use-ticket-store";
import { useGuildStore } from "@/store/use-guild-store";
import { useProEngineStore } from "@/store/use-pro-engine-store";
import { toast } from "@/lib/toast";
import {
  PanelCategoriesEditor,
  type CategoryDraft,
} from "./panel-categories-editor";

interface PanelBuilderProps {
  guildId: string;
  editPanel: TicketPanel | null;
  onCancel: () => void;
  onSaveComplete: () => void;
}

export function PanelBuilder({
  guildId,
  editPanel,
  onCancel,
  onSaveComplete,
}: PanelBuilderProps) {
  const isEditing = editPanel !== null;

  const [channelId, setChannelId] = useState("");
  const [title, setTitle] = useState(editPanel?.title || "Support Tickets");
  const [description, setDescription] = useState(
    editPanel?.description ||
      "Click a button below to create a support ticket. Our staff will assist you as soon as possible."
  );
  const [categories, setCategories] = useState<CategoryDraft[]>(
    editPanel?.categories?.length
      ? editPanel.categories.map((cat) => ({
          id: cat.id,
          label: cat.label,
          emoji: cat.emoji || "📧",
          description: cat.description,
          color: cat.color,
        }))
      : [{ label: "Support", emoji: "📧" }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { dataCache, createPanel, updatePanel } = useTicketStore();
  const panels = dataCache[guildId]?.panels ?? [];

  const { guildData, fetchChannels } = useGuildStore();
  const channels = guildData[guildId]?.channels;

  const { fetchSettings, settingsCache } = useProEngineStore();
  const premiumStatus = settingsCache[guildId] ?? null;
  const isPremium = premiumStatus?.isPremium?.pro || false;

  // Fetch limits from API
  const { data: benefitsData } = useSWR(
    "/api/premium/benefits",
    fetcher,
    { revalidateOnFocus: false }
  );

  const panelsLimit = benefitsData?.benefits?.find(
    (b: { name: string }) => b.name === "Panels per Server"
  );
  const categoriesLimit = benefitsData?.benefits?.find(
    (b: { name: string }) => b.name === "Categories per Panel"
  );
  const maxPanels = isPremium
    ? Number(panelsLimit?.pro) || 10
    : Number(panelsLimit?.free) || 3;
  const maxCategories = isPremium
    ? Number(categoriesLimit?.pro) || 10
    : Number(categoriesLimit?.free) || 3;

  useEffect(() => {
    if (guildId) {
      fetchChannels(guildId);
      fetchSettings(guildId);
    }
  }, [guildId, fetchChannels, fetchSettings]);

  const isAtLimit = !isEditing && panels.length >= maxPanels;
  const textChannels = (channels || []).filter((c) => c.type === 0 || c.type === 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (!isEditing && !channelId)) return;

    setSaving(true);
    setError(null);

    const payloadCategories = categories.map((cat) => ({
      ...cat,
      label: cat.label.trim(),
      emoji: cat.emoji.trim() || "📧",
    }));

    if (isEditing && editPanel) {
      const result = await updatePanel(guildId, editPanel.panelId, {
        title,
        description,
        categories: payloadCategories,
      });
      setSaving(false);

      if (result.success) {
        const message = result.message || "Panel updated successfully";
        toast.success(
          result.messageRefreshed
            ? `${message} — Discord message refreshed.`
            : message
        );
        onSaveComplete();
      } else {
        setError(result.error || "Failed to update panel. Please try again.");
      }
    } else {
      const result = await createPanel(guildId, {
        channelId,
        title,
        description,
        categories: payloadCategories,
      });
      setSaving(false);

      if (result.panel) {
        toast.success(result.message || "Panel created successfully");
        onSaveComplete();
      } else {
        setError(result.error || "Failed to create panel. Please try again.");
      }
    }
  };

  if (isAtLimit) {
    return (
      <Card variant="default" className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="size-8 text-amber-400 mb-3" />
        <p className="text-sm text-zinc-300 font-medium">Panel limit reached</p>
        <p className="text-xs text-zinc-500 mt-1">
          You have {panels.length} of {maxPanels} panels. Delete a panel or upgrade to create more.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="cyberpunk" showGrid>
      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {isEditing ? (
            <div className="grid gap-2">
              <Label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Panel Channel
              </Label>
              <div className="flex items-center gap-2 px-3 h-9 rounded-md border border-white/10 bg-black/30 font-mono text-xs text-zinc-400">
                <Hash className="size-3 text-zinc-600" />
                {editPanel.channelName || editPanel.channelId}
                <span className="ml-auto text-[10px] text-zinc-600 uppercase tracking-widest">
                  Fixed
                </span>
              </div>
              <p className="text-[10px] text-zinc-600 font-mono">
                Panels can&apos;t be moved — delete and recreate to use another channel.
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Panel Channel
              </Label>
              <Select value={channelId} onValueChange={setChannelId}>
                <SelectTrigger className="bg-zinc-900/50 border-white/10 font-mono text-xs">
                  <SelectValue placeholder="Select a text channel..." />
                </SelectTrigger>
                <SelectContent>
                  {textChannels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      #{channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Title
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Support Tickets"
              maxLength={100}
              className="bg-zinc-900/50 border-white/10 font-mono text-xs"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Description
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell members what this panel is for..."
              maxLength={500}
              className="bg-zinc-900/50 border-white/10 font-mono text-xs min-h-20"
            />
          </div>

          <PanelCategoriesEditor
            categories={categories}
            onChange={setCategories}
            max={maxCategories}
          />

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-2 rounded border border-red-500/20">
              <AlertTriangle className="size-3" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="cyber"
              className="flex-1 font-black uppercase tracking-widest text-[11px]"
              disabled={
                saving ||
                !title ||
                (!isEditing && !channelId) ||
                categories.some((cat) => !cat.label.trim())
              }
            >
              {saving && <Loader2 className="size-3 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Panel"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="font-black uppercase tracking-widest text-[11px]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
