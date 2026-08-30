import React, { createContext, useContext } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info, RotateCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiscordEmoji } from "@/types/discord";

// --- Emoji Display Component ---

export interface EmojiDisplayProps {
  emoji?: string | null;
  serverEmojis?: DiscordEmoji[];
  className?: string;
  fallback?: string;
}

export function EmojiDisplay({
  emoji,
  serverEmojis = [],
  className,
  fallback = "🔘",
}: EmojiDisplayProps) {
  // Handle empty state
  if (!emoji) {
    return (
      <span
        className={cn("inline-flex items-center justify-center", className)}
      >
        {fallback}
      </span>
    );
  }

  // Check if it's a Discord custom emoji (starts with < and contains :)
  const isCustomEmoji = emoji.startsWith("<") && emoji.includes(":");

  if (isCustomEmoji) {
    const customEmoji = serverEmojis.find((e) => e.identifier === emoji);

    // If we found the server emoji, render the image
    if (customEmoji?.url) {
      return (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={customEmoji.url}
          alt={customEmoji.name || "emoji"}
          className={cn(
            "w-7 h-7 object-contain inline-block shrink-0",
            className
          )}
        />
      );
    }

    // Fallback if the custom emoji identifier exists but URL doesn't
    return (
      <span
        className={cn("inline-flex items-center justify-center", className)}
      >
        {fallback}
      </span>
    );
  }

  // Render native emoji
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center text-2xl leading-none",
        className
      )}
    >
      {emoji}
    </span>
  );
}

// --- Emoji Picker Component ---

export interface CustomEmoji {
  id: string;
  name: string;
  keywords: string[];
  skins: { src: string }[];
}

interface EmojiPickerContextValue {
  guildId?: string;
  isLoadingEmojis?: boolean;
  hasFetchedEmojis?: boolean;
  emojiError?: string | null;
  onRefresh?: () => void;
  customEmojis?: CustomEmoji[];
  guildIconUrl?: string | null;
  onSelect?: (emoji: { native?: string; id: string }) => void;
}

const EmojiPickerContext = createContext<EmojiPickerContextValue>({});

export function EmojiPickerStyles() {
  return (
    <style jsx global>{`
      .emoji-mart-container em-emoji-picker {
        --border-radius: 0;
        --category-icon-size: 20px;
        --font-family: inherit;
        --font-size: 16px;
        --rgb-accent: 6, 182, 212; /* Cyan-500 */
        --rgb-background: 24, 24, 27; /* Zinc-950 */
        --color-details: #a1a1aa; /* Zinc-400 */
        --color-preview: #e4e4e7; /* Zinc-200 */
        --emoji-size: 26px;
        --emoji-set-size: 26px;
        width: 100% !important;
        height: 350px !important;
        background: transparent !important;
        border: none !important;
      }
      .emoji-mart-container em-emoji-picker::part(root) {
        width: 100% !important;
        border: none !important;
      }
      .emoji-mart-container em-emoji-picker::part(nav) {
        padding: 0 4px !important;
      }
      /* Styled search icon */
      .emoji-mart-container em-emoji-picker::part(search-icon) {
        color: #06b6d4;
        opacity: 0.8;
      }
      /* Aggressively Hide Scrollbar & Space */
      .emoji-mart-container em-emoji-picker::part(scroll) {
        scrollbar-width: none !important; /* Firefox */
        -ms-overflow-style: none !important; /* IE/Edge */
        padding-right: 0 !important;
        margin-right: 0 !important;
        overflow-y: scroll !important;
      }
      .emoji-mart-container em-emoji-picker::part(scroll)::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      /* Cyberpunk category buttons */
      .emoji-mart-container em-emoji-picker::part(nav) button {
        opacity: 0.5;
        transition: all 0.2s;
        border-radius: 0 !important;
      }
      .emoji-mart-container em-emoji-picker::part(nav) button:hover {
        opacity: 1;
        filter: drop-shadow(0 0 5px rgba(6, 182, 212, 0.5));
      }
      .emoji-mart-container
        em-emoji-picker::part(nav)
        button[aria-selected="true"] {
        opacity: 1;
        border-bottom: 2px solid #06b6d4;
      }
      .emoji-mart-container em-emoji-picker::part(nav) button img {
        filter: grayscale(1) brightness(1.2);
        transition: all 0.2s ease;
        border-radius: 0 !important;
      }
      .emoji-mart-container
        em-emoji-picker::part(nav)
        button[aria-selected="true"]
        img {
        filter: grayscale(0) drop-shadow(0 0 5px rgba(6, 182, 212, 0.8));
      }
      /* Input field styling */
      .emoji-mart-container em-emoji-picker::part(input) {
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #fff;
        font-family: monospace;
        margin: 8px 12px !important;
        width: calc(100% - 24px) !important;
      }
      .emoji-mart-container em-emoji-picker::part(input):focus {
        border-color: #06b6d4;
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
      }
    `}</style>
  );
}

// Root component
interface EmojiPickerProps extends React.ComponentPropsWithoutRef<
  typeof Popover
> {
  guildId?: string;
  isLoadingEmojis?: boolean;
  hasFetchedEmojis?: boolean;
  emojiError?: string | null;
  onRefresh?: () => void;
  customEmojis?: CustomEmoji[];
  guildIconUrl?: string | null;
  onEmojiSelect?: (emoji: { native?: string; id: string }) => void;
}

export function EmojiPicker({
  children,
  guildId,
  isLoadingEmojis = false,
  hasFetchedEmojis = true,
  emojiError,
  onRefresh,
  customEmojis = [],
  guildIconUrl,
  onEmojiSelect,
  ...props
}: EmojiPickerProps) {
  return (
    <EmojiPickerContext.Provider
      value={{
        guildId,
        isLoadingEmojis,
        hasFetchedEmojis,
        emojiError,
        onRefresh,
        customEmojis,
        guildIconUrl,
        onSelect: onEmojiSelect,
      }}
    >
      <Popover {...props}>{children}</Popover>
    </EmojiPickerContext.Provider>
  );
}

// Trigger component
export const EmojiPickerTrigger = PopoverTrigger;

// Content component
type EmojiPickerContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof PopoverContent>,
  "children"
>;

export function EmojiPickerContent({
  className,
  align = "start",
  side = "top",
  sideOffset = 8,
  ...props
}: EmojiPickerContentProps) {
  const {
    guildId,
    isLoadingEmojis = false,
    hasFetchedEmojis = true,
    emojiError,
    onRefresh,
    customEmojis = [],
    guildIconUrl,
    onSelect,
  } = useContext(EmojiPickerContext);

  return (
    <PopoverContent
      className={cn(
        "w-auto p-0 border-0 bg-transparent shadow-none animate-dialog-glitch-in",
        className
      )}
      align={align}
      side={side}
      sideOffset={sideOffset}
      {...props}
    >
      <EmojiPickerStyles />

      {/* Cyberpunk Container */}
      <div
        className={cn(
          "bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)]",
          "flex flex-col w-79.5 overflow-hidden",
          "dialog-scanlines relative group"
        )}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Neon Glow Border Effect */}
        <div className="absolute inset-0 border border-cyan-500/20 rounded-2xl pointer-events-none z-50 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Header */}
        <div className="relative z-10 p-3 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-cyan-500/20 p-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono">
              Emoji Database
            </span>
          </div>

          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onRefresh();
              }}
              className={cn(
                "h-6 w-6 rounded hover:bg-cyan-500/10 text-zinc-500 hover:text-cyan-400 transition-all",
                isLoadingEmojis && "animate-spin text-cyan-500"
              )}
              title="Sync Database"
              disabled={isLoadingEmojis}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Picker Content */}
        <div className="flex-1 relative z-10 bg-zinc-950/50">
          {isLoadingEmojis || !hasFetchedEmojis ? (
            <div className="h-87.5 flex flex-col items-center justify-center text-zinc-500 gap-3">
              <div className="relative">
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                <div className="absolute inset-0 animate-pulse text-cyan-500/50 blur-sm"></div>
              </div>
              <span className="text-xs font-mono uppercase tracking-widest animate-pulse">
                Accessing Neural Net...
              </span>
            </div>
          ) : (
            <>
              {emojiError && (
                <div className="bg-red-500/10 border-b border-red-500/10 p-2 text-[10px] text-red-300 flex items-center gap-2 font-mono">
                  <Info className="w-3 h-3" />
                  ERROR: {emojiError}
                </div>
              )}

              <div className="emoji-mart-container">
                <Picker
                  key={guildId}
                  data={data}
                  onEmojiSelect={onSelect}
                  width="100%"
                  custom={
                    customEmojis.length > 0 && guildId
                      ? [
                          {
                            id: `custom-${guildId}`,
                            name: "Server Emojis",
                            emojis: customEmojis,
                          },
                        ]
                      : []
                  }
                  theme="dark"
                  skinTonePosition="none"
                  previewPosition="none"
                  navPosition="top"
                  autoFocus={true}
                  perLine={8}
                  categories={[
                    ...(customEmojis.length > 0 && guildId
                      ? [`custom-${guildId}`]
                      : []),
                    "people",
                    "nature",
                    "foods",
                    "activity",
                    "places",
                    "objects",
                    "symbols",
                    "flags",
                  ]}
                  categoryIcons={
                    guildIconUrl && guildId
                      ? {
                          [`custom-${guildId}`]: {
                            src: guildIconUrl,
                          },
                        }
                      : undefined
                  }
                />
              </div>
            </>
          )}
        </div>

        {/* Footer decoration */}
        <div className="h-1 w-full bg-linear-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0" />
      </div>
    </PopoverContent>
  );
}
