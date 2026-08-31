"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Loader2,
  Users,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  MoreHorizontal,
  Copy,
  ServerOff,
  Filter,
  SortAsc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDiscordImageUrl } from "@/lib/utils";

function getGuildIconUrl(guildId: string, icon: string | null): string | null {
  if (!icon) return null;
  return `https://cdn.discordapp.com/icons/${guildId}/${icon}.png?size=64`;
}

interface GuildData {
  guildId: string;
  name: string;
  icon: string | null;
  ownerId: string;
  memberCount: number;
  status: "active" | "removed";
  joinedAt: string;
  leftAt: string | null;
}

interface ServerTableProps {
  guilds: GuildData[];
  isLoading: boolean;
  onSelectServer: (guild: GuildData) => void;
  onResetProEngine: (guild: GuildData) => void;
}

type SortOption =
  | "members_desc"
  | "members_asc"
  | "name_asc"
  | "name_desc"
  | "joined_desc"
  | "joined_asc";

type StatusFilter = "all" | "active" | "removed";

const ITEMS_PER_PAGE = 10;

export function ServerTable({
  guilds,
  isLoading,
  onSelectServer,
  onResetProEngine,
}: ServerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>("members_desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  const filteredGuilds = useMemo(() => {
    return guilds
      .filter((guild) => {
        // Status filter
        if (statusFilter !== "all" && guild.status !== statusFilter) {
          return false;
        }

        // Search term filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          return (
            guild.name.toLowerCase().includes(term) ||
            guild.guildId.includes(term) ||
            guild.ownerId.includes(term)
          );
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "members_desc":
            return b.memberCount - a.memberCount;
          case "members_asc":
            return a.memberCount - b.memberCount;
          case "name_asc":
            return a.name.localeCompare(b.name);
          case "name_desc":
            return b.name.localeCompare(a.name);
          case "joined_desc":
            return (
              new Date(b.joinedAt || 0).getTime() -
              new Date(a.joinedAt || 0).getTime()
            );
          case "joined_asc":
            return (
              new Date(a.joinedAt || 0).getTime() -
              new Date(b.joinedAt || 0).getTime()
            );
          default:
            return 0;
        }
      });
  }, [guilds, searchTerm, sortOption, statusFilter]);

  const totalPages = Math.ceil(filteredGuilds.length / ITEMS_PER_PAGE);
  const paginatedGuilds = useMemo(() => {
    return filteredGuilds.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredGuilds, currentPage]);

  const handleHeaderSort = (type: "name" | "members" | "joined") => {
    setCurrentPage(1);
    if (type === "members") {
      setSortOption(
        sortOption === "members_desc" ? "members_asc" : "members_desc"
      );
    } else if (type === "name") {
      setSortOption(sortOption === "name_asc" ? "name_desc" : "name_asc");
    } else if (type === "joined") {
      setSortOption(
        sortOption === "joined_desc" ? "joined_asc" : "joined_desc"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="size-6 animate-spin mx-auto text-cyan-500 mb-4" />
        <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
          Loading servers...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search, Status Filter, Order Select */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/40 p-3 rounded-xl border border-white/5">
        {/* Search */}
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 group-focus-within:text-cyan-500 transition-colors" />
          <Input
            placeholder="Search by name, Guild ID, or Owner ID..."
            className="pl-10 bg-zinc-950/60 border-white/10 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 h-9 italic font-mono text-xs transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filters & Ordering */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-lg border border-white/5">
            <Filter className="size-3.5 text-zinc-500 ml-1.5 mr-0.5" />
            <button
              onClick={() => {
                setStatusFilter("active");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all ${
                statusFilter === "active"
                  ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => {
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all ${
                statusFilter === "all"
                  ? "bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setStatusFilter("removed");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all ${
                statusFilter === "removed"
                  ? "bg-red-500/20 text-red-400 font-bold border border-red-500/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Removed
            </button>
          </div>

          {/* Sort Order Selector */}
          <div className="flex items-center gap-1.5">
            <SortAsc className="size-3.5 text-cyan-400 hidden sm:block" />
            <Select
              value={sortOption}
              onValueChange={(val: SortOption) => {
                setSortOption(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-48 h-9 bg-zinc-950/80 border-white/10 text-xs font-mono focus:ring-cyan-500/50">
                <SelectValue placeholder="Sort Order" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-xs font-mono">
                <SelectItem value="members_desc">
                  👥 Members (High → Low)
                </SelectItem>
                <SelectItem value="members_asc">
                  👥 Members (Low → High)
                </SelectItem>
                <SelectItem value="name_asc">🔤 Name (A → Z)</SelectItem>
                <SelectItem value="name_desc">🔤 Name (Z → A)</SelectItem>
                <SelectItem value="joined_desc">
                  📅 Joined (Newest)
                </SelectItem>
                <SelectItem value="joined_asc">
                  📅 Joined (Oldest)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Count Badge */}
          <Badge
            variant="outline"
            className="border-cyan-500/20 text-cyan-400 bg-cyan-500/5 font-mono text-[10px] tracking-widest uppercase h-9 px-3 flex items-center gap-1"
          >
            Count: <span className="font-bold text-white">{filteredGuilds.length}</span>
          </Badge>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/5 bg-zinc-950/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="pt-4 pb-3 font-mono text-[10px] text-zinc-400 uppercase tracking-widest px-4">
                <button
                  onClick={() => handleHeaderSort("name")}
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors cursor-pointer group"
                >
                  Server Name
                  <ArrowUpDown className="size-3 text-zinc-500 group-hover:text-cyan-400" />
                </button>
              </th>
              <th className="pt-4 pb-3 font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                Owner ID
              </th>
              <th className="pt-4 pb-3 font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                <button
                  onClick={() => handleHeaderSort("members")}
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors cursor-pointer group"
                >
                  Members
                  <ArrowUpDown className="size-3 text-zinc-500 group-hover:text-cyan-400" />
                </button>
              </th>
              <th className="pt-4 pb-3 font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                <button
                  onClick={() => handleHeaderSort("joined")}
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors cursor-pointer group"
                >
                  Joined Date
                  <ArrowUpDown className="size-3 text-zinc-500 group-hover:text-cyan-400" />
                </button>
              </th>
              <th className="pt-4 pb-3 font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                Status
              </th>
              <th className="pt-4 pb-3 font-mono text-[10px] text-zinc-400 uppercase tracking-widest text-right px-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedGuilds.map((guild) => (
              <tr
                key={guild.guildId}
                className="group hover:bg-white/5 transition-all"
              >
                <td className="p-4 px-4">
                  <div className="flex items-center gap-3">
                    {getGuildIconUrl(guild.guildId, guild.icon) ? (
                      <Avatar className="size-9 border border-white/10 shrink-0">
                        <AvatarImage
                          src={
                            getGuildIconUrl(guild.guildId, guild.icon) ||
                            undefined
                          }
                          alt={guild.name}
                        />
                        <AvatarFallback className="rounded-lg bg-zinc-800 border border-white/5 text-[10px] text-zinc-500">
                          {guild.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="size-9 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
                        <span className="text-zinc-400 font-bold text-sm">
                          {guild.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold font-mono text-zinc-100 group-hover:text-cyan-400 transition-colors truncate max-w-64">
                        {guild.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono tracking-tighter">
                        ID: {guild.guildId}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-[11px] font-mono text-zinc-400">
                    {guild.ownerId}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3 text-cyan-400/80" />
                    <span className="text-sm font-mono font-bold text-white">
                      {guild.memberCount.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-[11px] font-mono text-zinc-400">
                    {guild.joinedAt
                      ? new Date(guild.joinedAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </td>
                <td className="p-4">
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-mono uppercase tracking-wider font-semibold ${
                      guild.status === "active"
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                        : "border-red-500/30 text-red-400 bg-red-500/10"
                    }`}
                  >
                    {guild.status === "active" ? "Active" : "Removed"}
                  </Badge>
                </td>
                <td className="p-4 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-white"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 border-white/10 bg-zinc-950/95 backdrop-blur-xl"
                    >
                      <DropdownMenuLabel className="font-mono text-[10px] uppercase text-zinc-500 tracking-widest">
                        Server Options
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem
                        className="text-xs font-mono uppercase cursor-pointer focus:bg-cyan-500/10 focus:text-cyan-400"
                        onClick={() => onSelectServer(guild)}
                      >
                        <Eye className="size-3 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-xs font-mono uppercase cursor-pointer focus:bg-cyan-500/10 focus:text-cyan-400"
                        onClick={() => {
                          navigator.clipboard.writeText(guild.guildId);
                        }}
                      >
                        <Copy className="size-3 mr-2" />
                        Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem
                        className="text-xs font-mono uppercase cursor-pointer text-amber-500 focus:bg-amber-500/10 focus:text-amber-400"
                        onClick={() => onResetProEngine(guild)}
                      >
                        <RefreshCw className="size-3 mr-2" />
                        Reset Pro Engine
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {paginatedGuilds.length === 0 && (
        <div className="py-16 px-8 flex flex-col items-center justify-center gap-5 text-center">
          <div className="relative">
            <div className="absolute -inset-3 bg-cyan-500/10 blur-xl rounded-full" />
            <div className="relative h-14 w-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
              <ServerOff className="size-6 text-zinc-500" />
            </div>
          </div>
          <div className="space-y-1.5 max-w-xs">
            <p className="font-mono text-sm font-bold text-zinc-300 uppercase tracking-wider">
              No Servers Found
            </p>
            <p className="text-xs text-zinc-500">
              {searchTerm
                ? `No servers matching "${searchTerm}". Try a different query.`
                : "No Discord servers found with current filters."}
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            Page <span className="text-white font-bold">{currentPage}</span> of{" "}
            <span className="text-white font-bold">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 border-white/10 bg-zinc-900/50 hover:border-cyan-500/50 hover:text-cyan-400"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 border-white/10 bg-zinc-900/50 hover:border-cyan-500/50 hover:text-cyan-400"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

