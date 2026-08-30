"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Key,
  Loader2,
  Check,
  AlertCircle,
  Coins,
  ChevronLeft,
  ChevronRight,
  Zap,
  UserX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn, getDiscordImageUrl } from "@/lib/utils";
import { UserRoles } from "@/lib/admin";
import { updateUserRole } from "../actions";
import { useUsersStore } from "@/store/use-users-store";
import { ManageCoresDialog } from "./manage-cores-dialog";
import { ViewTransactionsDialog } from "./view-transactions-dialog";

interface UserData {
  id: string;
  username: string;
  globalName: string;
  avatar: string | null;
  role: string;
  credits: number;
  lastLogin: string;
  createdAt: string;
  isPayer?: boolean;
}

export function UserTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlSearch = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));

  const [searchTerm, setSearchTerm] = useState(urlSearch);

  const {
    users,
    pagination,
    isLoading,
    fetchUsers,
    updateUserRole: updateStoreUserRole,
  } = useUsersStore();

  // Single effect driven by URL searchParams
  useEffect(() => {
    setSearchTerm(urlSearch);
    fetchUsers(urlSearch || undefined, true, page);
  }, [urlSearch, page, fetchUsers]);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (val) {
        params.set("search", val);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    if (pagination && newPage > pagination.pages) return;

    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(newPage));
      router.push(`?${params.toString()}`);
    });
  };

  // Role Update State
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [updateRole, setUpdateRole] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // Core Management State
  const [selectedCoreUser, setSelectedCoreUser] = useState<UserData | null>(
    null
  );
  const [selectedHistoryUser, setSelectedHistoryUser] =
    useState<UserData | null>(null);

  const handleUpdateRole = async () => {
    if (!selectedUser || !updateRole) return;

    setIsUpdating(true);
    setStatus("idle");

    try {
      const result = await updateUserRole(selectedUser.id, updateRole);

      if (!result.success) throw new Error(result.error);

      // Update the global store
      updateStoreUserRole(selectedUser.id, updateRole);

      setStatus("success");
      setTimeout(() => {
        setSelectedUser(null);
        setStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Failed to update role:", error);
      setStatus("error");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4 pt-4 px-6">
        <div className="relative w-full lg:w-96 group">
          <Search
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 size-4 transition-colors",
              isPending
                ? "text-cyan-500 animate-pulse"
                : "text-zinc-500 group-focus-within:text-cyan-500"
            )}
          />
          <Input
            placeholder="Search by ID, Username, Global Name or Email..."
            className="pl-10 bg-zinc-900/50 border-white/5 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 h-10 italic font-mono text-xs transition-all"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-cyan-500/20 text-cyan-500 bg-cyan-500/5 font-mono text-[10px] tracking-widest uppercase"
          >
            Total Managed: {pagination?.total ?? 0}
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="size-6 animate-spin mx-auto text-cyan-500 mb-4" />
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
            Loading users...
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="pt-6 pb-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest px-6">
                    User
                  </th>
                  <th className="pt-6 pb-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    Role
                  </th>
                  <th className="pt-6 pb-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-right">
                    Credits
                  </th>
                  <th className="pt-6 pb-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    Last Login
                  </th>
                  <th className="pt-6 pb-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    Joined
                  </th>
                  <th className="pt-6 pb-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-right px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user, index) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isPriority={index === 0}
                    onEditRole={(role) => {
                      setSelectedUser(user);
                      setUpdateRole(role);
                    }}
                    onManageCores={() => setSelectedCoreUser(user)}
                    onViewHistory={() => setSelectedHistoryUser(user)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && !isLoading && (
            <div className="py-16 px-8 flex flex-col items-center justify-center gap-5 text-center">
              <div className="relative">
                <div className="absolute -inset-3 bg-cyan-500/10 blur-xl rounded-full" />
                <div className="relative h-14 w-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <UserX className="size-6 text-zinc-500" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-xs">
                <p className="font-mono text-sm font-bold text-zinc-300 uppercase tracking-wider">
                  No Users Found
                </p>
                <p className="text-xs text-zinc-600">
                  No users match the current search query. Try a different name or ID.
                </p>
              </div>
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="h-8 w-8 border-white/10 bg-zinc-900/50 hover:border-cyan-500/50 hover:text-cyan-400"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.pages}
                  className="h-8 w-8 border-white/10 bg-zinc-900/50 hover:border-cyan-500/50 hover:text-cyan-400"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Role Management Dialog */}
      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent className="sm:max-w-106.25 border-white/5 bg-zinc-950/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 italic">
              <Key className="size-4 text-cyan-500" />
              Update Role
            </DialogTitle>
            <DialogDescription className="font-mono text-[10px] uppercase tracking-wider">
              Updating access level for:{" "}
              <span className="text-cyan-500">{selectedUser?.username}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">
                Select New Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(UserRoles).map((role) => (
                  <button
                    key={role}
                    onClick={() => setUpdateRole(role)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all",
                      updateRole === role
                        ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                        : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/10 hover:bg-white/10"
                    )}
                  >
                    {role}
                    {updateRole === role && <Check className="size-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="cyber"
              className="w-full"
              disabled={isUpdating || updateRole === selectedUser?.role}
              onClick={handleUpdateRole}
            >
              {isUpdating ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : status === "success" ? (
                <Check className="size-4 mr-2" />
              ) : status === "error" ? (
                <AlertCircle className="size-4 mr-2" />
              ) : null}
              {status === "success"
                ? "Role Updated"
                : status === "error"
                  ? "Update Failed"
                  : "Confirm Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ManageCoresDialog
        user={selectedCoreUser}
        open={!!selectedCoreUser}
        onOpenChange={(open) => !open && setSelectedCoreUser(null)}
      />
      <ViewTransactionsDialog
        user={selectedHistoryUser}
        open={!!selectedHistoryUser}
        onOpenChange={(open) => !open && setSelectedHistoryUser(null)}
      />
    </>
  );
}

function UserRow({
  user,
  isPriority,
  onEditRole,
  onManageCores,
  onViewHistory,
}: {
  user: UserData;
  isPriority?: boolean;
  onEditRole: (role: string) => void;
  onManageCores: () => void;
  onViewHistory: () => void;
}) {
  const rootIds = (process.env.NEXT_PUBLIC_DISCORD_DEVELOPERS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const isRootOwner = rootIds.includes(user.id);

  const roleStyles: Record<
    string,
    { color: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    [UserRoles.OWNER]: {
      color:
        "text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40",
      icon: ShieldAlert,
    },
    [UserRoles.ADMIN]: {
      color:
        "text-amber-500 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40",
      icon: ShieldCheck,
    },
    [UserRoles.SUPPORT]: {
      color:
        "text-cyan-500 bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40",
      icon: Shield,
    },
    [UserRoles.USER]: {
      color:
        "text-zinc-500 bg-zinc-500/10 border-zinc-500/20 hover:bg-zinc-500/20 hover:border-zinc-500/40",
      icon: Users,
    },
  };

  const style = roleStyles[user.role] || roleStyles[UserRoles.USER];
  const RoleIcon = style.icon;

  const avatarUrl =
    getDiscordImageUrl("avatars", user.id, user.avatar, 64) ||
    `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 5}.png`;

  return (
    <tr
      className={cn(
        "group transition-all",
        isRootOwner ? "bg-cyan-500/2" : "hover:bg-white/5"
      )}
    >
      <td className="p-4 px-6">
        <div className="flex items-center gap-3">
          <Avatar
            className={cn(
              "size-9 rounded-lg border transition-all",
              isRootOwner
                ? "border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                : "border-white/10 ring-2 ring-transparent group-hover:ring-cyan-500/20"
            )}
          >
            <AvatarImage
              src={avatarUrl}
              alt={user.username}
              width={36}
              height={36}
              priority={isPriority}
            />
            <AvatarFallback className="rounded-lg bg-zinc-900 border border-white/5 text-[10px] text-zinc-500">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm font-bold uppercase font-mono transition-colors",
                  isRootOwner
                    ? "text-cyan-400"
                    : "text-zinc-100 group-hover:text-cyan-400"
                )}
              >
                {user.globalName || user.username}
              </span>
              {user.isPayer && (
                <Badge
                  variant="outline"
                  className="text-[7px] font-mono border-amber-500/50 text-amber-400 bg-amber-500/10 px-1.5 py-0 h-4 uppercase tracking-wider shadow-[0_0_8px_rgba(245,158,11,0.15)] hover:border-amber-400/80 hover:text-amber-300 hover:bg-amber-500/20 transition-all cursor-default"
                >
                  <Zap className="size-2.5 mr-1" />
                  Pro
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-zinc-500 font-mono tracking-tighter">
              ID: {user.id}
            </span>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex flex-col gap-1.5 items-start">
          <Badge
            className={cn(
              "text-[8px] font-black tracking-widest h-5 px-2 border italic uppercase transition-all",
              style.color,
              !isRootOwner && "cursor-pointer hover:scale-105"
            )}
            onClick={() => !isRootOwner && onEditRole(user.role)}
          >
            <RoleIcon className="size-2 mr-1" />
            {user.role}
          </Badge>
          {isRootOwner && (
            <Badge
              variant="outline"
              className="text-[7px] font-mono border-cyan-500/30 text-cyan-500 bg-cyan-500/10 px-1 py-0 h-4 uppercase tracking-tighter shadow-[0_0_5px_rgba(6,182,212,0.1)] hover:border-cyan-400/80 hover:text-cyan-400 hover:bg-cyan-500/20 transition-all"
            >
              System Root
            </Badge>
          )}
        </div>
      </td>
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-1 font-mono text-zinc-300">
          <Coins className="size-3 text-yellow-500" />
          <span className="text-xs font-bold">
            {user.credits?.toLocaleString() || 0}
          </span>
        </div>
      </td>
      <td className="p-4">
        <p className="text-[11px] font-mono text-zinc-400 uppercase">
          {user.lastLogin
            ? new Date(user.lastLogin).toLocaleDateString()
            : "Never"}
        </p>
        <p className="text-[9px] text-zinc-600 font-medium italic">
          {user.lastLogin
            ? new Date(user.lastLogin).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--:--"}
        </p>
      </td>
      <td className="p-4">
        <p className="text-[11px] font-mono text-zinc-400 uppercase">
          {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </td>
      <td className="p-4 px-6 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
              {isRootOwner ? (
                <ShieldAlert className="size-4 text-cyan-500/50 hover:text-cyan-400" />
              ) : (
                <Key className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-white/5 bg-zinc-950/95 backdrop-blur-xl"
          >
            <DropdownMenuLabel className="font-mono text-[10px] uppercase text-zinc-500 tracking-widest">
              User Options
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />

            {!isRootOwner && (
              <DropdownMenuItem
                className="text-xs font-mono uppercase cursor-pointer focus:bg-cyan-500/10 focus:text-cyan-400"
                onClick={() => onEditRole(user.role)}
              >
                Change Role
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              className="text-xs font-mono uppercase cursor-pointer focus:bg-cyan-500/10 focus:text-cyan-400"
              onClick={onManageCores}
            >
              Manage Cores
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-xs font-mono uppercase cursor-pointer focus:bg-cyan-500/10 focus:text-cyan-400"
              onClick={onViewHistory}
            >
              View Payment History
            </DropdownMenuItem>

            {!isRootOwner && (
              <>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="text-xs font-mono uppercase cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-400">
                  Blacklist ID
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
