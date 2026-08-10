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
import { Input } from "@/components/ui/input";

interface ResetProEngineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetProEngineDialog({
  open,
  onOpenChange,
}: ResetProEngineDialogProps) {
  const [guildId, setGuildId] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleReset = async () => {
    if (!guildId.trim()) return;

    setIsResetting(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const response = await fetch(
        `/api/guilds/${guildId.trim()}/premium/reset`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset premium state");
      }

      setStatus("success");
      setTimeout(() => {
        onOpenChange(false);
        setGuildId("");
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
    setGuildId("");
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-amber-500/20 bg-zinc-950/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-500">
            <RefreshCw className="size-4" />
            Reset Pro Engine State
          </DialogTitle>
          <DialogDescription className="font-mono text-[10px] uppercase tracking-wider">
            This will clear all premium features and trial status for a guild.
            This action is for testing purposes only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Guild ID
            </label>
            <Input
              placeholder="Enter Discord Guild ID"
              value={guildId}
              onChange={(e) => setGuildId(e.target.value)}
              className="font-mono text-xs"
              disabled={isResetting}
            />
          </div>

          {status === "success" && (
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-mono">
              <Check className="size-4" />
              Premium state reset successfully
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-red-500 text-xs font-mono">
              <X className="size-4" />
              {errorMsg}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isResetting}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={!guildId.trim() || isResetting}
            className="cursor-pointer"
          >
            {isResetting ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <AlertTriangle className="size-4 mr-2" />
            )}
            Reset State
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
