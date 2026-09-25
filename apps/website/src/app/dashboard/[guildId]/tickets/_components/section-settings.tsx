"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Users,
  Hash,
  MessageSquare,
  Clock,
  Loader2,
  Save,
  AlertCircle,
  Ban,
  Shield,
  Star,
} from "lucide-react";

import { useTicketStore, type TicketSettings } from "@/store/use-ticket-store";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
}

interface DiscordRole {
  id: string;
  name: string;
  color: number;
  managed: boolean;
}

interface SectionSettingsProps {
  guildId: string;
  settings: TicketSettings | null;
  channels: DiscordChannel[];
  roles: DiscordRole[];
}

function FormField({
  label,
  icon: Icon,
  children,
  hint,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <Label className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </Label>
      {children}
      {hint && (
        <p className="text-[11px] text-zinc-600 mt-1">{hint}</p>
      )}
    </div>
  );
}

export function SectionSettings({
  guildId,
  settings,
  channels,
  roles,
}: SectionSettingsProps) {
  const { updateSettings, fetchSettings } = useTicketStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [staffRoleId, setStaffRoleId] = useState("");
  const [transcriptChannelId, setTranscriptChannelId] = useState("");
  const [notificationChannelId, setNotificationChannelId] = useState("");
  const [autoCloseDays, setAutoCloseDays] = useState(0);
  const [maxTicketsPerUser, setMaxTicketsPerUser] = useState(0);
  const [allowUserTranscripts, setAllowUserTranscripts] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [closeMessage, setCloseMessage] = useState("");
  const [csatEnabled, setCsatEnabled] = useState(true);
  const [csatRelayChannelId, setCsatRelayChannelId] = useState("");

  useEffect(() => {
    if (settings) {
      setStaffRoleId(settings.staffRoleId || "");
      setTranscriptChannelId(settings.transcriptChannelId || "");
      setNotificationChannelId(settings.notificationChannelId || "");
      setAutoCloseDays(settings.autoCloseDays || 0);
      setMaxTicketsPerUser(settings.maxTicketsPerUser || 0);
      setAllowUserTranscripts(settings.allowUserTranscripts !== false);
      setWelcomeMessage(settings.welcomeMessage || "");
      setCloseMessage(settings.closeMessage || "");
      setCsatEnabled(settings.csatEnabled !== false);
      setCsatRelayChannelId(settings.csatRelayChannelId || "");
    }
  }, [settings]);

  const textChannels = channels.filter((c) => c.type === 0 || c.type === 5);
  const nonManagedRoles = roles.filter((r) => !r.managed);

  const canSave = !!staffRoleId && !!transcriptChannelId && !!notificationChannelId;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);

    try {
      const ok = await updateSettings(guildId, {
        staffRoleId,
        transcriptChannelId,
        notificationChannelId,
        autoCloseDays,
        maxTicketsPerUser,
        allowUserTranscripts,
        welcomeMessage: welcomeMessage || undefined,
        closeMessage: closeMessage || undefined,
        csatEnabled,
        csatRelayChannelId: csatRelayChannelId || null,
      });

      if (ok) {
        await fetchSettings(guildId);
      } else {
        setError("Failed to save settings. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card variant="default" className="divide-y divide-white/5">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-300">Ticket Settings</span>
        </div>
        <Button
          variant="cyber"
          size="sm"
          disabled={saving || !canSave}
          onClick={handleSave}
          className="h-7 px-3 text-[10px]"
        >
          {saving ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
          ) : (
            <Save className="w-3 h-3 mr-1.5" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mx-4 my-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Staff Role */}
      <div className="px-4 py-3">
        <FormField label="Staff Role" icon={Users} hint="Members with this role can claim and manage tickets.">
          <Select value={staffRoleId} onValueChange={setStaffRoleId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a staff role" />
            </SelectTrigger>
            <SelectContent>
              {nonManagedRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, "0")}` : "#6b7280" }}
                    />
                    {role.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {/* Transcript Channel */}
      <div className="px-4 py-3">
        <FormField label="Transcript Channel" icon={Hash} hint="Where ticket transcripts are saved.">
          <Select value={transcriptChannelId} onValueChange={setTranscriptChannelId}>
            <SelectTrigger>
              <SelectValue placeholder="Select transcript channel" />
            </SelectTrigger>
            <SelectContent>
              {textChannels.map((ch) => (
                <SelectItem key={ch.id} value={ch.id}>
                  <div className="flex items-center gap-2">
                    <Hash className="w-3 h-3 text-zinc-500" />
                    {ch.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {/* Notify Channel */}
      <div className="px-4 py-3">
        <FormField label="Notify Channel" icon={MessageSquare} hint="Staff receive notifications here.">
          <Select value={notificationChannelId} onValueChange={setNotificationChannelId}>
            <SelectTrigger>
              <SelectValue placeholder="Select notification channel" />
            </SelectTrigger>
            <SelectContent>
              {textChannels.map((ch) => (
                <SelectItem key={ch.id} value={ch.id}>
                  <div className="flex items-center gap-2">
                    <Hash className="w-3 h-3 text-zinc-500" />
                    {ch.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {/* Limits */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Auto-Close After" icon={Clock} hint="Days of inactivity before auto-close (0 = disabled).">
            <Input
              type="number"
              min={0}
              max={365}
              value={autoCloseDays}
              onChange={(e) => setAutoCloseDays(parseInt(e.target.value) || 0)}
              className="h-9 text-sm"
            />
          </FormField>
          <FormField label="Max Tickets Per User" icon={Ban} hint="0 = unlimited.">
            <Input
              type="number"
              min={0}
              max={50}
              value={maxTicketsPerUser}
              onChange={(e) => setMaxTicketsPerUser(parseInt(e.target.value) || 0)}
              className="h-9 text-sm"
            />
          </FormField>
        </div>
      </div>

      {/* Access Controls */}
      <div className="px-4 py-3">
        <FormField label="Access Controls" icon={Shield} hint="Who can interact with tickets.">
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-400">Users can self-export transcripts</Label>
              <Switch checked={allowUserTranscripts} onCheckedChange={setAllowUserTranscripts} />
            </div>
          </div>
        </FormField>
      </div>

      {/* Feedback (CSAT) */}
      <div className="px-4 py-3">
        <FormField label="Ticket Ratings" icon={Star} hint="Members get a 1–5 star rating prompt via DM after their ticket closes. Ratings appear in Staff Analytics (Pro).">
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-400">Ask for a rating when a ticket closes</Label>
              <Switch checked={csatEnabled} onCheckedChange={setCsatEnabled} />
            </div>
            {csatEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Relay Channel" icon={Hash} hint="Post each new rating here (optional).">
                  <Select
                    value={csatRelayChannelId || "none"}
                    onValueChange={(v) => setCsatRelayChannelId(v === "none" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Off" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Off</SelectItem>
                      {textChannels.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id}>
                          <div className="flex items-center gap-2">
                            <Hash className="w-3 h-3 text-zinc-500" />
                            {ch.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            )}
          </div>
        </FormField>
      </div>

      {/* Welcome Message */}
      <div className="px-4 py-3">
        <FormField label="Welcome Message" icon={MessageSquare} hint="Sent when a ticket is created (optional).">
          <Textarea
            placeholder="Welcome! Please describe your issue and a staff member will assist you shortly."
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            rows={3}
            className="text-sm resize-none"
          />
        </FormField>
      </div>

      {/* Close Message */}
      <div className="px-4 py-3">
        <FormField label="Close Message" icon={MessageSquare} hint="Sent when a ticket is closed (optional).">
          <Textarea
            placeholder="Your ticket has been closed. Thank you for reaching out!"
            value={closeMessage}
            onChange={(e) => setCloseMessage(e.target.value)}
            rows={3}
            className="text-sm resize-none"
          />
        </FormField>
      </div>
    </Card>
  );
}
