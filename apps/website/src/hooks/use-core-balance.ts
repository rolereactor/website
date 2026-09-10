"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";

export interface BalanceData {
  balance: number;
  cores: number;
  sparks: number;
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<BalanceData> => {
  const res = await fetch(url);
  const data = await res.json();
  const cores = (data.cores ?? data.balance ?? 0) as number;
  const sparks = (data.sparks ?? 0) as number;
  return {
    balance: cores,
    cores,
    sparks,
  };
};

/**
 * Custom hook to fetch and cache user's core balance & sparks
 * Uses SWR for automatic caching, revalidation, and deduplication
 */
export function useCoreBalance() {
  const { data: session, status } = useSession();

  const {
    data: balanceData,
    isLoading: isSWRManagerLoading,
    error,
    mutate,
  } = useSWR(session?.user ? "/api/user/balance" : null, fetcher, {
    refreshInterval: 60_000, // Refresh every 60s — staggered from vote-status (45s) and notifications (30s)
    revalidateOnFocus: true, // Refetch when window gains focus
    revalidateOnReconnect: true, // Refetch on reconnect
    dedupingInterval: 5000, // Dedupe requests within 5s
    keepPreviousData: true, // Keep showing old data while fetching new
  });

  const isLoading = status === "loading" || isSWRManagerLoading;

  return {
    balance: balanceData?.cores ?? 0,
    cores: balanceData?.cores ?? 0,
    sparks: balanceData?.sparks ?? 0,
    isLoading,
    error,
    mutate, // Allows manual revalidation
  };
}
