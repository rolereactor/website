"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  LayoutDashboard,
  User,
  Zap,
  ChevronUp,
  Home,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";
import { CoreBalance } from "@/components/common/core-balance";

export interface UserMenuUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface UserMenuProps {
  /** Current user data */
  user: UserMenuUser | null | undefined;
  /** Authentication status */
  status: "loading" | "authenticated" | "unauthenticated";
  /** Core balance image URL */
  coreImageUrl?: string;
  /** Called when user clicks login */
  onLogin?: () => void;
  /** Called when user clicks logout */
  onLogout?: () => void;
  /** Called when user clicks to add credits */
  onAddCredits?: () => void;
  /** Dashboard URL */
  dashboardUrl?: string;
  /** Profile URL */
  profileUrl?: string;
  /** Billing URL */
  billingUrl?: string;
  /** Whether to show dashboard link */
  showDashboardLink?: boolean;
  /** Whether to show profile link */
  showProfileLink?: boolean;
  /** Whether to show billing link */
  showBillingLink?: boolean;
  /** Custom label for dashboard link */
  dashboardLabel?: string;
  /** Whether to show core balance */
  showCoreBalance?: boolean;
  /** Variant for different layouts */
  variant?: "header" | "sidebar";
  /** Custom trigger element (for sidebar integration) */
  customTrigger?: React.ReactNode;
  /** Additional className for root element */
  className?: string;
  /** Dropdown side */
  side?: "top" | "bottom" | "left" | "right";
  /** Dropdown align */
  align?: "start" | "center" | "end";
  /** Hide the avatar/name section in the dropdown content (useful if trigger already shows it) */
  hideUserInfo?: boolean;
}

// Helper function to get user initials
function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Helper function to get avatar URL
function getAvatarUrl(user: UserMenuUser): string {
  if (user.image) return user.image;
  if (user.id) {
    return `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 5}.png`;
  }
  return `https://cdn.discordapp.com/embed/avatars/0.png`;
}

export function UserMenu({
  user,
  status,
  coreImageUrl = "/images/cores/core_energy.png",
  onLogin,
  onLogout,
  onAddCredits,
  dashboardUrl = "/dashboard",
  profileUrl = "/dashboard/profile",
  billingUrl = "/dashboard/billing",
  showDashboardLink = true,
  showProfileLink = true,
  showBillingLink = true,
  dashboardLabel = "Dashboard",
  showCoreBalance = true,
  variant = "header",
  customTrigger,
  className,
  side = "bottom",
  align = "end",
  hideUserInfo = false,
}: UserMenuProps) {
  const pathname = usePathname();
  const isHome = !pathname?.startsWith("/dashboard");
  const isGlobalDashboard = pathname === "/dashboard";

  // Loading state
  if (status === "loading") {
    // Prefer custom trigger if provided
    if (customTrigger) {
      return (
        <div className={cn("relative flex items-center gap-2", className)}>
          {customTrigger}
        </div>
      );
    }

    // Fallback loading states based on variant
    if (variant === "sidebar") {
      return (
        <div className={cn("w-full px-2 py-2", className)}>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      );
    }

    // Default header variant
    return (
      <div className={cn("relative flex items-center gap-2", className)}>
        {showCoreBalance && (
          <CoreBalance variant="full" coreImageUrl={coreImageUrl} />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg cursor-not-allowed opacity-50"
          disabled
        >
          <div className="h-8 w-8 rounded-full bg-zinc-800/50 animate-pulse" />
        </Button>
      </div>
    );
  }

  // Unauthenticated state
  if (status === "unauthenticated" || !user) {
    return (
      <Button
        variant="neon"
        size="sm"
        onClick={onLogin}
        aria-label="Login"
        title="Login"
        data-text="LOGIN"
        className={cn("h-8 font-mono tracking-wider", className)}
      >
        Login
      </Button>
    );
  }

  const avatarUrl = getAvatarUrl(user);
  const isSidebar = variant === "sidebar";

  const defaultTrigger = isSidebar ? (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 px-3 py-6 relative overflow-hidden group border border-transparent hover:border-cyan-500/30 hover:bg-cyan-950/20 transition-all duration-300 data-[state=open]:border-cyan-500/50 data-[state=open]:bg-cyan-950/30"
    >
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <Avatar className="h-9 w-9 rounded-lg shrink-0 ring-2 ring-cyan-500/20 group-hover:ring-cyan-500/50 transition-all shadow-[0_0_10px_-2px_rgba(6,182,212,0.3)]">
        <AvatarImage
          src={avatarUrl}
          alt={user.name || "User"}
          width={36}
          height={36}
        />
        <AvatarFallback className="rounded-lg bg-zinc-900 border border-white/10 text-xs font-mono text-cyan-400">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight min-w-0 z-10">
        <span className="truncate font-bold font-mono text-zinc-100 group-hover:text-cyan-300 transition-colors">
          {user.name}
        </span>
        <span className="truncate text-xs text-zinc-500 group-hover:text-cyan-600/80 font-mono transition-colors">
          {user.email}
        </span>
      </div>
      <ChevronUp className="ml-auto size-4 shrink-0 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
    </Button>
  ) : (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-xl cursor-pointer border border-transparent hover:border-cyan-500/30 hover:bg-cyan-950/20 hover:shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)] transition-all duration-300 group"
      aria-label="User menu"
      title={user.name || "User menu"}
    >
      <Avatar className="h-7 w-7 ring-1 ring-white/10 group-hover:ring-cyan-500/50 transition-all">
        <AvatarImage
          src={avatarUrl}
          alt={user.name || "User avatar"}
          width={28}
          height={28}
        />
        <AvatarFallback className="text-xs bg-zinc-900 text-cyan-400 font-mono">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
    </Button>
  );

  return (
    <div
      className={cn("relative flex items-center gap-2", className)}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Core Balance Display (header variant only) */}
      {!isSidebar && showCoreBalance && (
        <CoreBalance
          variant="full"
          coreImageUrl={coreImageUrl}
          onClick={onAddCredits}
        />
      )}

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {customTrigger || defaultTrigger}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          side={side}
          sideOffset={8}
          portal={!isSidebar}
          variant="cyber"
          className={cn(
            "w-72 p-0 rounded-2xl overflow-hidden",
            isSidebar && "w-[--radix-dropdown-menu-trigger-width] min-w-64"
          )}
        >
          {/* Cyberpunk Decorative Line */}
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent" />

          <DropdownMenuLabel className="font-normal p-0 bg-zinc-900/50">
            {!hideUserInfo && (
              <div className="flex items-center gap-4 px-4 py-4 border-b border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-purple-500/5 opacity-50" />
                <Avatar className="h-10 w-10 shrink-0 ring-2 ring-cyan-500/20 shadow-[0_0_15px_-4px_rgba(6,182,212,0.4)] z-10">
                  <AvatarImage
                    src={avatarUrl}
                    alt={user.name || "User avatar"}
                    width={40}
                    height={40}
                  />
                  <AvatarFallback className="text-sm bg-black text-cyan-400 font-mono border border-cyan-500/30">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1 overflow-hidden z-10">
                  <span className="text-sm font-bold truncate leading-none mb-1.5 text-white font-mono tracking-wide">
                    {user.name}
                  </span>
                  {user.email && (
                    <span className="text-xs text-zinc-400 truncate leading-none font-mono">
                      {user.email}
                    </span>
                  )}
                </div>
              </div>
            )}
          </DropdownMenuLabel>

          <div className="p-2 space-y-1">
            {/* Dashboard Link - Hidden only if we are already on the global admin dashboard */}
            {showDashboardLink && !(isSidebar && isGlobalDashboard) && (
              <DropdownMenuItem asChild>
                <a
                  href={dashboardUrl}
                  className="cursor-pointer flex items-center py-2.5 px-3 rounded-xl transition-all hover:bg-cyan-500/10 hover:text-cyan-300 group focus:bg-cyan-500/10 focus:text-cyan-300 border border-transparent hover:border-cyan-500/20"
                >
                  <LayoutDashboard className="mr-3 h-4 w-4 text-zinc-400 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)] transition-all" />
                  <span className="font-medium font-mono text-sm">
                    {dashboardLabel}
                  </span>
                </a>
              </DropdownMenuItem>
            )}

            {/* Profile Link */}
            {showProfileLink && (
              <DropdownMenuItem asChild>
                <a
                  href={profileUrl}
                  className="cursor-pointer flex items-center py-2.5 px-3 rounded-xl transition-all hover:bg-cyan-500/10 hover:text-cyan-300 group focus:bg-cyan-500/10 focus:text-cyan-300 border border-transparent hover:border-cyan-500/20"
                >
                  <User className="mr-3 h-4 w-4 text-zinc-400 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)] transition-all" />
                  <span className="font-medium font-mono text-sm">Profile</span>
                </a>
              </DropdownMenuItem>
            )}

            {/* Billing Link */}
            {showBillingLink && (
              <DropdownMenuItem asChild>
                <a
                  href={billingUrl}
                  className="cursor-pointer flex items-center py-2.5 px-3 rounded-xl transition-all hover:bg-cyan-500/10 hover:text-cyan-300 group focus:bg-cyan-500/10 focus:text-cyan-300 border border-transparent hover:border-cyan-500/20"
                >
                  <Zap className="mr-3 h-4 w-4 text-zinc-400 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)] transition-all" />
                  <span className="font-medium font-mono text-sm">
                    Core &amp; Sparks
                  </span>
                </a>
              </DropdownMenuItem>
            )}

            {(showDashboardLink || showProfileLink || showBillingLink) && (
              <div className="h-px bg-white/5 my-1 mx-2" />
            )}

            {/* Return to Website - Hidden on home page */}
            {!isHome && (
              <DropdownMenuItem asChild>
                <Link
                  href="/"
                  className="cursor-pointer flex items-center py-2.5 px-3 rounded-xl transition-all hover:bg-cyan-500/10 hover:text-cyan-300 group focus:bg-cyan-500/10 focus:text-cyan-300 border border-transparent hover:border-cyan-500/20"
                >
                  <Home className="mr-3 h-4 w-4 text-zinc-400 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)] transition-all" />
                  <span className="font-medium font-mono text-sm">
                    Return Home
                  </span>
                </Link>
              </DropdownMenuItem>
            )}

            {!isHome && <div className="h-px bg-white/5 my-1 mx-2" />}

            {/* Logout */}
            <DropdownMenuItem
              onClick={onLogout}
              className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 focus:bg-red-500/10 flex items-center py-2.5 px-3 rounded-xl border border-transparent hover:border-red-500/20 group transition-all"
            >
              <LogOut className="mr-3 h-4 w-4 group-hover:drop-shadow-[0_0_5px_rgba(239,68,68,0.5)] transition-all" />
              <span className="font-medium font-mono text-sm">LOGOUT</span>
            </DropdownMenuItem>
          </div>

          {/* Bottom decorative border */}
          <div className="h-0.5 w-full bg-linear-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0" />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
