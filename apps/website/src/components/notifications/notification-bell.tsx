"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Bell,
  X,
  CheckCheck,
  Vote,
  Zap,
  Shield,
  AlertTriangle,
  Wrench,
  Gift,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useNotificationStore,
  type Notification,
} from "@/store/use-notification-store";

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins}m ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h ago`;
  }
  if (seconds < 2592000) {
    const days = Math.floor(seconds / 86400);
    return `${days}d ago`;
  }
  const months = Math.floor(seconds / 2592000);
  return `${months}mo ago`;
}

function getNotificationIcon(icon: string) {
  const iconClass = "w-5 h-5";

  switch (icon) {
    case "vote":
      return <Vote className={cn(iconClass, "text-emerald-400")} />;
    case "core":
      return <Zap className={cn(iconClass, "text-cyan-400")} />;
    case "pro":
      return <Shield className={cn(iconClass, "text-amber-400")} />;
    case "warning":
      return <AlertTriangle className={cn(iconClass, "text-red-400")} />;
    case "admin":
      return <Wrench className={cn(iconClass, "text-blue-400")} />;
    case "gift":
      return <Gift className={cn(iconClass, "text-purple-400")} />;
    default:
      return <Sparkles className={cn(iconClass, "text-cyan-400")} />;
  }
}

function getIconBackground(icon: string) {
  switch (icon) {
    case "vote":
      return "bg-emerald-500/10 border-emerald-500/20";
    case "core":
      return "bg-cyan-500/10 border-cyan-500/20";
    case "pro":
      return "bg-amber-500/10 border-amber-500/20";
    case "warning":
      return "bg-red-500/10 border-red-500/20";
    case "admin":
      return "bg-blue-500/10 border-blue-500/20";
    case "gift":
      return "bg-purple-500/10 border-purple-500/20";
    default:
      return "bg-cyan-500/10 border-cyan-500/20";
  }
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!notification.read) onMarkAsRead(notification.id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !notification.read)
          onMarkAsRead(notification.id);
      }}
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border transition-all duration-200",
        notification.read
          ? "bg-zinc-900/30 border-white/5 opacity-60"
          : "bg-zinc-900/60 border-white/10 hover:border-white/15 cursor-pointer"
      )}
    >
      <div
        className={cn(
          "shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center",
          getIconBackground(notification.icon)
        )}
      >
        {getNotificationIcon(notification.icon)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              "text-sm font-bold leading-tight",
              notification.read ? "text-zinc-400" : "text-white"
            )}
          >
            {notification.title}
          </h4>
          {!notification.read && (
            <div className="shrink-0 w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
          )}
        </div>
        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
          {notification.message}
        </p>
        <span className="text-[10px] text-zinc-600 mt-1.5 block">
          {getTimeAgo(notification.createdAt)}
        </span>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const { data: session } = useSession();
  const {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    setOpen,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  // Smart Polling: dynamically back off when user is AFK to aggressively save serverless/DB costs
  useEffect(() => {
    if (!session?.user?.id) return;

    let lastActivityTime = Date.now();
    let lastPollTime = Date.now();

    // Track user interaction to determine if they are actively looking at the screen
    const handleActivity = () => {
      lastActivityTime = Date.now();
    };

    window.addEventListener("mousemove", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });
    window.addEventListener("click", handleActivity, { passive: true });
    window.addEventListener("scroll", handleActivity, { passive: true });

    fetchUnreadCount();

    // The base "tick" runs every 30 seconds
    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;

      const now = Date.now();
      const isIdle = now - lastActivityTime > 5 * 60 * 1000; // Idle after 5 mins of no interaction
      const timeSinceLastPoll = now - lastPollTime;

      // If active, poll immediately (since 30s tick passed).
      // If idle, wait until 3 minutes (180,000ms) have passed since the last poll.
      if (!isIdle || timeSinceLastPoll >= 180_000) {
        fetchUnreadCount();
        lastPollTime = now;
      }
    }, 30_000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  if (!session?.user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg border border-transparent hover:border-cyan-500/30 hover:bg-cyan-950/20 hover:shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)] transition-all duration-300 group cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold rounded-full bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.6)] px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:w-100 bg-zinc-950 border-l border-white/5 p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white font-bold text-lg flex items-center gap-2">
              <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                <Bell className="w-4 h-4 text-cyan-400" />
              </div>
              Notifications
            </SheetTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-zinc-400 hover:text-cyan-400 h-8 px-2 gap-1.5"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Read all
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-8 w-8 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {unreadCount > 0 && (
            <Badge
              variant="outline"
              className="w-fit mt-2 bg-cyan-500/5 text-cyan-400 border-cyan-500/20 text-xs"
            >
              {unreadCount} unread
            </Badge>
          )}
        </SheetHeader>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-zinc-900/40 rounded-xl h-20 border border-white/5"
                />
              ))}
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-zinc-900 rounded-full mb-4 border border-white/5">
                <Bell className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                All Caught Up!
              </h3>
              <p className="text-sm text-zinc-500 max-w-62.5">
                You're all caught up! Notifications about your Core balance,
                purchases, and Pro Engine will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Footer gradient */}
        <div className="h-0.5 w-full bg-linear-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0" />
      </SheetContent>
    </Sheet>
  );
}
