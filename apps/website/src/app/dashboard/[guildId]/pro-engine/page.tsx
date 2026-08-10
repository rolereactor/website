"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Crown, Zap } from "lucide-react";
import { toast } from "@/lib/toast";
import { useSWRConfig } from "swr";

import { PageHeader } from "@/app/dashboard/_components/page-header";
import { useServerStore } from "@/store/use-server-store";
import { useUserStore } from "@/store/use-user-store";
import { useProEngineStore } from "@/store/use-pro-engine-store";
import { useSession } from "next-auth/react";
import { ErrorView } from "@/components/common/error-view";
import { PremiumGuard } from "@/app/dashboard/_components/premium-guard";

import { ProEngineSettings } from "./_components/settings";
import {
  ProEngineActiveAlert,
  ProEngineLockedAlert,
  ProEngineCancelledAlert,
  ProEngineTrialAlert,
  ProEngineTrialExpiredAlert,
} from "./_components/states";

import { SubscriptionStats } from "./_components/stats";
import { NodeLoader } from "@/components/common/node-loader";
import { calculateSubscriptionProgress } from "@/lib/premium-utils";
import { ProEngineBenefits } from "./_components/benefits-table";

export default function ProEnginePage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const searchParams = useSearchParams();
  const activateQuery = searchParams.get("activate");
  const router = useRouter();

  const { guilds } = useServerStore();
  const activeGuild = guilds.find((g) => g.id === guildId);
  const guildName = activeGuild?.name || "this server";

  const { data: session } = useSession();
  const { user, fetchUser, isLoading: isUserLoading } = useUserStore();
  const { settingsCache, isError, fetchSettings, updateLocalSettings } =
    useProEngineStore();

  // Get settings for THIS specific guild (not a stale previous guild)
  const settings = settingsCache[guildId] ?? null;

  const [showActivationModal, setShowActivationModal] = useState(
    activateQuery === "true"
  );
  const [isActivating, setIsActivating] = useState(false);

  // Derived State
  const premiumStatus = settings;
  const isPremium = premiumStatus?.isPremium?.pro || false;
  const isCancelled = premiumStatus?.subscription?.cancelled || false;
  const isTrialing = premiumStatus?.subscription?.isTrial || false;
  const trialEndsAt =
    premiumStatus?.subscription?.trialEndsAt ||
    premiumStatus?.subscription?.expiresAt;
  const trialUsed = premiumStatus?.subscription?.trialUsed || false;

  // Show loading when no cached data for THIS guild, or user not loaded yet
  const isGlobalLoading = !settings || (!user && isUserLoading);

  // Fetch fresh data on mount or when guildId changes (server switch).
  // If we have cached data for this guild, UI renders instantly while
  // the background refresh completes silently.
  useEffect(() => {
    if (guildId && session?.user?.id) {
      fetchSettings(guildId, true); // force refresh in background
      fetchUser(session.user.id);
    }
  }, [guildId, session?.user?.id, fetchSettings, fetchUser]);

  const { mutate } = useSWRConfig();

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/premium/activate`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Pro Engine activated successfully!");
        setShowActivationModal(false);

        // Optimistically update local store to show active state immediately
        // This prevents UI from being stuck on "LOCKED" if bot API is down
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

        updateLocalSettings(
          {
            isPremium: { pro: true },
            premiumConfig: premiumStatus?.premiumConfig,
            subscription: {
              cancelled: false,
              autoRenew: true,
              expiresAt: expiresAt.toISOString(),
              activatedAt: now.toISOString(),
              cost: premiumStatus?.premiumConfig?.PRO?.cost ?? 20,
              period: premiumStatus?.premiumConfig?.PRO?.period ?? "week",
              lastDeductionDate: now.toISOString(),
            },
          },
          guildId
        );

        // Refresh from server in background (won't break UI if it fails)
        fetchSettings(guildId, true);

        // Also refresh user balance
        if (session?.user?.id) {
          fetchUser(session.user.id, true);
        }
        mutate("/api/user/balance");

        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to activate Pro Engine");
      }
    } catch (err) {
      console.error("Activation error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsActivating(false);
    }
  };

  const handleActivateTrial = async () => {
    setIsActivating(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/premium/activate-trial`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Free trial activated! Enjoy 7 days of Pro Engine.");
        setShowActivationModal(false);

        // Optimistically update local store
        const now = new Date();
        const trialEndsAt = new Date(now);
        trialEndsAt.setDate(trialEndsAt.getDate() + 7);

        updateLocalSettings(
          {
            isPremium: { pro: true },
            premiumConfig: premiumStatus?.premiumConfig,
            subscription: {
              cancelled: false,
              autoRenew: false,
              expiresAt: trialEndsAt.toISOString(),
              activatedAt: now.toISOString(),
              cost: 0,
              period: "trial",
              lastDeductionDate: now.toISOString(),
              isTrial: true,
              trialEndsAt: trialEndsAt.toISOString(),
              trialUsed: true,
            },
          },
          guildId
        );

        // Refresh from server
        fetchSettings(guildId, true);
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to activate trial");
      }
    } catch (err) {
      console.error("Trial activation error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsActivating(false);
    }
  };

  if (isGlobalLoading) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-background">
        <NodeLoader
          title="Loading Dashboard"
          subtitle="Synchronizing your data..."
        />
      </div>
    );
  }

  if (isError && !settings) {
    return (
      <div className="space-y-6 w-full">
        <PageHeader
          category="System Configuration"
          categoryIcon={Crown}
          title="Pro Engine"
          serverName={guildName}
          description={""}
        />
        <ErrorView
          title="Failed to Load Settings"
          message={isError.message || "Could not retrieve Pro Engine status."}
          onRetry={() => fetchSettings(guildId, true)}
          showHome={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full relative">
      <PageHeader
        category="System Configuration"
        categoryIcon={Crown}
        title="Pro Engine"
        badge={
          isPremium
            ? { icon: Zap, label: "PRO STATUS", variant: "yellow" }
            : undefined
        }
        description={
          isPremium
            ? "Advanced system capabilities active for"
            : "Unlock premium capabilities and granular control for"
        }
        serverName={guildName}
      />

      <div className="space-y-4 pb-8 relative">
        {/* Status Alerts */}
        {isPremium && isTrialing ? (
          <>
            <ProEngineTrialAlert
              trialEndsAt={trialEndsAt ?? undefined}
              onUpgrade={() => setShowActivationModal(true)}
              coreCost={premiumStatus?.premiumConfig?.PRO?.cost}
              corePeriod={premiumStatus?.premiumConfig?.PRO?.period}
            />
          </>
        ) : isPremium && premiumStatus?.subscription ? (
          <>
            <ProEngineActiveAlert
              isCancelled={isCancelled}
              expiresAt={premiumStatus.subscription.expiresAt ?? undefined}
            />
            {isCancelled && premiumStatus.subscription.expiresAt && (
              <ProEngineCancelledAlert
                expiresAt={premiumStatus.subscription.expiresAt}
                cost={premiumStatus.subscription.cost ?? undefined}
                period={premiumStatus.subscription.period ?? undefined}
                newCost={premiumStatus?.premiumConfig?.PRO?.cost}
                newPeriod={premiumStatus?.premiumConfig?.PRO?.period}
                progress={
                  calculateSubscriptionProgress(
                    premiumStatus.subscription.expiresAt,
                    premiumStatus.subscription.lastDeductionDate ?? undefined,
                    premiumStatus?.premiumConfig?.PRO?.periodDays ?? 7
                  ).progress
                }
                onReactivate={() => setShowActivationModal(true)}
              />
            )}
          </>
        ) : !isPremium && trialUsed ? (
          <>
            <ProEngineTrialExpiredAlert
              onSubscribe={() => setShowActivationModal(true)}
              coreCost={premiumStatus?.premiumConfig?.PRO?.cost}
              corePeriod={premiumStatus?.premiumConfig?.PRO?.period}
            />
            <ProEngineBenefits />
          </>
        ) : (
          <>
            <ProEngineLockedAlert
              onUnlock={() => setShowActivationModal(true)}
            />
            <ProEngineBenefits />
          </>
        )}
        {/* Premium Management & Stats */}
        {isPremium && premiumStatus?.subscription && (
          <>
            <SubscriptionStats
              premiumStatus={premiumStatus}
              isCancelled={isCancelled}
            />
            <ProEngineBenefits isActive={true} />
            <ProEngineSettings
              guildId={guildId}
              premiumStatus={premiumStatus}
              isCancelled={isCancelled}
              onSubscriptionCancelled={() => {
                // Optimistically update local data
                if (settings) {
                  updateLocalSettings({
                    subscription: {
                      ...settings.subscription!,
                      cancelled: true,
                    },
                  });
                }

                // Refresh from server
                fetchSettings(guildId, true);
                router.refresh();
              }}
            />
          </>
        )}
      </div>

      <PremiumGuard
        open={showActivationModal}
        onOpenChange={setShowActivationModal}
        isActivating={isActivating}
        onActivate={handleActivate}
        onTrial={handleActivateTrial}
        showTrialOption={!isPremium && !trialUsed}
        title={
          isPremium && isCancelled
            ? "RESTORE ACTIVE STATUS"
            : "ACTIVATE PRO ENGINE"
        }
        description={
          isPremium && isCancelled
            ? "Re-activate your subscription. Detailed billing will resume on your next renewal date."
            : "Unlock all premium features for this server with a single click."
        }
        buttonText={
          isPremium && isCancelled
            ? "ENABLE AUTO-RENEW"
            : `UNLOCK FOR ${premiumStatus?.premiumConfig?.PRO?.cost ?? 20} CORES`
        }
        subText={
          isPremium && isCancelled
            ? `New terms: ${premiumStatus?.premiumConfig?.PRO?.cost ?? 20} Cores/${premiumStatus?.premiumConfig?.PRO?.period ?? "week"}`
            : `Deducts ${premiumStatus?.premiumConfig?.PRO?.cost ?? 20} Cores every ${premiumStatus?.premiumConfig?.PRO?.periodDays ?? 7} days`
        }
      />
    </div>
  );
}
