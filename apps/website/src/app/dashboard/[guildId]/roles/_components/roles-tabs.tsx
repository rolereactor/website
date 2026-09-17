"use client";

import { useState, useCallback, useEffect, lazy } from "react";
import { Audiowide } from "next/font/google";
import { Plus, List, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveMenus } from "./active-menus";
import { BundleSection } from "./bundle-section";
import { useProEngineStore } from "@/store/use-pro-engine-store";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const RoleBuilder = lazy(() =>
  import("./role-builder").then((mod) => ({ default: mod.RoleBuilder }))
);

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export interface EditData {
  messageId: string;
  title: string;
  description: string;
  color: string;
  hideList: boolean;
  selectionMode: string;
  channelId: string;
  channelName?: string;
  reactions: Array<{
    emoji: string;
    roleId: string;
    roleName: string;
    roleColor: number;
    roleIds?: string[];
    roleNames?: string[];
    roleColors?: number[];
  }>;
}

export function RolesTabs({
  guildId,
  onEdit,
  onCreate,
}: {
  guildId: string;
  onEdit: (data: EditData) => void;
  onCreate: () => void;
}) {
  const [activeTab, setActiveTab] = useState("active");
  const [editData, setEditData] = useState<EditData | null>(null);

  // Fetch usage data
  const { data: menusData } = useSWR(
    guildId ? `/api/guilds/${guildId}/role-reactions?limit=100` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: benefitsData } = useSWR(
    "/api/premium/benefits",
    fetcher,
    { revalidateOnFocus: false }
  );

  const menusCount = menusData?.roleMappings?.length || 0;

  // Check Pro status to use correct limit
  const { settingsCache, currentGuildId, fetchSettings } = useProEngineStore();
  const proSettings = settingsCache[currentGuildId ?? guildId] ?? null;
  const isPro = proSettings?.isPremium?.pro || false;

  const maxPanels = isPro
    ? (benefitsData?.benefits?.find((b: { name: string }) => b.name === "Reaction Panels")?.pro || "15")
    : (benefitsData?.benefits?.find((b: { name: string }) => b.name === "Reaction Panels")?.free || "3");

  const handleEdit = useCallback(
    (data: EditData) => {
      setEditData(data);
      setActiveTab("create");
      onEdit(data);
    },
    [onEdit]
  );

  const handleCancelEdit = useCallback(() => {
    setEditData(null);
    setActiveTab("active");
  }, []);

  const handleSaveComplete = useCallback(() => {
    setEditData(null);
    setActiveTab("active");
  }, []);

  useEffect(() => {
    if (guildId) {
      fetchSettings(guildId);
    }
  }, [guildId, fetchSettings]);

  const isEditing = editData !== null;

  return (
    <div className="space-y-4">
      {/* Bundle Section - always visible */}
      <BundleSection guildId={guildId} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-5 min-w-0 px-1">
        {/* Usage Display */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <List className="w-4 h-4 text-cyan-400" />
            <span>
              <span className="text-zinc-200 font-medium">{menusCount}</span>
              <span className="text-zinc-500">/{maxPanels} panels</span>
            </span>
          </div>
        </div>

        <TabsList variant="neon" className="w-full lg:w-auto flex min-w-0">
          <TabsTrigger
            variant="neon"
            value="active"
            className={cn(
              "flex-1 lg:flex-none flex items-center gap-2",
              audiowide.className
            )}
          >
            <List className="w-4 h-4" />
            Active Setups
          </TabsTrigger>
          <TabsTrigger
            variant="neon-purple"
            value="create"
            className={cn(
              "flex-1 lg:flex-none flex items-center gap-2",
              audiowide.className
            )}
            onClick={onCreate}
          >
            {isEditing ? (
              <>
                <Pencil className="w-4 h-4" />
                Edit Setup
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Setup
              </>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="active" className="mt-0">
        <ActiveMenus guildId={guildId} onEdit={handleEdit} />
      </TabsContent>

      <TabsContent value="create" className="mt-0">
        <RoleBuilder
          guildId={guildId}
          editData={editData}
          onCancelEdit={handleCancelEdit}
          onSaveComplete={handleSaveComplete}
        />
      </TabsContent>
      </Tabs>
    </div>
  );
}
