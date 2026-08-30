import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { botFetchJson } from "@/lib/bot-fetch";

export interface VoteStatusResponse {
  hasVoted: boolean;
  canVote: boolean;
  lastVote: string | null;
  nextVote: string | null;
  totalVotes: number;
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await botFetchJson<VoteStatusResponse>(
      `/user/${userId}/vote-status`,
      { userId, silent: true }
    );

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      hasVoted: false,
      canVote: false,
      lastVote: null,
      nextVote: null,
      totalVotes: 0,
    });
  }
}
