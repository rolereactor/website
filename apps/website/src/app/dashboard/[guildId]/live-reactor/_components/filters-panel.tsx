"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Save,
  Loader2,
  AlertTriangle,
  Link,
  MessageSquare,
  Ban,
  Type,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  useStreamingStore,
  type ChatFilters,
} from "@/store/use-streaming-store";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface FiltersPanelProps {
  guildId: string;
}

const FILTER_CARDS = [
  {
    key: "caps" as const,
    label: "Caps Filter",
    description: "Filter messages with excessive capitalization.",
    icon: Type,
    color: "text-cyan-400",
  },
  {
    key: "links" as const,
    label: "Links Filter",
    description: "Filter messages containing links.",
    icon: Link,
    color: "text-purple-400",
  },
  {
    key: "spam" as const,
    label: "Spam Filter",
    description: "Filter repeated or rapid messages.",
    icon: MessageSquare,
    color: "text-yellow-400",
  },
  {
    key: "badWords" as const,
    label: "Bad Words Filter",
    description: "Filter messages containing blocked words.",
    icon: Ban,
    color: "text-red-400",
  },
] as const;

export function FiltersPanel({ guildId }: FiltersPanelProps) {
  const { filtersCache, isLoading, fetchFilters, updateFilter } =
    useStreamingStore();
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [localFilters, setLocalFilters] = useState<ChatFilters>({
    enabled: false,
    caps: { enabled: false, threshold: 70, minLength: 5 },
    links: { enabled: false },
    spam: { enabled: false, repeatedMessages: 3, rateThreshold: 5 },
    badWords: { enabled: false, words: [] },
    timeoutDuration: 5,
  });

  const filters = filtersCache[guildId];
  const filtersLoading = isLoading[`filters:${guildId}`];

  useEffect(() => {
    fetchFilters(guildId);
  }, [guildId, fetchFilters]);

  useEffect(() => {
    if (filters) {
      setLocalFilters({
        ...filters,
        caps: {
          enabled: filters.caps?.enabled ?? false,
          threshold: filters.caps?.threshold ?? 70,
          minLength: filters.caps?.minLength ?? 5,
        },
        links: { enabled: filters.links?.enabled ?? false },
        spam: {
          enabled: filters.spam?.enabled ?? false,
          repeatedMessages: filters.spam?.repeatedMessages ?? 3,
          rateThreshold: filters.spam?.rateThreshold ?? 5,
        },
        badWords: {
          enabled: filters.badWords?.enabled ?? false,
          words: filters.badWords?.words ?? [],
        },
        timeoutDuration: filters.timeoutDuration ?? 5,
      });
    }
  }, [filters]);

  const handleSaveFilter = async (filterKey: string) => {
    try {
      setIsSaving(filterKey);
      if (filterKey === "caps") {
        await updateFilter(guildId, "caps", {
          enabled: localFilters.caps?.enabled,
          threshold: localFilters.caps?.threshold,
          minLength: localFilters.caps?.minLength,
        });
      } else if (filterKey === "links") {
        await updateFilter(guildId, "links", {
          enabled: localFilters.links?.enabled,
        });
      } else if (filterKey === "spam") {
        await updateFilter(guildId, "spam", {
          enabled: localFilters.spam?.enabled,
          repeatedMessages: localFilters.spam?.repeatedMessages,
          rateThreshold: localFilters.spam?.rateThreshold,
        });
      } else if (filterKey === "badWords") {
        await updateFilter(guildId, "badWords", {
          enabled: localFilters.badWords?.enabled,
          words: localFilters.badWords?.words,
        });
      } else if (filterKey === "timeout") {
        await updateFilter(guildId, "timeout", {
          timeoutDuration: localFilters.timeoutDuration,
        });
      }
    } catch (err) {
      console.error(`Failed to save ${filterKey}:`, err);
    } finally {
      setIsSaving(null);
    }
  };

  const updateBadWords = (value: string) => {
    const words = value
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);
    setLocalFilters((prev) => ({
      ...prev,
      badWords: { enabled: prev.badWords?.enabled ?? false, words },
    }));
  };

  if (filtersLoading && !filters) {
    return (
      <div className="space-y-6">
        <Card variant="cyberpunk" showGrid>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-6 w-11 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-64" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} variant="cyberpunk" showGrid>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-11 rounded-full" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <Card variant="cyberpunk" showGrid>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10">
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              Chat Filters
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant={localFilters.enabled ? "success" : "secondary"}>
                {localFilters.enabled ? "Enabled" : "Disabled"}
              </Badge>
              <Switch
                variant="emerald"
                checked={localFilters.enabled}
                onCheckedChange={(checked) =>
                  setLocalFilters((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Individual Filters */}
      {FILTER_CARDS.map(({ key, label, description, icon: Icon, color }) => {
        const filterData = localFilters[key];
        const isFilterEnabled = filterData?.enabled ?? false;

        return (
          <Card
            key={key}
            variant="cyberpunk"
            showGrid
            className={cn(
              "transition-all",
              !localFilters.enabled && "opacity-50 pointer-events-none"
            )}
          >
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg bg-black/20"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", color)} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{label}</CardTitle>
                    <p className="text-xs text-zinc-500">{description}</p>
                  </div>
                </div>
                <Switch
                  variant="cyan"
                  checked={isFilterEnabled}
                  onCheckedChange={(checked) =>
                    setLocalFilters((prev) => {
                      const updated = { ...prev };
                      if (key === "caps") {
                        updated.caps = {
                          enabled: checked,
                          threshold: prev.caps?.threshold ?? 70,
                          minLength: prev.caps?.minLength ?? 5,
                        };
                      } else if (key === "links") {
                        updated.links = { enabled: checked };
                      } else if (key === "spam") {
                        updated.spam = {
                          enabled: checked,
                          repeatedMessages: prev.spam?.repeatedMessages ?? 3,
                          rateThreshold: prev.spam?.rateThreshold ?? 5,
                        };
                      } else if (key === "badWords") {
                        updated.badWords = {
                          enabled: checked,
                          words: prev.badWords?.words ?? [],
                        };
                      }
                      return updated;
                    })
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Caps Settings */}
              {key === "caps" && (
                <>
                  <div className="space-y-2">
                    <Label
                      variant="cyber"
                      className="flex items-center justify-between"
                    >
                      <span>Threshold: {localFilters.caps?.threshold}%</span>
                      <span className="text-zinc-600 font-normal normal-case tracking-normal">
                        Min caps ratio
                      </span>
                    </Label>
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={localFilters.caps?.threshold ?? 70}
                      onChange={(e) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          caps: {
                            enabled: prev.caps?.enabled ?? false,
                            threshold: parseInt(e.target.value),
                            minLength: prev.caps?.minLength ?? 5,
                          },
                        }))
                      }
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label variant="cyber">Minimum Message Length</Label>
                    <Input
                      variant="cyber"
                      type="number"
                      min={1}
                      max={100}
                      value={localFilters.caps?.minLength ?? 5}
                      onChange={(e) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          caps: {
                            enabled: prev.caps?.enabled ?? false,
                            threshold: prev.caps?.threshold ?? 70,
                            minLength: parseInt(e.target.value) || 5,
                          },
                        }))
                      }
                      className="w-24"
                    />
                  </div>
                </>
              )}

              {/* Links Settings */}
              {key === "links" && (
                <p className="text-xs text-zinc-500">
                  When enabled, messages containing URLs will be filtered.
                </p>
              )}

              {/* Spam Settings */}
              {key === "spam" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label variant="cyber">Repeated Messages</Label>
                    <Input
                      variant="cyber"
                      type="number"
                      min={1}
                      max={20}
                      value={localFilters.spam?.repeatedMessages ?? 3}
                      onChange={(e) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          spam: {
                            enabled: prev.spam?.enabled ?? false,
                            repeatedMessages: parseInt(e.target.value) || 3,
                            rateThreshold: prev.spam?.rateThreshold ?? 5,
                          },
                        }))
                      }
                    />
                    <p className="text-xs text-zinc-500">
                      Max identical messages before filter triggers.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label variant="cyber">Rate Threshold (per sec)</Label>
                    <Input
                      variant="cyber"
                      type="number"
                      min={1}
                      max={30}
                      value={localFilters.spam?.rateThreshold ?? 5}
                      onChange={(e) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          spam: {
                            enabled: prev.spam?.enabled ?? false,
                            repeatedMessages: prev.spam?.repeatedMessages ?? 3,
                            rateThreshold: parseInt(e.target.value) || 5,
                          },
                        }))
                      }
                    />
                    <p className="text-xs text-zinc-500">
                      Max messages per second before filter triggers.
                    </p>
                  </div>
                </div>
              )}

              {/* Bad Words Settings */}
              {key === "badWords" && (
                <div className="space-y-2">
                  <Label variant="cyber">Blocked Words</Label>
                  <Textarea
                    variant="cyber"
                    placeholder="Enter words separated by commas..."
                    value={localFilters.badWords?.words?.join(", ") || ""}
                    onChange={(e) => updateBadWords(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-zinc-500">
                    Comma-separated list of words to filter.
                  </p>
                </div>
              )}

              <Separator className="bg-white/5" />

              <Button
                variant="cyber"
                size="sm"
                onClick={() => handleSaveFilter(key)}
                disabled={isSaving === key}
              >
                {isSaving === key ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save {label.replace(" Filter", "")}
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {/* Timeout Duration */}
      <Card variant="cyberpunk" showGrid>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </div>
            Timeout Duration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="space-y-2 flex-1 max-w-50">
              <Label variant="cyber">Duration (minutes)</Label>
              <Input
                variant="cyber"
                type="number"
                min={1}
                max={60}
                value={localFilters.timeoutDuration ?? 5}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    timeoutDuration: parseInt(e.target.value) || 5,
                  }))
                }
              />
            </div>
            <div className="sm:pt-6">
              <Button
                variant="cyber"
                size="sm"
                onClick={() => handleSaveFilter("timeout")}
                disabled={isSaving === "timeout"}
                className="w-full sm:w-auto"
              >
                {isSaving === "timeout" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save Timeout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
