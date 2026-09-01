"use client";

import { useState } from "react";
import { Audiowide } from "next/font/google";
import {
  Settings,
  Users,
  Hash,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useTicketStore } from "@/store/use-ticket-store";

import { Card } from "@/components/ui/card";
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

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface SetupWizardProps {
  guildId: string;
  onComplete: () => void;
  channels: DiscordChannel[];
  roles: DiscordRole[];
}

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

const STEPS = [
  { id: "staff", label: "Staff Role", icon: Users, description: "Select who manages tickets" },
  { id: "channels", label: "Channels", icon: Hash, description: "Configure ticket channels" },
  { id: "panel", label: "Create Panel", icon: Settings, description: "Set up your first panel" },
  { id: "done", label: "Complete", icon: CheckCircle2, description: "You're all set!" },
];

export function SetupWizard({ guildId, onComplete, channels, roles }: SetupWizardProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedStaffRole, setSelectedStaffRole] = useState("");
  const [selectedTranscriptChannel, setSelectedTranscriptChannel] = useState("");
  const [selectedNotifyChannel, setSelectedNotifyChannel] = useState("");

  const [panelTitle, setPanelTitle] = useState("Support Tickets");
  const [panelDescription, setPanelDescription] = useState(
    "Click a button below to create a support ticket. Our staff will assist you as soon as possible."
  );
  const [panelChannel, setPanelChannel] = useState("");

  const { updateSettings, createPanel, fetchTicketData } = useTicketStore();

  const textChannels = channels.filter((c) => c.type === 0 || c.type === 5);
  const nonManagedRoles = roles.filter((r) => !r.managed);

  const canProceed = () => {
    switch (step) {
      case 0:
        return !!selectedStaffRole;
      case 1:
        return !!selectedTranscriptChannel && !!selectedNotifyChannel;
      case 2:
        return !!panelChannel && !!panelTitle;
      default:
        return true;
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    setError(null);

    try {
      const settingsOk = await updateSettings(guildId, {
        staffRoleId: selectedStaffRole,
        transcriptChannelId: selectedTranscriptChannel,
        notificationChannelId: selectedNotifyChannel,
        allowUserTranscripts: true,
      });

      if (!settingsOk) {
        setError("Failed to save settings. Please try again.");
        return;
      }

      const panel = await createPanel(guildId, {
        channelId: panelChannel,
        title: panelTitle,
        description: panelDescription,
      });

      if (!panel) {
        setError("Settings saved but failed to create panel. You can create one later from the Panels tab.");
        return;
      }

      await fetchTicketData(guildId, true);
      setStep(STEPS.length - 1);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card variant="default" className="w-full overflow-hidden">
      <div className="flex items-center gap-4 px-8 py-5 border-b border-white/5">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3">
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                i < step
                  ? "bg-emerald-500/20 text-emerald-400"
                  : i === step
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-zinc-800 text-zinc-500"
              )}
            >
              {i < step ? (
                <CheckCircle2 className="w-4.5 h-4.5" />
              ) : (
                <s.icon className="w-4.5 h-4.5" />
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-10 h-0.5",
                  i < step ? "bg-emerald-500/40" : "bg-zinc-800"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="p-8">
        <div className="mb-6">
          <h3
            className={cn(
              "text-lg font-bold text-white mb-1",
              audiowide.className
            )}
          >
            {STEPS[step].label}
          </h3>
          <p className="text-sm text-zinc-400">{STEPS[step].description}</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-2 block">
                Staff Role
              </Label>
              <Select value={selectedStaffRole} onValueChange={setSelectedStaffRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role for ticket staff" />
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
              <p className="text-[11px] text-zinc-600 mt-1">
                Members with this role can claim and manage tickets.
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-2 block">
                Transcript Channel
              </Label>
              <Select value={selectedTranscriptChannel} onValueChange={setSelectedTranscriptChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select where transcripts are saved" />
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
              <p className="text-[11px] text-zinc-600 mt-1">
                Closed ticket transcripts will be posted here.
              </p>
            </div>

            <div>
              <Label className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-2 block">
                Notification Channel
              </Label>
              <Select value={selectedNotifyChannel} onValueChange={setSelectedNotifyChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select where staff get notified" />
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
              <p className="text-[11px] text-zinc-600 mt-1">
                Staff are pinged here when a new ticket is created.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-2 block">
                Panel Channel
              </Label>
              <Select value={panelChannel} onValueChange={setPanelChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select where the ticket panel appears" />
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
            </div>

            <div>
              <Label className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-2 block">
                Panel Title
              </Label>
              <Input
                value={panelTitle}
                onChange={(e) => setPanelTitle(e.target.value)}
                placeholder="Support Tickets"
                maxLength={100}
              />
            </div>

            <div>
              <Label className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-2 block">
                Panel Description
              </Label>
              <Textarea
                value={panelDescription}
                onChange={(e) => setPanelDescription(e.target.value)}
                placeholder="Click a button below to create a support ticket."
                rows={3}
                maxLength={500}
              />
            </div>
          </div>
        )}

        {step === STEPS.length - 1 && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className={cn("text-xl font-bold text-white mb-2", audiowide.className)}>
              Ticket System Active!
            </h4>
            <p className="text-sm text-zinc-400 max-w-md mb-6">
              Your ticket panel has been created. Members can now create support tickets from
              the designated channel.
            </p>
            <Button variant="cyber" onClick={onComplete}>
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>

      {step < STEPS.length - 1 && (
        <div className="flex items-center justify-between px-8 py-5 border-t border-white/5">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            variant="cyber"
            onClick={() => {
              if (step === STEPS.length - 2) {
                handleFinish();
              } else {
                setStep((s) => s + 1);
              }
            }}
            disabled={!canProceed() || saving}
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : step === STEPS.length - 2 ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Finish Setup
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}
