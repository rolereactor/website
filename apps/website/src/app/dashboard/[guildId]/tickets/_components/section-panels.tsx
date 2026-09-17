"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

import { Button } from "@/components/ui/button";

import {
  useTicketStore,
  type TicketPanel,
} from "@/store/use-ticket-store";
import { useProEngineStore } from "@/store/use-pro-engine-store";
import { ActivePanels } from "./active-panels";
import { PanelBuilder } from "./panel-builder";

export function SectionPanels({ guildId }: { guildId: string }) {
  const [view, setView] = useState<"active" | "create">("active");
  const [editPanel, setEditPanel] = useState<TicketPanel | null>(null);

  const { dataCache } = useTicketStore();
  const panels = dataCache[guildId]?.panels ?? [];

  const { fetchSettings, settingsCache } = useProEngineStore();
  const premiumStatus = settingsCache[guildId] ?? null;
  const isPremium = premiumStatus?.isPremium?.pro || false;

  // Fetch limits from API
  const { data: benefitsData } = useSWR(
    "/api/premium/benefits",
    fetcher,
    { revalidateOnFocus: false }
  );

  const ticketLimit = benefitsData?.benefits?.find(
    (b: { name: string }) => b.name === "Categories per Panel"
  );
  const maxPanels = isPremium
    ? Number(ticketLimit?.pro) || 10
    : Number(ticketLimit?.free) || 3;

  useEffect(() => {
    if (guildId) {
      fetchSettings(guildId);
    }
  }, [guildId, fetchSettings]);

  const handleEdit = useCallback((panel: TicketPanel) => {
    setEditPanel(panel);
    setView("create");
  }, []);

  const handleCancel = useCallback(() => {
    setEditPanel(null);
    setView("active");
  }, []);

  const handleSaveComplete = useCallback(() => {
    setEditPanel(null);
    setView("active");
  }, []);

  return (
    <div className="min-w-0">
      {view === "active" ? (
        <>
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              {panels.length} / {maxPanels} Panels
            </span>
            <Button
              variant="cyber"
              size="sm"
              className="h-8 px-4 font-black uppercase tracking-widest text-[10px]"
              onClick={() => setView("create")}
              disabled={panels.length >= maxPanels}
            >
              <Plus className="mr-1.5 size-3" />
              Create Panel
            </Button>
          </div>
          <ActivePanels guildId={guildId} onEdit={handleEdit} />
        </>
      ) : (
        <PanelBuilder
          guildId={guildId}
          editPanel={editPanel}
          onCancel={handleCancel}
          onSaveComplete={handleSaveComplete}
        />
      )}
    </div>
  );
}
