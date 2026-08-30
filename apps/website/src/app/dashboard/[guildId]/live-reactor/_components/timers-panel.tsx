"use client";

import { useState, useEffect } from "react";
import {
  Timer,
  Plus,
  Trash2,
  Loader2,
  Clock,
  MessageSquare,
} from "lucide-react";

import { useStreamingStore } from "@/store/use-streaming-store";
import { toast } from "@/lib/toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface TimersPanelProps {
  guildId: string;
}

const INTERVAL_OPTIONS = [
  { value: 30000, label: "30 seconds" },
  { value: 60000, label: "1 minute" },
  { value: 120000, label: "2 minutes" },
  { value: 300000, label: "5 minutes" },
  { value: 600000, label: "10 minutes" },
  { value: 900000, label: "15 minutes" },
  { value: 1800000, label: "30 minutes" },
  { value: 3600000, label: "1 hour" },
];

function formatInterval(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  return `${hr}h`;
}

export function TimersPanel({ guildId }: TimersPanelProps) {
  const { timersCache, isLoading, fetchTimers, addTimer, deleteTimer } =
    useStreamingStore();

  const [newName, setNewName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newInterval, setNewInterval] = useState(60000);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const timers = timersCache[guildId] || [];
  const timersLoading = isLoading[`timers:${guildId}`];

  useEffect(() => {
    fetchTimers(guildId);
  }, [guildId, fetchTimers]);

  const handleAddTimer = async () => {
    if (!newName.trim() || !newMessage.trim()) return;
    try {
      setIsAdding(true);
      await addTimer(guildId, newName.trim(), newMessage.trim(), newInterval);
      toast.success(`Timer "${newName.trim()}" created successfully!`);
      setNewName("");
      setNewMessage("");
      setNewInterval(60000);
    } catch (err) {
      console.error("Failed to add timer:", err);
      toast.error("Failed to create timer.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteTimer = async (name: string) => {
    try {
      setIsDeleting(name);
      await deleteTimer(guildId, name);
      toast.success(`Timer "${name}" deleted.`);
    } catch (err) {
      console.error("Failed to delete timer:", err);
      toast.error("Failed to delete timer.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (timersLoading && timers.length === 0) {
    return (
      <div className="space-y-6">
        <Card variant="cyberpunk" showGrid>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card variant="cyberpunk" showGrid>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/2">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-11 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Timer */}
      <Card variant="cyberpunk" showGrid>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10">
              <Plus className="w-4 h-4 text-cyan-400" />
            </div>
            Add Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label variant="cyber" className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Timer Name
              </Label>
              <Input
                variant="cyber"
                placeholder="e.g. rules"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label variant="cyber" className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Interval
              </Label>
              <Select
                value={String(newInterval)}
                onValueChange={(value) => setNewInterval(parseInt(value))}
              >
                <SelectTrigger variant="cyber" className="w-full">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent variant="cyber">
                  {INTERVAL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label variant="cyber" className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Message
            </Label>
            <Input
              variant="cyber"
              placeholder="The message to post periodically..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddTimer();
                }
              }}
            />
          </div>
          <Button
            variant="cyber"
            onClick={handleAddTimer}
            disabled={isAdding || !newName.trim() || !newMessage.trim()}
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Timer
          </Button>
        </CardContent>
      </Card>

      {/* Timers List */}
      <Card variant="cyberpunk" showGrid>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
                <Timer className="w-4 h-4 text-emerald-400" />
              </div>
              Active Timers
            </CardTitle>
            <span className="text-xs text-zinc-500 font-mono">
              {timers.length} timer{timers.length !== 1 ? "s" : ""}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {timers.length === 0 ? (
            <div className="text-center py-12">
              <Timer className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No timers yet.</p>
              <p className="text-xs text-zinc-600 mt-1">
                Add your first timer above.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {timers.map((timer) => (
                <div
                  key={timer.name}
                  className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-black/20 hover:bg-white/2 transition-colors group"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">
                        {timer.name}
                      </span>
                      <Badge
                        variant={timer.enabled ? "success" : "secondary"}
                        className="text-[10px]"
                      >
                        {timer.enabled ? "Active" : "Paused"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono"
                      >
                        {formatInterval(timer.intervalMs)}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 truncate max-w-md">
                      {timer.message}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 shrink-0"
                    onClick={() => handleDeleteTimer(timer.name)}
                    disabled={isDeleting === timer.name}
                  >
                    {isDeleting === timer.name ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
