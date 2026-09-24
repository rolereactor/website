import { type ReactNode, Suspense } from "react";
import type { Metadata } from "next";
import { DashboardSidebar } from "@/app/dashboard/_components/sidebar";
import { DashboardHeader } from "@/app/dashboard/_components/header";
import { BalanceSlot } from "@/app/dashboard/_components/balance-slot";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { PageTransition } from "@/components/common/page-transition";
import { NavigationProgress } from "@/components/common/navigation-progress";
import { GlobalStateLoader } from "@/components/common/global-state-loader";
import { CommandMenu } from "@/components/common/command-menu";
import { MobileBottomNav } from "./_components/mobile-bottom-nav";

export const metadata: Metadata = {
  title: "Dashboard | Role Reactor",
  description: "Manage your Role Reactor bot settings",
};

import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { isDeveloper } from "@/lib/admin";
import { getManageableGuilds } from "@/lib/server/guilds";
import { StoreHydrator } from "./_components/store-hydrator";

import { ScrollArea } from "@/components/ui/scroll-area";

async function ServerStoreData() {
  try {
    const { guilds, installedGuildIds } = await getManageableGuilds();
    return (
      <StoreHydrator guilds={guilds} installedGuildIds={installedGuildIds} />
    );
  } catch {
    // Gracefully render nothing — the client-side fetchServers will handle loading
    return <StoreHydrator guilds={[]} installedGuildIds={[]} />;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    notFound();
  }

  // Resolved server-side so client components never read env vars (avoids hydration mismatch)
  const developerAccess = isDeveloper(session.user);

  return (
    <SidebarProvider className="flex h-dvh w-full overflow-hidden bg-background">
      <Suspense fallback={null}>
        <ServerStoreData />
      </Suspense>
      <NavigationProgress />
      <CommandMenu />
      <DashboardSidebar user={session.user} developerAccess={developerAccess} />
      <SidebarInset className="relative flex flex-col flex-1 min-w-0 md:my-2 md:mr-2 md:rounded-xl md:shadow-2xl border border-white/5 bg-background/50 backdrop-blur-sm overflow-hidden h-dvh pb-14 md:pb-0">
        <DashboardHeader
          balanceSlot={
            <Suspense fallback={null}>
              <BalanceSlot userId={session.user.id} />
            </Suspense>
          }
        />
        <main className="flex-1 overflow-hidden relative">
          <GlobalStateLoader />
          <ScrollArea className="h-full">
            <div className="page-container">
              <PageTransition>{children}</PageTransition>
            </div>
          </ScrollArea>
        </main>
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
