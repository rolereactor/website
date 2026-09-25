"use client";

import { useSearchParams, usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  ChevronUp,
  ShieldCheck,
  Trophy,
  UserPlus,
  BarChart3,
  Terminal,
  Zap,
  Ghost,
  DoorOpen,
  Layers,
  ListCollapse,
  AlertTriangle,
  UserCircle,
  Tag,
  MousePointerClick,
  Square,
  MessageSquare,
  Menu,
  TextCursor,
  Type,
  List,
  Minus,
  PanelRight,
  ToggleRight,
  HelpCircle,
  User as UserIcon,
  Users,
  Activity,
  Lock,
  Server,
  Image,
  Radio,
  Ticket,
} from "lucide-react";

import Link from "next/link";
import type { User } from "next-auth";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/auth/user-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ServerSwitcher } from "./server-switcher";
import { useServerStore } from "@/store/use-server-store";
import { useProEngineStore } from "@/store/use-pro-engine-store";
import { Suspense, useEffect, useState } from "react";

function getAvatarUrl(user: { id?: string; image?: string | null }): string {
  if (user.image) return user.image;
  if (user.id) {
    return `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 5}.png`;
  }
  return `https://cdn.discordapp.com/embed/avatars/0.png`;
}

export function DashboardSidebar({
  user,
  developerAccess = false,
}: {
  user: User;
  developerAccess?: boolean;
}) {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const { lastActiveGuildId, setLastActiveGuildId } = useServerStore();

  // Fix hydration mismatch: use a state for mounted to avoid using localStorage-based store values on server
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // The "Truth" of what server is currently being viewed (URL source)
  const activeGuildId = (params.guildId as string) || searchParams.get("guild");

  // Context ID should only be active if we are on a guild-specific route or if explicitly forced
  const contextId = activeGuildId;

  const proSettings = useProEngineStore((state) =>
    contextId ? state.settingsCache[contextId] : null
  );
  // Only use the real premium status if mounted to avoid hydration errors
  const isPremium = mounted ? (proSettings?.isPremium?.pro ?? false) : false;

  // Sync current selection to store ONLY if we have an explicit one from the URL
  useEffect(() => {
    if (activeGuildId && activeGuildId !== lastActiveGuildId) {
      setLastActiveGuildId(activeGuildId);
    }
  }, [activeGuildId, lastActiveGuildId, setLastActiveGuildId]);

  const getHref = (baseHref: string, isGuildSpecific: boolean) => {
    // If the route is guild-specific (like /dashboard/xp), we NEED a guildId
    if (isGuildSpecific) {
      if (contextId && baseHref.startsWith("/dashboard/")) {
        // Special case for overview: don't append extra segments
        if (baseHref === "/dashboard") return `/dashboard/${contextId}`;
        return baseHref.replace("/dashboard/", `/dashboard/${contextId}/`);
      }
      return baseHref;
    }

    // For general routes (generated image gallery, settings), we just go there.
    // Clean URLs only.
    return baseHref;
  };

  const getCoreItems = () => [
    {
      title: contextId ? "Overview" : "System Overview",
      href: contextId ? `/dashboard/${contextId}` : "/dashboard",
      icon: LayoutDashboard,
    },
    ...(contextId
      ? [
          {
            title: "Pro Engine",
            href: getHref("/dashboard/pro-engine", true),
            icon: Zap,
            badge: "PRO",
            badgeActive: isPremium,
            badgeTone: "pro" as const,
          },
          {
            title: "Analytics",
            href: getHref("/dashboard/analytics", true),
            icon: BarChart3,
          },
        ]
      : []),
  ];

  const getEngagementItems = () =>
    contextId
      ? [
          {
            title: "Welcome System",
            href: getHref("/dashboard/welcome", true),
            icon: UserPlus,
          },
          {
            title: "Goodbye System",
            href: getHref("/dashboard/goodbye", true),
            icon: DoorOpen,
            badge: "NEW",
            badgeActive: true,
            badgeExpiresAt: "2026-11-01",
          },
          {
            title: "Reaction Roles",
            href: getHref("/dashboard/roles", true),
            icon: ShieldCheck,
          },
          {
            title: "XP & Levels",
            href: getHref("/dashboard/xp", true),
            icon: Trophy,
          },
          {
            title: "Tickets",
            href: getHref("/dashboard/tickets", true),
            icon: Ticket,
            badge: "BETA",
            badgeActive: true,
            badgeTone: "beta" as const,
          },
          {
            title: "Live Reactor",
            href: getHref("/dashboard/live-reactor", true),
            icon: Radio,
            isComingSoon: true,
          },
        ]
      : [];

  const getToolItems = () => [
    ...(contextId
      ? [
          {
            title: "Command Settings",
            href: getHref("/dashboard/commands", true),
            icon: Terminal,
          },
        ]
      : [
          {
            title: "Image Tools",
            href: "/dashboard/image-tools",
            icon: Image,
          },
        ]),
  ];

  const getDeveloperItems = () => [
    {
      title: "Global Statistics",
      href: "/dashboard/stats",
      icon: BarChart3,
    },
    {
      title: "Revenue & Billing",
      href: "/dashboard/revenue",
      icon: Zap,
    },
    {
      title: "Command Usage",
      href: "/dashboard/commands",
      icon: Terminal,
    },
    {
      title: "User Management",
      href: "/dashboard/users",
      icon: Users,
    },
    {
      title: "Server Management",
      href: "/dashboard/servers",
      icon: Server,
    },
    {
      title: "System Logs",
      href: "/dashboard/logs",
      icon: List,
    },
    {
      title: "System Health",
      href: "/dashboard/health",
      icon: Activity,
    },
  ];

  const getTestItems = () => [
    {
      title: "Accordion",
      href: "/dashboard/test/accordion",
      icon: ListCollapse,
    },
    {
      title: "Alert",
      href: "/dashboard/test/alert",
      icon: AlertTriangle,
    },
    {
      title: "Avatar",
      href: "/dashboard/test/avatar",
      icon: UserCircle,
    },
    {
      title: "Badge",
      href: "/dashboard/test/badge",
      icon: Tag,
    },
    {
      title: "Button",
      href: "/dashboard/test/button",
      icon: MousePointerClick,
    },
    {
      title: "Card",
      href: "/dashboard/test/card",
      icon: Square,
    },
    {
      title: "Dialog",
      href: "/dashboard/test/dialog",
      icon: MessageSquare,
    },
    {
      title: "Dropdown Menu",
      href: "/dashboard/test/dropdown-menu",
      icon: Menu,
    },
    {
      title: "Input",
      href: "/dashboard/test/input",
      icon: TextCursor,
    },
    {
      title: "Label",
      href: "/dashboard/test/label",
      icon: Type,
    },
    {
      title: "Select",
      href: "/dashboard/test/select",
      icon: List,
    },
    {
      title: "Separator",
      href: "/dashboard/test/separator",
      icon: Minus,
    },
    {
      title: "Sheet",
      href: "/dashboard/test/sheet",
      icon: PanelRight,
    },
    {
      title: "Skeleton",
      href: "/dashboard/test/skeleton",
      icon: Ghost,
    },
    {
      title: "Switch",
      href: "/dashboard/test/switch",
      icon: ToggleRight,
    },
    {
      title: "Tabs",
      href: "/dashboard/test/tabs",
      icon: Layers,
    },
    {
      title: "Tooltip",
      href: "/dashboard/test/tooltip",
      icon: HelpCircle,
    },
    {
      title: "User Menu",
      href: "/dashboard/test/user-menu",
      icon: UserIcon,
    },
  ];

  const isActive = (href: string) => {
    const cleanHref = href.split("?")[0].replace(/\/$/, "");
    const cleanPathname = pathname.split("?")[0].replace(/\/$/, "");

    // 1. Exact match for the main dashboard list
    if (cleanHref === "/dashboard") {
      return cleanPathname === "/dashboard";
    }

    // 2. Exact match for a specific Guild Overview (e.g. /dashboard/123)
    // Discord guild IDs are numeric snowflakes, so we only match digits
    const guildRootRegex = /^\/dashboard\/\d+$/;
    if (guildRootRegex.test(cleanHref)) {
      return cleanPathname === cleanHref;
    }

    // 3. Prefix match for everything else (features like XP, Roles, etc.)
    return cleanPathname.startsWith(cleanHref);
  };

  const NavGroup = ({
    label,
    items,
  }: {
    label: string;
    items: {
      title: string;
      href: string;
      icon: React.ElementType;
      isComingSoon?: boolean;
      badge?: string;
      badgeActive?: boolean;
      badgeTone?: "new" | "beta" | "pro";
      /** Hide badge after this date (ISO, e.g. "2026-10-01") */
      badgeExpiresAt?: string;
    }[];
  }) => {
    if (items.length === 0) return null;

    const activeBadgeTone = {
      new: "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-400",
      beta:
        "bg-amber-500/10 text-amber-400 hover:bg-amber-500/10 hover:text-amber-400",
      pro: "bg-violet-500/10 text-violet-400 hover:bg-violet-500/10 hover:text-violet-400",
    };

    return (
      <SidebarGroup className="group-data-[collapsible=icon]:px-0 py-2">
        {label && (
          <SidebarGroupLabel
            className={cn(
              "group-data-[collapsible=icon]:hidden mb-2 px-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600/70 before:content-['//'] before:mr-2 before:text-zinc-800"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
            {label}
          </SidebarGroupLabel>
        )}
        <SidebarGroupContent>
          <SidebarMenu className="gap-0.5 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
            {items.map((item) => {
              const badgeVisible =
                item.badge &&
                (!item.badgeExpiresAt ||
                  Date.now() < Date.parse(item.badgeExpiresAt));
              return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={item.title}
                  disabled={item.isComingSoon}
                  className={cn(
                    "h-9 transition-all duration-300 rounded-lg group/btn relative overflow-hidden text-sm",
                    item.isComingSoon
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:text-cyan-100 hover:bg-white/5 active:scale-[0.98]"
                  )}
                >
                  {item.isComingSoon ? (
                    <div className="flex items-center gap-3 w-full px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                      <item.icon className="size-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden text-xs truncate">
                        {item.title}
                      </span>
                      <Badge
                        variant="outline"
                        className="ml-auto text-[8px] h-4 px-1 py-0 border-zinc-800 text-zinc-600 group-data-[collapsible=icon]:hidden font-medium uppercase tracking-tight"
                      >
                        Soon
                      </Badge>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      prefetch={true}
                      className="flex items-center gap-3 w-full px-2 relative z-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                    >
                      {isActive(item.href) && (
                        <motion.div
                          layoutId="active-nav"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                          style={{ willChange: "transform" }}
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 35,
                            mass: 0.8,
                          }}
                        />
                      )}
                      <item.icon
                        className={cn(
                          "size-4 shrink-0 transition-transform group-hover/btn:scale-110",
                          isActive(item.href)
                            ? "text-cyan-400"
                            : "text-zinc-500"
                        )}
                      />
                      <span
                        className={cn(
                          "group-data-[collapsible=icon]:hidden text-xs truncate transition-colors",
                          isActive(item.href)
                            ? "text-zinc-100"
                            : "text-zinc-400 group-hover/btn:text-zinc-200"
                        )}
                      >
                        {item.title}
                      </span>
                          {badgeVisible && (
                            <Badge
                              className={cn(
                                "ml-auto text-[9px] h-4 px-1.5 py-0 border-none group-data-[collapsible=icon]:hidden font-medium uppercase flex items-center justify-center gap-1",
                                item.badgeActive
                                  ? activeBadgeTone[item.badgeTone ?? "new"]
                                  : "bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-500 ring-1 ring-inset ring-zinc-700/50"
                              )}
                            >
                              {!item.badgeActive && (
                                <Lock className="size-2.5 -ml-0.5 opacity-80" />
                              )}
                              {item.badge}
                            </Badge>
                          )}
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  const isAccountPage =
    pathname === "/dashboard/profile" || pathname === "/dashboard/balance";

  // Custom trigger following shadcn sidebar pattern
  const sidebarUserTrigger = (
    <SidebarMenuButton
      size="lg"
      isActive={isAccountPage}
      className={cn(
        "relative overflow-hidden group/user transition-all duration-300 rounded-xl",
        isAccountPage
          ? "bg-cyan-950/30 border border-cyan-500/50 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/50"
          : "border border-transparent hover:border-cyan-500/30 hover:bg-cyan-950/20 data-[state=open]:border-cyan-500/50 data-[state=open]:bg-cyan-950/30"
      )}
      tooltip={user?.name || "Account"}
    >
      {/* Sliding Scanline Effect */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-full group-hover/user:translate-x-full transition-transform duration-1000 pointer-events-none" />

      <Avatar className="h-8 w-8 rounded-lg shrink-0 ring-2 ring-cyan-500/20 group-hover/user:ring-cyan-500/50 transition-all shadow-[0_0_10px_-2px_rgba(6,182,212,0.3)]">
        <AvatarImage
          src={getAvatarUrl(user || {})}
          alt={user?.name || "User"}
          width={32}
          height={32}
          priority
        />
        <AvatarFallback className="rounded-lg bg-zinc-900 border border-white/10 text-cyan-400 text-xs font-mono">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight min-w-0 group-data-[collapsible=icon]:hidden z-10">
        <span className="truncate font-bold font-mono text-zinc-100 group-hover/user:text-cyan-300 transition-colors">
          {user?.name}
        </span>
        <span className="truncate text-[10px] text-zinc-500 group-hover/user:text-cyan-600/80 font-mono transition-colors">
          {user?.email}
        </span>
      </div>
      <ChevronUp className="ml-auto size-4 shrink-0 text-zinc-500 group-hover/user:text-cyan-400 transition-colors group-data-[collapsible=icon]:hidden" />
    </SidebarMenuButton>
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/5 bg-zinc-950"
      variant="inset"
    >
      <SidebarHeader>
        <Suspense
          fallback={
            <Skeleton className="h-14 w-full rounded-2xl bg-zinc-900/50 border border-white/5" />
          }
        >
          <ServerSwitcher />
        </Suspense>
      </SidebarHeader>

      <SidebarContent>
        {pathname.startsWith("/dashboard/test") ? (
          <>
            <NavGroup label="UI Components" items={getTestItems()} />
            <NavGroup
              label="System"
              items={[
                {
                  title: "Back to Dashboard",
                  href: contextId ? `/dashboard/${contextId}` : "/dashboard",
                  icon: LayoutDashboard,
                },
              ]}
            />
          </>
        ) : (
          <>
            <NavGroup label="Core" items={getCoreItems()} />
            <NavGroup label="Engagement" items={getEngagementItems()} />
            <NavGroup label="Tools & Config" items={getToolItems()} />
            {developerAccess && !contextId && (
              <NavGroup label="Developer" items={getDeveloperItems()} />
            )}
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem>
            <UserMenu
              user={user}
              status="authenticated"
              coreImageUrl="/images/core_energy.png"
              dashboardUrl="/dashboard"
              showDashboardLink={developerAccess || Boolean(contextId)}
              dashboardLabel={
                contextId
                  ? developerAccess
                    ? "System Overview"
                    : "All Servers"
                  : "Dashboard"
              }
              showCoreBalance={false}
              variant="sidebar"
              side="top"
              align="end"
              className="w-full group-data-[collapsible=icon]:justify-center"
              customTrigger={sidebarUserTrigger}
              hideUserInfo={true}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
