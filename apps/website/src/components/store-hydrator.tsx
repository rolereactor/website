"use client";

import { useEffect, useRef } from "react";
import { useServerStore, type DiscordGuild } from "@/store/use-server-store";

interface StoreHydratorProps {
  guilds: DiscordGuild[];
  installedGuildIds: string[];
}

/**
 * A tiny client component that hydrates the Zustand server store
 * with data fetched on the server during the initial render.
 */
export function StoreHydrator({
  guilds,
  installedGuildIds,
}: StoreHydratorProps) {
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (!hasHydrated.current) {
      if (guilds.length > 0) {
        useServerStore.setState({
          guilds,
          installedGuildIds,
          isLoading: false,
          isFetching: false,
          lastFetched: Date.now(),
        });
      }
      hasHydrated.current = true;
    }
  }, [guilds, installedGuildIds]);

  return null;
}
