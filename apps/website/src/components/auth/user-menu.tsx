"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  UserMenu as SharedUserMenu,
  UserMenuProps as SharedUserMenuProps,
} from "@/components/ui/user-menu";
import { PricingDialog } from "@/components/pricing/pricing-dialog";
import { useUserStore } from "@/store/use-user-store";

// Omit the props we are overriding/handling internally
type Props = Omit<
  SharedUserMenuProps,
  "onLogin" | "onLogout" | "onAddCredits"
> & {
  // Add any specific props if needed, but for now we just pass through
  hideUserInfo?: boolean;
};

export function UserMenu(props: Partial<Props>) {
  const { data: session, status } = useSession();
  const { fetchUser, clearUser } = useUserStore();
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  // Handle session sync with store
  useEffect(() => {
    if (session?.user?.id) {
      // Delay to avoid overwhelming bot with concurrent requests
      const timer = setTimeout(() => fetchUser(session.user.id), 500);
      return () => clearTimeout(timer);
    } else if (status === "unauthenticated") {
      clearUser();
    }
  }, [session, status, fetchUser, clearUser]);

  // Determine the actual status
  // We want to show loading state if it's loading, even if the cookie check is unsure
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
