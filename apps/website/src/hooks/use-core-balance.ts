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
 * Custom hook to fetch and cache user's core balance & sparks.
 * Pass `initialData` (from an SSR seed) to render immediately on first paint.
 */
export function useCoreBalance(initialData?: BalanceData | null) {
  const { data: session, status } = useSession();

  const {
    data: balanceData,
    isLoading: isSWRManagerLoading,
    isValidating,
    error,
    mutate,
  } = useSWR(session?.user ? "/api/user/balance" : null, fetcher, {
    fallbackData: initialData ?? undefined,
    refreshInterval: 60_000, // Refresh every 60s — staggered from vote-status (45s) and notifications (30s)
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: initialData ? false : true,
    dedupingInterval: 10_000,
    keepPreviousData: true,
  });

  // With SSR fallbackData, first paint is ready immediately — only wait on session.
  const isLoading =
    status === "loading" || (isSWRManagerLoading && !balanceData);

  return {
    balance: balanceData?.cores ?? 0,
    cores: balanceData?.cores ?? 0,
    sparks: balanceData?.sparks ?? 0,
    isLoading,
    isValidating,
    error,
    mutate, // Allows manual revalidation
  };
}
