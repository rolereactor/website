/**
 * Overlay Theme System
 *
 * Based on UI design research:
 * - Semi-transparent backgrounds (40-60% opacity)
 * - Clean sans-serif fonts (Inter, system-ui)
 * - Consistent border radius (8-12px)
 * - Readable font sizes (14-16px minimum)
 * - Subtle shadows for depth
 *
 * Ambient themes inspired by Flocus.com aesthetic:
 * - Warm, muted color palettes
 * - Glassmorphism (frosted glass)
 * - Soft, atmospheric feel
 *
 * Advanced customization inspired by Ghost Chat:
 * - Fine-grained control over typography, colors, and layout
 * - CSS variable-based theme application
 * - Import/Export for theme sharing
 */

export interface OverlayTheme {
  // Core properties (backward compatible)
  bg: string;
  text: string;
  accent: string;
  font: string;
  radius: number;
  fontSize: number;
  /** Display name for custom (duplicated) themes */
  name?: string;
  /** Optional background image URL for ambient themes */
  bgImage?: string;
  /** Background blur when using bgImage */
  bgBlur?: number;

  // Advanced typography
  lineHeight?: number;
  fontWeight?: number;
  letterSpacing?: number;

  // Message styling
  messageBg?: string;
  messagePadding?: string;
  messageRadius?: number;
  messageGap?: number;

  // Text styling
  textColor?: string;
  textShadow?: string;
  textStrokeWidth?: number;
  textStrokeColor?: string;

  // Username styling
  usernameWeight?: number;
  showColon?: boolean;

  // Element visibility
  showBadges?: boolean;
  badgeSize?: number;
  showAvatars?: boolean;
  avatarSize?: number;
  showTimestamps?: boolean;

  // Layout
  topToBottom?: boolean;

  // Background overlay
  bgOpacity?: number;

  // Chat panel (dreamy presentation mode)
  /** Translucent glass panel behind the chat feed; enables the panel layout */
  panelBg?: string;
  panelRadius?: number;
  panelPadding?: string;
  panelBorder?: string;
  /** Role label row above each message bubble */
  roleLabels?: boolean;
  /** Vertical dotted decoration rail with the role glyph (outer edge) */
  decor?: boolean;
  /** Symbol shown at the top of the decoration rail, aligned with the name */
  decorSymbol?: string;
  /** Platform badge chip next to the username */
  showPlatform?: boolean;
  /** Render stream events (resub, raid, …) as event lines in the feed */
  eventLines?: boolean;
  eventColor?: string;
  /** Decorative hanging charm strings on the panel edges */
  ornaments?: boolean;
  /** Content alignment inside the feed (rail + text side, "left" default).
   * The widget itself is always centered in the browser source. */
  align?: "left" | "right";
}

/**
 * Built-in theme presets
 *
 * Research findings:
 * - Backgrounds: 40-60% opacity for readability over video
 * - Fonts: Inter/system-ui for clean, modern look
 * - Radius: 8-12px for polished feel
 * - Font size: 14-16px minimum for mobile readability
 */
export const THEME_PRESETS: Record<string, OverlayTheme> = {
  // ── Classic themes ──────────────────────────────────────────────
  dark: {
    bg: "rgba(15,15,25,0.65)",
    text: "#f0f0f5",
    accent: "#9146ff",
    font: "'Inter', system-ui, -apple-system, sans-serif",
    radius: 10,
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 400,
    letterSpacing: 0,
    messageBg: "transparent",
    messagePadding: "2px 0",
    messageRadius: 0,
    messageGap: 4,
    textColor: "#f0f0f5",
    textShadow: "none",
    textStrokeWidth: 0,
    textStrokeColor: "#000000",
    usernameWeight: 600,
    showColon: true,
    showBadges: true,
    badgeSize: 14,
    showAvatars: true,
    avatarSize: 20,
    showTimestamps: true,
    topToBottom: false,
    bgOpacity: 0.65,
    panelBg: "rgba(10,10,18,0.72)",
    panelRadius: 20,
    panelPadding: "18px 16px",
    panelBorder: "1px solid rgba(255,255,255,0.1)",
  },
  glass: {
    bg: "rgba(255,255,255,0.12)",
    text: "#ffffff",
    accent: "#00d4ff",
    font: "'Inter', system-ui, -apple-system, sans-serif",
    radius: 12,
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 400,
    letterSpacing: 0,
    messageBg: "rgba(255,255,255,0.08)",
    messagePadding: "4px 8px",
    messageRadius: 8,
    messageGap: 4,
    textColor: "#ffffff",
    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
    textStrokeWidth: 0,
    textStrokeColor: "#000000",
    usernameWeight: 600,
    showColon: true,
    showBadges: true,
    badgeSize: 14,
    showAvatars: true,
    avatarSize: 20,
    showTimestamps: true,
    topToBottom: false,
    bgOpacity: 0.12,
    panelBg: "rgba(255,255,255,0.1)",
    panelRadius: 20,
    panelPadding: "18px 16px",
    panelBorder: "1px solid rgba(255,255,255,0.18)",
  },
  cyberpunk: {
    bg: "rgba(8,12,20,0.7)",
    text: "#e4f6fc",
    accent: "#22d3ee",
    font: "'Inter', 'Segoe UI', sans-serif",
    radius: 12,
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 400,
    letterSpacing: 0,
    messageBg: "rgba(6,16,26,0.85)",
    messagePadding: "6px 10px",
    messageRadius: 10,
    messageGap: 8,
    textColor: "#e4f6fc",
    textShadow: "0 1px 2px rgba(0,0,0,0.6)",
    panelBg: "rgba(8,12,20,0.62)",
    panelRadius: 20,
    panelPadding: "18px 16px",
    panelBorder: "1px solid rgba(34,211,238,0.22)",
    roleLabels: false,
    textStrokeWidth: 0,
    textStrokeColor: "#000000",
    usernameWeight: 700,
    showColon: true,
    showBadges: true,
    badgeSize: 14,
    showAvatars: true,
    avatarSize: 20,
    showTimestamps: true,
    topToBottom: false,
    bgOpacity: 0.7,
  },

  dreamy: {
    bg: "rgba(0,0,0,0)",
    text: "#f3f1ff",
    accent: "#c3b5fd",
    font: "'Inter', system-ui, -apple-system, sans-serif",
    radius: 24,
    fontSize: 14,
    lineHeight: 1.45,
    fontWeight: 400,
    letterSpacing: 0,
    messageBg: "rgba(38, 35, 74, 0.92)",
    messagePadding: "8px 14px",
    messageRadius: 10,
    messageGap: 12,
    textColor: "#f3f1ff",
    textShadow: "none",
    textStrokeWidth: 0,
    textStrokeColor: "#000000",
    usernameWeight: 700,
    showColon: false,
    showBadges: false,
    showTimestamps: false,
    topToBottom: false,
    bgOpacity: 0,
    panelBg: "rgba(139, 132, 224, 0.30)",
    panelRadius: 28,
    panelPadding: "22px 20px",
    panelBorder: "1px solid rgba(255,255,255,0.14)",
    roleLabels: true,
    eventLines: true,
    eventColor: "#c3b5fd",
    ornaments: true,
  },

  midnight: {
    bg: "rgba(10,10,20,0.5)",
    bgImage: "https://images.unsplash.com/photo-1475274047050-1d0c55b0252c?w=1920&q=80",
    bgBlur: 50,
    text: "#c8d6e5",
    accent: "#a29bfe",
    font: "'Inter', system-ui, -apple-system, sans-serif",
    radius: 12,
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 400,
    letterSpacing: 0,
    messageBg: "rgba(162,155,254,0.1)",
    messagePadding: "6px 10px",
    messageRadius: 8,
    messageGap: 4,
    textColor: "#c8d6e5",
    textShadow: "0 1px 3px rgba(0,0,0,0.4)",
    textStrokeWidth: 0,
    textStrokeColor: "#000000",
    usernameWeight: 600,
    showColon: true,
    showBadges: true,
    badgeSize: 14,
    showAvatars: true,
    avatarSize: 20,
    showTimestamps: true,
    topToBottom: false,
    bgOpacity: 0.5,
    panelBg: "rgba(10,10,22,0.65)",
    panelRadius: 20,
    panelPadding: "18px 16px",
    panelBorder: "1px solid rgba(162,155,254,0.25)",
  },
};

export const OVERLAY_THEME_STORAGE_KEY = "rr-overlay-themes";

const STORAGE_KEY = OVERLAY_THEME_STORAGE_KEY;

/**
 * Subscribe to overlay theme changes made in other tabs (the dashboard).
 * Uses the cross-tab `storage` event, so any open overlay URL updates
 * live when the dashboard saves a theme — no new URL/token needed.
 */
export function onOverlayThemeChange(
  callback: () => void,
): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

/**
 * Check if a theme is a built-in preset (not user-customized).
 */
export function isPresetTheme(themeName: string): boolean {
  return themeName in THEME_PRESETS;
}

/**
 * Get all preset theme names.
 */
export function getPresetThemeNames(): string[] {
  return Object.keys(THEME_PRESETS);
}

/**
 * Create a duplicate of a theme with a new ID.
 */
export function duplicateTheme(
  theme: OverlayTheme,
  newName: string,
): OverlayTheme {
  return {
    ...theme,
    // Generate a unique ID based on timestamp
    name: newName,
  };
}

/**
 * Load saved theme for a guild+widget, or fall back to default.
 */
export function loadOverlayTheme(
  guildId: string,
  widget: string,
): OverlayTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return THEME_PRESETS.dark;

    const themes = JSON.parse(stored) as Record<string, OverlayTheme>;
    const key = `${guildId}:${widget}`;
    return themes[key] || THEME_PRESETS.dark;
  } catch {
    return THEME_PRESETS.dark;
  }
}

/**
 * Save theme for a guild+widget.
 */
export function saveOverlayTheme(
  guildId: string,
  widget: string,
  theme: OverlayTheme,
): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const themes = stored ? JSON.parse(stored) : {};
    const key = `${guildId}:${widget}`;
    themes[key] = theme;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  } catch {
    // localStorage unavailable (SSR, private browsing, etc.)
  }
}

/**
 * Reset theme to default.
 */
export function resetOverlayTheme(guildId: string, widget: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const themes = JSON.parse(stored);
    const key = `${guildId}:${widget}`;
    delete themes[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  } catch {
    // ignore
  }
}

/**
 * Convert theme properties to CSS variables for widget application.
 */
export function themeToCSS(theme: OverlayTheme): Record<string, string> {
  return {
    "--theme-font": theme.font,
    "--theme-font-size": `${theme.fontSize}px`,
    "--theme-line-height": String(theme.lineHeight ?? 1.5),
    "--theme-font-weight": String(theme.fontWeight ?? 400),
    "--theme-letter-spacing": `${theme.letterSpacing ?? 0}px`,
    "--theme-bg": theme.bg,
    "--theme-bg-image": theme.bgImage ? `url(${theme.bgImage})` : "none",
    "--theme-bg-blur": `${theme.bgBlur ?? 0}px`,
    "--theme-bg-opacity": String(theme.bgOpacity ?? 0.65),
    "--theme-text": theme.textColor ?? theme.text,
    "--theme-accent": theme.accent,
    "--theme-radius": `${theme.radius}px`,
    "--theme-message-bg": theme.messageBg ?? "transparent",
    "--theme-message-padding": theme.messagePadding ?? "2px 0",
    "--theme-message-radius": `${theme.messageRadius ?? 0}px`,
    "--theme-message-gap": `${theme.messageGap ?? 4}px`,
    "--theme-text-shadow": theme.textShadow ?? "none",
    "--theme-text-stroke": theme.textStrokeWidth
      ? `${theme.textStrokeWidth}px ${theme.textStrokeColor ?? "#000000"}`
      : "none",
    "--theme-username-weight": String(theme.usernameWeight ?? 600),
    "--theme-badge-size": `${theme.badgeSize ?? 14}px`,
    "--theme-avatar-size": `${theme.avatarSize ?? 20}px`,
  };
}

/**
 * Export theme as JSON for sharing (with LLM instructions).
 */
export function exportTheme(theme: OverlayTheme, themeName?: string): string {
  const exportData = {
    ...theme,
    name: themeName || theme.name || "Custom Theme",
    _llm_instructions: [
      "This is a Role Reactor overlay theme file. You can modify the values below and import it back.",
      "Fields:",
      "  name: Display name for the theme",
      "  bg: CSS background color (e.g. 'rgba(15,15,25,0.65)', '#1a1a2e')",
      "  bgImage: Optional background image URL for ambient themes",
      "  bgBlur: Background blur in pixels (0-100)",
      "  bgOpacity: Background opacity (0-1)",
      "  text: Base text color",
      "  accent: Accent color for highlights",
      "  font: CSS font-family value (e.g. \"'Inter', system-ui, sans-serif\")",
      "  radius: Border radius in pixels (0-20)",
      "  fontSize: Font size in pixels (8-24)",
      "  lineHeight: Line height multiplier (1-2.5)",
      "  fontWeight: Font weight for message text (100-900, step 100; 400=normal, 700=bold)",
      "  letterSpacing: Letter spacing in pixels (-2 to 4)",
      "  messageBg: Message background color (e.g. 'transparent', 'rgba(0,0,0,0.3)')",
      "  messagePadding: CSS padding value (e.g. '2px 0', '4px 8px')",
      "  messageRadius: Message border radius in pixels (0-16)",
      "  messageGap: Gap between messages in pixels (0-12)",
      "  textColor: Text color (e.g. 'inherit', '#ffffff')",
      "  textShadow: CSS text-shadow value (e.g. 'none', '0 1px 2px rgba(0,0,0,0.5)')",
      "  textStrokeWidth: Outline thickness around text in pixels (0-5, 0 = no outline)",
      "  textStrokeColor: CSS color value for the text outline (e.g. '#000000')",
      "  usernameWeight: Username font weight (400-900, step 100)",
      "  showColon: Show ':' after username (true/false)",
      "  showBadges: Show user badges (true/false)",
      "  badgeSize: Badge size in pixels (10-28)",
      "  showAvatars: Show user avatars (true/false)",
      "  avatarSize: Avatar size in pixels (12-32)",
      "  showTimestamps: Show timestamps (true/false)",
      "  topToBottom: Show newest messages at top (true/false)",
      "Do NOT modify the 'id' field. Only return valid JSON.",
    ],
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Import theme from JSON string.
 */
export function importTheme(json: string): OverlayTheme | null {
  try {
    const data = JSON.parse(json);
    // Remove LLM instructions and any metadata
    delete data._llm_instructions;
    delete data._instructions;
    return data as OverlayTheme;
  } catch {
    return null;
  }
}

/**
 * Merge partial theme with base theme (for defaults).
 */
export function mergeTheme(
  base: OverlayTheme,
  partial: Partial<OverlayTheme>,
): OverlayTheme {
  return { ...base, ...partial };
}
