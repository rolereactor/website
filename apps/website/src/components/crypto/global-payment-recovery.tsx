"use client";

import React, { useState, useEffect, useRef } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { useUserStore } from "@/store/use-user-store";
import { useNotificationStore } from "@/store/use-notification-store";

interface PendingPayment {
  txHash: string;
  packageId: string;
  chainId: number;
  senderAddress?: string;
  timestamp: number;
}

export function GlobalPaymentRecovery() {
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(
    null
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasToastTriggered, setHasToastTriggered] = useState(false);
  const fetchUser = useUserStore((state) => state.fetchUser);
  const fetchNotifications = useNotificationStore(
    (state) => state.fetchNotifications
  );

  // Check for pending payment on mount and periodically (in case multiple tabs are open)
  useEffect(() => {
    const checkStorage = () => {
      try {
        const stored = localStorage.getItem("pendingWeb3Payment");
        if (stored) {
          const parsed = JSON.parse(stored) as PendingPayment;
          if (
            parsed.txHash &&
            (!pendingPayment || pendingPayment.txHash !== parsed.txHash)
          ) {
            setPendingPayment(parsed);
          }
        } else if (pendingPayment) {
          // If it was removed from another tab, clear it here too
          setPendingPayment(null);
        }
      } catch (e) {
        console.error("Error reading pending payment", e);
      }
    };

    checkStorage();
    // Also listen to storage events to stay synced across tabs
    window.addEventListener("storage", checkStorage);
    return () => window.removeEventListener("storage", checkStorage);
  }, [pendingPayment]);

  const { isSuccess, isLoading } = useWaitForTransactionReceipt({
    hash: pendingPayment?.txHash as `0x${string}` | undefined,
  });

  // Notify user that recovery is happening
  useEffect(() => {
    if (
      pendingPayment &&
      (isLoading || isSuccess) &&
      !hasToastTriggered &&
      !isVerifying
    ) {
      toast.info("Resuming pending payment verification in background...");
      setHasToastTriggered(true);
    }
  }, [pendingPayment, isLoading, isSuccess, hasToastTriggered, isVerifying]);

  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (isSuccess && pendingPayment && !isVerifying && !hasVerifiedRef.current) {
      hasVerifiedRef.current = true;
      setIsVerifying(true);

      fetch("/api/payments/verify-web3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: pendingPayment.txHash,
          packageId: pendingPayment.packageId,
          chainId: pendingPayment.chainId,
          senderAddress: pendingPayment.senderAddress,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json();
            // If already processed, it means they recovered a transaction that actually succeeded previously
            if (err.error?.message === "Transaction already processed") {
              return true;
            }
            throw new Error(err.error?.message || "Verification failed");
          }
          return true;
        })
        .then(() => {
          toast.success("Payment verified successfully!", {
            icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
            duration: 5000,
          });
          localStorage.removeItem("pendingWeb3Payment");
          const currentUser = useUserStore.getState().user;
          if (currentUser?.userId) {
            fetchUser(currentUser.userId, true);
          }
          fetchNotifications();
          setPendingPayment(null);
        })
        .catch((err) => {
          console.error(err);
          // Clear pending payment to prevent infinite retry loop
          localStorage.removeItem("pendingWeb3Payment");
          setPendingPayment(null);
          toast.error(
            err.message ||
              "Could not verify pending payment. Please contact support."
          );
        });
    }
  }, [isSuccess, pendingPayment, isVerifying, fetchNotifications, fetchUser]);

  // This component doesn't render anything visible directly
  return null;
}
