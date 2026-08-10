"use client";

import { useEffect, useState, useMemo, ReactNode } from "react";
import { useSession, signIn } from "next-auth/react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePricingStore } from "@/store/use-pricing-store";
import { useUserStore } from "@/store/use-user-store";
import type { CorePackage } from "@/types/pricing";
import Image from "next/image";
import { useUiSound } from "@/hooks/use-ui-sound";
import { toast } from "@/lib/toast";

import { PackagesView } from "./packages-view";
import { PaymentMethodView } from "./payment-method-view";
import { PaymentPendingView } from "./payment-pending-view";

const SESSION_STORAGE_KEY = "role-reactor-pending-package";

interface PricingDialogProps {
  children?: ReactNode;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PricingDialog({
  children,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: PricingDialogProps) {
  const { data: session } = useSession();
  const { playConfirm, playSwitch } = useUiSound();
  const [internalOpen, setInternalOpen] = useState(false);
  const [view, setView] = useState<"packages" | "payment" | "payment_pending">(
    "packages"
  );

  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;

  const {
    data: pricingData,
    isLoading: isStoreLoading,
    fetchPricing,
  } = usePricingStore();

  const { updateBalance, fetchUser } = useUserStore();

  const packages = useMemo(
    () => pricingData?.packages || [],
    [pricingData?.packages]
  );
  const loading = isStoreLoading;

  useEffect(() => {
    if (pricingData?.user?.currentCredits) {
      updateBalance(pricingData.user.currentCredits);
    }
  }, [pricingData?.user, updateBalance]);

  const [selectedPackage, setSelectedPackage] = useState<CorePackage | null>(
    null
  );
  const [loadingPackageId] = useState<string | null>(null);
  const [loadingCryptoId, setLoadingCryptoId] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<{
    orderId: string;
    expectedCores: number;
    initialBalance: number;
  } | null>(null);
  const [initialBalance, setInitialBalance] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      fetchPricing(session?.user?.id);
      setView("packages");

      if (session?.user?.id) {
        const savedPackageId = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedPackageId) {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          const pkg = packages.find((p) => p.id === savedPackageId);
          if (pkg) {
            setSelectedPackage(pkg);
            setView("payment");
          }
        }
      }
    }
  }, [isOpen, fetchPricing, session?.user?.id, packages]);

  useEffect(() => {
    if (session?.user?.id && pricingData?.user?.currentCredits) {
      setInitialBalance(pricingData.user.currentCredits);
    }
  }, [session?.user?.id, pricingData?.user?.currentCredits]);

  const handlePaymentInitiation = (packageId: string) => {
    if (!session?.user?.id) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, packageId);
      signIn("discord", { callbackUrl: window.location.href });
      return;
    }

    const pkg = packages.find((p) => p.id === packageId);
    if (pkg) {
      playSwitch();
      setSelectedPackage(pkg);
      setView("payment");
    }
  };

  const handleCryptoPayment = async (currency: string, provider: string) => {
    if (!selectedPackage) return;

    setLoadingCryptoId(currency);

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedPackage.price,
          packageId: selectedPackage.id,
          currency,
          provider,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        await response.text();
        throw new Error(`Invalid response from server (${response.status})`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            data.error ||
            data.message ||
            "Failed to create payment"
        );
      }

      const paymentUrl = data.data?.paymentUrl || data.data?.invoiceUrl;
      const orderId = data.data?.orderId;
      if (paymentUrl) {
        window.open(paymentUrl, "_blank", "noopener,noreferrer");
        setPendingPayment({
          orderId,
          expectedCores: selectedPackage.totalCores,
          initialBalance,
        });
        setView("payment_pending");
      } else {
        throw new Error("No payment URL received from server");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to create payment"
      );
    } finally {
      setLoadingCryptoId(null);
    }
  };

  const handleBMACPayment = () => {
    window.location.href = "/donate";
  };

  const handlePaymentComplete = () => {
    playConfirm();
    toast.success("Cores added to your balance!");
    if (session?.user?.id) {
      fetchUser(session.user.id, true);
    }
    setPendingPayment(null);
    setOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        {trigger ? (
          <DialogTrigger asChild>{trigger as React.ReactElement}</DialogTrigger>
        ) : (
          <DialogTrigger asChild>
            {
              (children || (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 bg-zinc-900 border border-white/5 hover:border-cyan-500/30 transition-all rounded-xl h-9"
                >
                  <Image
                    src="/images/cores/core_energy.png"
                    width={18}
                    height={18}
                    alt="Core"
                    className="drop-shadow-[0_0_5px_rgba(0,255,255,0.4)]"
                  />
                  <span className="font-bold text-xs uppercase tracking-widest text-zinc-300">
                    Get Cores
                  </span>
                </Button>
              )) as React.ReactElement
            }
          </DialogTrigger>
        )}
        <DialogContent
          variant="glitch"
          className="max-w-105"
          innerClassName="flex flex-col"
          hideClose={view !== "packages"}
          aria-describedby={undefined}
        >
          {view === "packages" ? (
            <PackagesView
              packages={packages}
              pricingData={pricingData}
              onPaymentInitiation={handlePaymentInitiation}
              onBMACPayment={handleBMACPayment}
              loadingPackageId={loadingPackageId}
              loading={loading}
            />
          ) : view === "payment_pending" ? (
            <PaymentPendingView
              pendingPayment={pendingPayment}
              onComplete={handlePaymentComplete}
              onReturn={() => {
                if (session?.user?.id) {
                  fetchUser(session.user.id, true);
                }
                setPendingPayment(null);
                setOpen(false);
              }}
            />
          ) : (
            selectedPackage && (
              <PaymentMethodView
                selectedPackage={selectedPackage}
                onBack={() => {
                  playSwitch();
                  setView("packages");
                }}
                onCryptoPayment={handleCryptoPayment}
                loadingCryptoId={loadingCryptoId}
                playConfirm={playConfirm}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
