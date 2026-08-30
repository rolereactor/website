"use client";

import useSWR from "swr";
import { useRef } from "react";
import { useSession } from "next-auth/react";
import type { VoteStatusResponse } from "@/app/api/user/vote-status/route";

const fetcher = async (url: string): Promise<VoteStatusResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    return {
      hasVoted: false,
      canVote: false,
      lastVote: null,
      nextVote: null,
      totalVotes: 0,
    };
  }
  return res.json();
};

/**
 * Custom hook to fetch user's Top.gg vote status and cooldown.
 * - Polls every 30s when user can vote (so notification clears quickly after voting)
 * - Polls every 5min when on 12h cooldown (reduces API load)
 * - Revalidates immediately on tab focus (catches webhook update when user returns from top.gg)
 */
export function useVoteStatus() {
  const { data: session, status } = useSession();

  // Track last known canVote via ref — used in refreshInterval callback to avoid circular deps
  const canVoteRef = useRef<boolean>(true);

  const { data, isLoading: isSWRLoading, error, mutate } = useSWR(
    session?.user ? "/api/user/vote-status" : null,
    fetcher,
    {
      // SWR accepts a function for refreshInterval — evaluated each cycle
      refreshInterval: () => (canVoteRef.current ? 30_000 : 5 * 60_000),
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5_000,
      keepPreviousData: true,
      onSuccess: (result) => {
        canVoteRef.current = result.canVote;
      },
    }
  );

  const isLoading = status === "loading" || isSWRLoading;

  return {
    canVote: data?.canVote ?? false,
    hasVoted: data?.hasVoted ?? false,
    nextVote: data?.nextVote ? new Date(data.nextVote) : null,
    totalVotes: data?.totalVotes ?? 0,
    isLoading,
    error,
    mutate,
  };
}
