import { CoreBalance } from "@/components/common/core-balance";
import { getCoreBalanceSafe } from "@/lib/server/balance";

interface BalanceSlotProps {
  userId: string;
}

/**
 * Server-rendered balance chip for the dashboard header.
 * Seeds SWR via getCoreBalanceSafe so the number paints in the initial
 * HTML. On bot failure, falls back to the client-only chip.
 */
export async function BalanceSlot({ userId }: BalanceSlotProps) {
  const data = await getCoreBalanceSafe(userId);

  if (!data) {
    return <CoreBalance />;
  }

  return (
    <CoreBalance
      initialData={{
        balance: data.balance,
        cores: data.cores,
        sparks: data.sparks,
      }}
    />
  );
}
