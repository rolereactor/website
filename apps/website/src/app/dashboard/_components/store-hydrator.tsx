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
      hasHydrated.current = true;
      if (guilds.length > 0) {
        // Server pre-fetched data — hydrate the store immediately
        useServerStore.setState({
          guilds,
          installedGuildIds,
          isLoading: false,
          isFetching: false,
          lastFetched: Date.now(),
        });
      } else {
        // Server returned nothing (bot offline / no guilds) — mark loading done
        // so the client's fetchServers can take over
        useServerStore.setState({ isLoading: false, isFetching: false });
      }
    }
  }, [guilds, installedGuildIds]);

  return null;
}
