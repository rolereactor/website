import { CommandList } from "./_components/command-list";
import { PageHeader } from "@/app/dashboard/_components/page-header";
import { BotInviteCard } from "@/app/dashboard/_components/bot-invite-card";
import { Suspense } from "react";
import { Terminal } from "lucide-react";
import { NodeLoader } from "@/components/common/node-loader";

function CommandsPageSkeleton() {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-background">
      <NodeLoader
        title="Loading Dashboard"
        subtitle="Synchronizing your data..."
      />
    </div>
  );
}

import { getManageableGuilds } from "@/lib/server/guilds";

export default async function CommandsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  // Reuse the optimized server utility for guild data
  const { guilds, installedGuildIds } = await getManageableGuilds();
  const activeGuild = guilds.find((g) => g.id === guildId);

  const guildName = activeGuild?.name || "this server";
  const isInstalled = installedGuildIds.includes(guildId);

  if (!isInstalled) {
    return (
      <div className="space-y-6 w-full">
        <PageHeader
          category="Tools & Configuration"
          categoryIcon={Terminal}
          title="Command Settings"
          description="Manage availability and access for all bot commands in"
          serverName={guildName}
        />
        <BotInviteCard guildId={guildId} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        category="Tools & Configuration"
        categoryIcon={Terminal}
        title="Command Settings"
        description="Manage availability and access for all bot commands in"
        serverName={guildName}
      />

      <Suspense fallback={<CommandsPageSkeleton />}>
        <CommandList guildId={guildId} />
      </Suspense>
    </div>
  );
}
