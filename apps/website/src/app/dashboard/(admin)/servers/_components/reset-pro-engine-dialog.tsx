"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Check, X, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ResetProEngineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string;
  guildName: string;
}

export function ResetProEngineDialog({
  open,
  onOpenChange,
  guildId,
  guildName,
}: ResetProEngineDialogProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleReset = async () => {
    setIsResetting(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const response = await fetch(`/api/guilds/${guildId}/premium/reset`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset premium state");
      }

      setStatus("success");
      setTimeout(() => {
        onOpenChange(false);
        setStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Failed to reset pro engine:", error);
      setStatus("error");
      setErrorMsg(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsResetting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-106.25 border-white/5 bg-zinc-950/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 italic">
            <RefreshCw className="size-4 text-amber-500" />
            Reset Pro Engine State
          </DialogTitle>
          <DialogDescription className="font-mono text-[10px] uppercase tracking-wider">
            This will clear all premium features and trial status for{" "}
            <span className="text-cyan-500">{guildName}</span>.
            <br />
            Guild ID: <span className="text-zinc-300">{guildId}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {status === "success" && (
            <div className="flex items-center gap-2 text-green-500 text-xs bg-green-500/10 p-2 rounded border border-green-500/20">
              <Check className="size-3" />
              Premium state reset successfully
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-2 rounded border border-red-500/20">
              <AlertTriangle className="size-3" />
              {errorMsg}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="cyber"
            className="w-full"
            disabled={isResetting}
            onClick={handleReset}
          >
            {isResetting && <Loader2 className="size-3 mr-2 animate-spin" />}
            Reset State
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
