import { UserPlus, Bell } from "lucide-react";
import { Audiowide } from "next/font/google";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatePanel } from "@/components/common/state-panel";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface WelcomeDisabledStateProps {
  onEnable: () => void;
}

export function WelcomeDisabledState({ onEnable }: WelcomeDisabledStateProps) {
  return (
    <Card
      variant="cyberpunk"
      className="border-cyan-500/20 bg-cyan-500/5 backdrop-blur-sm"
    >
      <CardContent className="p-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <UserPlus className="w-12 h-12 text-cyan-400" />
          </div>
          <div className="space-y-2">
            <h3
              className={cn(
                "text-xl font-black text-white uppercase tracking-widest",
                audiowide.className
              )}
            >
              Welcome System Disabled
            </h3>
            <p className="text-sm text-zinc-400 font-medium max-w-md">
              The welcome system is currently inactive. Enable it to start
              welcoming new members automatically.
            </p>
          </div>
          <Button
            variant="cyber"
            size="lg"
            onClick={onEnable}
            className={cn(
              "px-8 font-black uppercase tracking-widest",
              audiowide.className
            )}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Enable Welcome System
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function WelcomeEmptyState() {
  return (
    <StatePanel
      variant="empty"
      icon={Bell}
      title="No Welcome Messages Yet"
      description="Once new members join, their welcome messages will appear here."
    />
  );
}
