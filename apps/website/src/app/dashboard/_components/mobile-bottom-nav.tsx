"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Radio, Settings, Activity, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServerStore } from "@/store/use-server-store";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { guilds, lastActiveGuildId } = useServerStore();
  const activeGuildId = lastActiveGuildId || guilds[0]?.id || "";

  const items = [
    {
      id: "overview",
      label: "Overview",
      icon: Layers,
      href: "/dashboard",
      exact: true,
    },
    {
      id: "live-reactor",
      label: "Live",
      icon: Radio,
      href: activeGuildId ? `/dashboard/${activeGuildId}/live-reactor` : "/dashboard",
      comingSoon: true,
    },
    {
      id: "roles",
      label: "Roles",
      icon: Settings,
      href: activeGuildId ? `/dashboard/${activeGuildId}/roles` : "/dashboard",
    },
    {
      id: "health",
      label: "Health",
      icon: Activity,
      href: "/dashboard/health",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      href: "/dashboard/profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-zinc-950/90 backdrop-blur-2xl border-t border-cyan-500/20 shadow-[0_-4px_25px_rgba(0,0,0,0.8)] pb-safe">
      <div className="flex items-center justify-around h-14 px-2">
        {items.map((item) => {
          const isActive =
            !item.comingSoon &&
            (item.exact ? pathname === item.href : pathname.includes(item.id));
          const Icon = item.icon;

          if (item.comingSoon) {
            return (
              <span
                key={item.id}
                className="flex flex-col items-center justify-center w-full h-full gap-1 relative opacity-35 cursor-not-allowed select-none"
                aria-disabled="true"
              >
                <Icon className="size-4 shrink-0 text-zinc-500" />
                <span className="text-[10px] tracking-tight text-zinc-600">
                  Soon
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-150 relative",
                isActive
                  ? "text-cyan-400 font-bold"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              )}
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive ? "text-cyan-400" : "text-zinc-500"
                )}
              />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
