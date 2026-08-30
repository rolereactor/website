"use client";

import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Showcase } from "@/components/ui/showcase";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Info,
  Terminal,
  Zap,
  AlertTriangle,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type LucideIcon } from "lucide-react";

interface ActiveAlert {
  id: number;
  variant: "default" | "glitch" | "info" | "success" | "warning" | "error";
  title: string;
  desc: string;
  icon: LucideIcon;
}

export default function AlertTestPage() {
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);

  const addAlert = (
    variant: ActiveAlert["variant"],
    title: string,
    desc: string,
    icon: LucideIcon
  ) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, variant, title, desc, icon }]);
  };

  const removeAlert = (id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white tracking-widest uppercase italic font-audiowide">
            Alert Systems
          </h1>
          <p className="text-zinc-400 max-w-3xl font-mono text-sm uppercase tracking-tight">
            {"//"} High-priority telemetry broadcast modules.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAlerts([])}
          className="font-mono text-[10px] uppercase text-zinc-500 hover:text-white"
        >
          <RotateCcw className="w-3 h-3 mr-2" /> Clearance Protocol
        </Button>
      </div>

      <Separator className="bg-white/10" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <Showcase
            title="Command Center"
            description="Trigger telemetry signals."
          >
            <div className="grid grid-cols-1 gap-3 w-full">
              {[
                {
                  id: "default",
                  label: "Standard Ping",
                  icon: Terminal,
                  variant: "default",
                  title: "Normal Operation",
                  desc: "System heartbeats detected. Neural link stable.",
                },
                {
                  id: "glitch",
                  label: "Neural Anomaly",
                  icon: Zap,
                  variant: "glitch",
                  title: "Anomaly Detected",
                  desc: "Frequency drift in sector 7G. Initiating auto-sync.",
                },
                {
                  id: "info",
                  label: "System Info",
                  icon: Info,
                  variant: "info",
                  title: "Telemetry Info",
                  desc: "New firmware version 2.4.0 is ready for uplink.",
                },
                {
                  id: "success",
                  label: "Uplink Confirmed",
                  icon: CheckCircle2,
                  variant: "success",
                  title: "Uplink Success",
                  desc: "Data packet transmission confirmed by central node.",
                },
                {
                  id: "warning",
                  label: "Power Fluctuation",
                  icon: AlertTriangle,
                  variant: "warning",
                  title: "Warning Signal",
                  desc: "Power levels fluctuating. Switching to backup cells.",
                },
                {
                  id: "error",
                  label: "Core Breach",
                  icon: Zap,
                  variant: "error",
                  title: "Critical Fault",
                  desc: "Core containment failure! Evacuate local terminal.",
                },
              ].map((trigger) => (
                <Button
                  key={trigger.id}
                  variant="outline"
                  className="justify-between font-mono text-[10px] uppercase h-10 group"
                  onClick={() =>
                    addAlert(
                      trigger.variant as ActiveAlert["variant"],
                      trigger.title,
                      trigger.desc,
                      trigger.icon
                    )
                  }
                >
                  <div className="flex items-center gap-2">
                    <trigger.icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                    {trigger.label}
                  </div>
                  <Play className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                </Button>
              ))}
            </div>
          </Showcase>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Showcase
            title="Telemetry Output"
            description="Live signal stream with auto-exit transitions."
          >
            <div className="flex flex-col gap-4 w-full min-h-100">
              {alerts.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-white/5 rounded-2xl animate-pulse">
                  <Terminal className="w-8 h-8 mb-4 opacity-10" />
                  <p className="font-mono text-[10px] uppercase tracking-widest opacity-30">
                    Awaiting Signal Entry...
                  </p>
                </div>
              )}

              {alerts.map((alert) => (
                <Alert
                  key={alert.id}
                  variant={alert.variant}
                  onClose={() => removeAlert(alert.id)}
                  autoClose={3000}
                >
                  <alert.icon className="h-4 w-4" />
                  <AlertTitle>{alert.title}</AlertTitle>
                  <AlertDescription>{alert.desc}</AlertDescription>
                </Alert>
              ))}
            </div>
          </Showcase>
        </div>
      </div>
    </div>
  );
}
