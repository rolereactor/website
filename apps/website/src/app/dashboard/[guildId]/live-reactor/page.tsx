"use client";

import { use } from "react";
import { Radio, Sparkles } from "lucide-react";

import { useServerStore } from "@/store/use-server-store";

import { PageHeader } from "@/app/dashboard/_components/page-header";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface StreamingPageProps {
  params: Promise<{ guildId: string }>;
}

export default function StreamingPage({ params }: StreamingPageProps) {
  const { guildId } = use(params);
  const { guilds } = useServerStore();
  const activeGuild = guilds.find((g) => g.id === guildId);
  const guildName = activeGuild?.name || "this server";

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        category="Engagement Management"
        categoryIcon={Radio}
        title="Live Reactor"
        description="Twitch stream alerts and chat features for"
        serverName={guildName}
      />

      <Card className="border-white/6 bg-white/2">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex items-center justify-center size-14 rounded-xl bg-rose-500/10 border border-rose-500/25">
            <Radio className="size-7 text-rose-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-lg font-black text-white tracking-widest uppercase">
                Live Reactor
              </h2>
              <span className="rounded-md border border-zinc-700/60 bg-zinc-800/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Coming Soon
              </span>
            </div>
            <p className="max-w-md text-sm text-zinc-500 leading-relaxed">
              Stream alerts, live notifications, and a real-time chat bot are
              on the way. Stay tuned — this feature isn&apos;t released yet.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/6 bg-white/2 px-3 py-1.5 text-[11px] text-zinc-500">
            <Sparkles className="size-3.5 text-cyan-400/70" />
            Early access coming for PRO servers
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
