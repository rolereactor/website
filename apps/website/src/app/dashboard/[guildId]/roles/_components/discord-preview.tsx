"use client";

import Image from "next/image";
import * as React from "react";
import { useParams } from "next/navigation";
import { Check, SmilePlus } from "lucide-react";
import { EmojiDisplay } from "@/components/ui/emoji-picker";
import { DiscordEmoji as GlobalDiscordEmoji } from "@/types/discord";

interface DiscordPreviewProps {
  title: string;
  description: string;
  color?: string;
  hideList?: boolean;
  reactions: {
    emoji: string;
    roleName: string;
    roleColor?: number;
    roleIds?: string[];
    roleNames?: string[];
    roleColors?: number[];
  }[];
  serverEmojis?: DiscordEmoji[];
  serverRoles?: { id: string; color: number }[];
}

interface DiscordEmoji {
  id: string;
  url: string;
  identifier: string;
  name?: string;
}

const PREVIEW_EMOJIS_CACHE = new Map<string, DiscordEmoji[]>();

function toHex(decimal?: number) {
  if (!decimal || decimal === 0) return "#b9bbbe";
  return `#${decimal.toString(16).padStart(6, "0")}`;
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function DiscordPreview({
  title,
  description,
  color = "#3b82f6",
  hideList = false,
  reactions,
  serverEmojis: propEmojis,
  serverRoles = [],
}: DiscordPreviewProps) {
  const params = useParams();
  const guildId = params.guildId as string;
  const [serverEmojis, setServerEmojis] = React.useState<DiscordEmoji[]>(
    propEmojis || []
  );

  React.useEffect(() => {
    if (propEmojis) {
      setServerEmojis(propEmojis);
      return;
    }

    async function fetchEmojis() {
      if (!guildId) return;

      // Check cache first to avoid flicker
      if (PREVIEW_EMOJIS_CACHE.has(guildId)) {
        setServerEmojis(PREVIEW_EMOJIS_CACHE.get(guildId)!);
        return;
      }

      try {
        const res = await fetch(`/api/guilds/${guildId}/emojis`);
        if (res.ok) {
          const data = await res.json();
          const emojis = Array.isArray(data) ? data : [];
          setServerEmojis(emojis);
          PREVIEW_EMOJIS_CACHE.set(guildId, emojis);
        }
      } catch (err) {
        console.error("Failed to fetch emojis in preview:", err);
      }
    }
    fetchEmojis();
  }, [guildId, propEmojis]);
  const currentTime = React.useMemo(() => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, []);

  const footerTime = React.useMemo(() => {
    const now = new Date();
    return `Today at ${now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;
  }, []);

  const mergedReactions = React.useMemo(() => {
    const map = new Map<string, (typeof reactions)[0]>();
    for (const r of reactions) {
      if (!r.emoji) continue;

      const existing = map.get(r.emoji);
      if (!existing) {
        map.set(r.emoji, {
          emoji: r.emoji,
          roleName: r.roleName,
          roleColor: r.roleColor,
          roleNames:
            r.roleNames && r.roleNames.length > 0
              ? [...r.roleNames]
              : r.roleName
                ? [r.roleName]
                : [],
          roleColors:
            r.roleColors && r.roleColors.length > 0
              ? [...r.roleColors]
              : r.roleColor != null
                ? [r.roleColor]
                : [0],
        });
      } else {
        if (r.roleNames && r.roleNames.length > 0) {
          existing.roleNames!.push(...r.roleNames);
          existing.roleColors!.push(...(r.roleColors || []));
        } else if (r.roleName) {
          existing.roleNames!.push(r.roleName);
          existing.roleColors!.push(r.roleColor || 0);
        }
      }
    }

    return Array.from(map.values()).map((r) => {
      const uniqueNames = new Set<string>();
      const finalNames: string[] = [];
      const finalColors: number[] = [];

      for (let i = 0; i < (r.roleNames?.length || 0); i++) {
        const name = r.roleNames![i];
        if (!uniqueNames.has(name)) {
          uniqueNames.add(name);
          finalNames.push(name);
          // Look up actual Discord color from serverRoles
          const roleId = r.roleIds?.[i];
          const serverRole = serverRoles.find((sr) => sr.id === roleId);
          finalColors.push(serverRole?.color ?? (r.roleColors![i] || 0));
        }
      }

      return {
        ...r,
        roleName: finalNames[0] || "",
        roleColor: finalColors[0] || 0,
        roleNames: finalNames,
        roleColors: finalColors,
      };
    });
  }, [reactions, serverRoles]);

  return (
    <div className="bg-[#313338] text-[#dbdee1] p-4 rounded-xl font-sans text-[15px] select-none shadow-2xl border border-white/5">
      <div className="flex gap-4">
        {/* User Avatar */}
        <div className="shrink-0 mt-0.5">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
            <Image
              src="/logo.png"
              alt="Role Reactor Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-semibold text-white hover:underline cursor-pointer">
              Role Reactor
            </span>
            <span className="bg-[#5865f2] text-white text-[10px] px-1 rounded-[3px] font-bold h-3.5 flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5 stroke-[4px]" />
              APP
            </span>
            <span className="text-[12px] text-[#949ba4] ml-1 font-medium">
              {currentTime}
            </span>
          </div>

          <div className="space-y-1.5">
            {/* Embed */}
            <div
              className="mt-1 flex rounded-lg bg-[#2b2d31] max-w-130 overflow-hidden"
              style={{ borderLeft: `4px solid ${color}` }}
            >
              <div className="p-3 md:p-4 pr-12 w-full">
                {title && (
                  <div className="text-white font-bold text-base mb-1">
                    {title}
                  </div>
                )}
                {description && (
                  <div className="text-[14px] leading-snug whitespace-pre-wrap text-[#dbdee1]">
                    {description}
                  </div>
                )}

                {/* Automatically Generated Available Roles Section */}
                {!hideList && mergedReactions.some((r) => r.roleName) && (
                  <div className="mt-3 space-y-1">
                    <div className="text-white font-bold text-[14px]">
                      Available Roles
                    </div>
                    <div className="space-y-0.5">
                      {mergedReactions
                        .filter((r) => r.roleName)
                        .map((r, i) => {
                          // Multi-role: show all role names if available
                          const names =
                            r.roleNames && r.roleNames.length > 0
                              ? r.roleNames
                              : [r.roleName];
                          const colors =
                            r.roleColors && r.roleColors.length > 0
                              ? r.roleColors
                              : r.roleColor != null
                                ? [r.roleColor]
                                : [0];

                          return (
                            <div
                              key={i}
                              className="flex items-center gap-2 group/role"
                            >
                              <EmojiDisplay
                                emoji={r.emoji}
                                serverEmojis={
                                  serverEmojis as unknown as GlobalDiscordEmoji[]
                                }
                                className="w-5 h-5 text-base"
                                fallback="❓"
                              />
                              <div className="flex items-center gap-1 flex-wrap">
                                {names.map((name, idx) => {
                                  const roleColor = toHex(colors[idx] || 0);
                                  const isDefault = roleColor === "#b9bbbe";
                                  return (
                                    <React.Fragment key={idx}>
                                      {idx > 0 && (
                                        <span className="text-[12px] text-[#949ba4]">
                                          ,
                                        </span>
                                      )}
                                      <span
                                        className="px-1 rounded-[3px] font-medium transition-colors cursor-pointer text-[14px]"
                                        style={{
                                          color: roleColor,
                                          backgroundColor: isDefault
                                            ? "rgba(79, 84, 92, 0.3)"
                                            : hexToRgba(roleColor, 0.1),
                                        }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.backgroundColor =
                                            isDefault
                                              ? "rgba(79, 84, 92, 0.5)"
                                              : hexToRgba(roleColor, 0.2);
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.backgroundColor =
                                            isDefault
                                              ? "rgba(79, 84, 92, 0.3)"
                                              : hexToRgba(roleColor, 0.1);
                                        }}
                                      >
                                        @{name}
                                      </span>
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Embed Footer (as seen in image) */}
                <div className="mt-2 flex items-center gap-2 border-l border-white/5 pl-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                    <Image
                      src="/logo.png"
                      alt=""
                      width={20}
                      height={20}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                  <span className="text-[12px] text-[#dbdee1] font-medium flex items-center gap-1">
                    Role Reactions • ID: {guildId || "000000000000000000"} •{" "}
                    {footerTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Reactions */}
            {mergedReactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {mergedReactions.map((r, i) => (
                  <div
                    key={i}
                    className="bg-[#2b2d31] hover:bg-[#3b3d42] border border-transparent hover:border-[#5865f2]/50 rounded-lg px-1.5 py-0.5 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <EmojiDisplay
                      emoji={r.emoji}
                      serverEmojis={
                        serverEmojis as unknown as GlobalDiscordEmoji[]
                      }
                      className="w-5 h-5 text-base"
                    />
                    <span className="text-[14px] font-semibold text-[#dbdee1]">
                      1
                    </span>
                  </div>
                ))}
                <div className="bg-[#2b2d31] hover:bg-[#3b3d42] rounded-lg px-1.5 py-0.5 flex items-center cursor-pointer text-[#b5bac1] hover:text-[#dbdee1]">
                  <SmilePlus className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
