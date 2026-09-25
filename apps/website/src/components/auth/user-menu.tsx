"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  UserMenu as SharedUserMenu,
  UserMenuProps as SharedUserMenuProps,
} from "@/components/ui/user-menu";
import { PricingDialog } from "@/components/pricing/pricing-dialog";
import { useUserStore } from "@/store/use-user-store";

type Props = Omit<
  SharedUserMenuProps,
  "onLogin" | "onLogout" | "onAddCredits"
> & {
  hideUserInfo?: boolean;
};

export function UserMenu(props: Partial<Props>) {
  const { data: session, status } = useSession();
  const { clearUser } = useUserStore();
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  // Clear stale store data when signed out. Balance itself is owned by
  // useCoreBalance (SWR); pricing flows fetch user store on demand.
  useEffect(() => {
    if (status === "unauthenticated") {
      clearUser();
    }
  }, [status, clearUser]);

  const effectiveStatus = status;

  return (
    <>
      <PricingDialog open={isPricingOpen} onOpenChange={setIsPricingOpen}>
        <span className="hidden" />
      </PricingDialog>

      <SharedUserMenu
        user={session?.user}
        status={effectiveStatus}
        coreImageUrl="/images/core_energy.png"
        onLogin={() => {
          const currentPath =
            typeof window !== "undefined" ? window.location.pathname : "/";
          signIn("discord", { callbackUrl: currentPath });
        }}
        onLogout={() => signOut({ callbackUrl: "/" })}
        onAddCredits={() => setIsPricingOpen(true)}
        hideUserInfo={props.hideUserInfo}
        dashboardUrl="/dashboard"
        variant="header"
        showCoreBalance={true}
        {...props}
      />
    </>
  );
}
