"use client";

import { useState } from "react";
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
import { cn, getDiscordImageUrl } from "@/lib/utils";

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

type SortField = "name" | "members";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 10;

export function ServerTable({
  guilds,
  isLoading,
  onSelectServer,
  onResetProEngine,
}: ServerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filteredGuilds = guilds
    .filter(
      (guild) =>
        guild.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guild.guildId.includes(searchTerm)
    )
    .sort((a, b) => {
      const modifier = sortDirection === "asc" ? 1 : -1;
      if (sortField === "name") {
        return a.name.localeCompare(b.name) * modifier;
      }
      return (a.memberCount - b.memberCount) * modifier;
    });

  const totalPages = Math.ceil(filteredGuilds.length / ITEMS_PER_PAGE);
  const paginatedGuilds = filteredGuilds.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
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
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 group-focus-within:text-cyan-500 transition-colors" />
          <Input
            placeholder="Search by name or ID..."
            className="pl-10 bg-zinc-900/50 border-white/5 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 h-10 italic font-mono text-xs transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <Badge
          variant="outline"
          className="border-cyan-500/20 text-cyan-500 bg-cyan-500/5 font-mono text-[10px] tracking-widest uppercase"
        >
          Total: {filteredGuilds.length}
        </Badge>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="pt-4 pb-3 font-mono text-[10px] text-zinc-500 uppercase tracking-widest px-4">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  Server
                  <ArrowUpDown className="size-3" />
                </button>
              </th>
              <th className="pt-4 pb-3 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                Owner
              </th>
              <th className="pt-4 pb-3 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                <button
                  onClick={() => handleSort("members")}
                  className="flex items-center gap-1 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  Members
                  <ArrowUpDown className="size-3" />
                </button>
              </th>
              <th className="pt-4 pb-3 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                Status
              </th>
              <th className="pt-4 pb-3 font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-right px-4">
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
                      <Avatar className="size-9">
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
                      <div className="size-9 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center">
                        <span className="text-zinc-500 font-bold text-sm">
                          {guild.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold uppercase font-mono text-zinc-100 group-hover:text-cyan-400 transition-colors truncate max-w-50">
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
                    <Users className="size-3 text-zinc-500" />
                    <span className="text-sm font-mono font-bold">
                      {guild.memberCount.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge
                    variant="outline"
                    className={`text-[8px] font-mono ${
                      guild.status === "active"
                        ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                        : "border-red-500/30 text-red-500 bg-red-500/10"
                    }`}
                  >
                    {guild.status === "active" ? "Active" : "Removed"}
                  </Badge>
                </td>
                <td className="p-4 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 border-white/5 bg-zinc-950/95 backdrop-blur-xl"
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
            <p className="text-xs text-zinc-600">
              {searchTerm
                ? `No servers matching "${searchTerm}". Try a different query.`
                : "No Discord servers are registered in the system yet."}
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            Page {currentPage} of {totalPages}
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
