"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TwitchModDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botUsername: string;
  channelUsername: string;
}

export function TwitchModDialog({
  open,
  onOpenChange,
  botUsername,
  channelUsername,
}: TwitchModDialogProps) {
  const [copied, setCopied] = useState(false);

  const modCommand = `/mod ${botUsername}`;
  const chatUrl = `https://www.twitch.tv/popout/${channelUsername}/chat`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(modCommand);
      setCopied(true);
      toast.success("Command copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <span className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <span className="text-purple-400 text-lg">🛡️</span>
            </span>
            Moderator Setup
          </DialogTitle>
          <DialogDescription>
            To enable moderation features, make <span className="text-purple-300 font-medium">@{botUsername}</span> a
            moderator in your channel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center size-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold shrink-0">
              1
            </div>
            <div>
              <p className="text-sm text-white font-medium">Open your Twitch chat</p>
              <p className="text-xs text-zinc-500">Go to your channel and open the chat panel</p>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] mt-2"
                onClick={() => window.open(chatUrl, "_blank")}
              >
                Open Chat
                <ExternalLink className="size-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center size-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold shrink-0">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm text-white font-medium">Paste and send the command</p>
              <p className="text-xs text-zinc-500">Copy the command below and paste it in your chat</p>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-purple-500/20 text-purple-300 font-mono text-sm">
                  {modCommand}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 shrink-0"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center size-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
              3
            </div>
            <div>
              <p className="text-sm text-white font-medium">Done!</p>
              <p className="text-xs text-zinc-500">
                Click &quot;Check Mod&quot; on the connection card to confirm
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
