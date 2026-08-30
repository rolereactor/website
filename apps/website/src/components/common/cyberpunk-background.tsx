"use client";

import { cn } from "@/lib/utils";

interface CyberpunkBackgroundProps {
  /** Size of the grid cells in pixels. Default: 48 */
  gridSize?: number;
  /** Opacity of the grid lines. Default: 0.025 */
  gridOpacity?: number;
  /** Color of the grid lines. Default: #00ffff (Cyan) */
  gridColor?: string;
  /** Opacity of the neon glows. Default: 1 */
  glowOpacity?: number;
  /** Primary glow color (top-right). Default: rgba(0, 255, 255, 0.1) */
  primaryGlow?: string;
  /** Secondary glow color (bottom-left). Default: rgba(255, 0, 255, 0.08) */
  secondaryGlow?: string;
  /** Optional mask for fading edges. Example: radial-gradient(circle, black, transparent) */
  mask?: string;
  /** Whether to show the grid pattern. Default: true */
  showGrid?: boolean;
  /** Whether to show the neon glows. Default: true */
  showGlows?: boolean;
  /** Whether to show TV static noise. Default: false */
  showNoise?: boolean;
  /** Whether to show CRT scanlines. Default: false */
  showScanlines?: boolean;
  /** Whether to show animated glitch lines. Default: false */
  showGlitchLines?: boolean;
  /** Whether to show a failing TV flicker effect. Default: false */
  showFlicker?: boolean;
  /** Additional class names for the container */
  className?: string;
}

/**
 * A comprehensive Cyberpunk-themed background component.
 * Combines a high-performance CSS grid pattern with atmospheric neon glows.
 */
export function CyberpunkBackground({
  gridSize = 48,
  gridOpacity = 0.025,
  gridColor = "#00ffff",
  glowOpacity = 1,
  primaryGlow = "rgba(0, 255, 255, 0.08)",
  secondaryGlow = "rgba(255, 0, 255, 0.06)",
  mask,
  showGrid = true,
  showGlows = true,
  showNoise = false,
  showScanlines = false,
  showGlitchLines = false,
  showFlicker = false,
  className,
}: CyberpunkBackgroundProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden",
        showFlicker && "animate-tv-flicker",
        className
      )}
    >
      {/* Neon Glow Layer */}
      {showGlows && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: glowOpacity,
            background: `
              radial-gradient(circle at 100% 0%, ${primaryGlow}, transparent 50%),
              radial-gradient(circle at 0% 100%, ${secondaryGlow}, transparent 50%)
            `,
          }}
        />
      )}

      {/* Noise Layer - CRT Static */}
      {showNoise && (
        <div
          className="absolute inset-0 opacity-3 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3Y%3Cfilter id='noiseFilter'%3Y%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3Y%3C/filter%3Y%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3Y%3C/svg%3Y")`,
          }}
        />
      )}

      {/* Scanlines Layer - Old TV Effect */}
      {showScanlines && (
        <div
          className="absolute inset-0 opacity-4 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 2px,
              #fff 2px,
              #fff 4px
            )`,
            backgroundSize: "100% 4px",
            animation: "scanlines 10s linear infinite",
          }}
        />
      )}

      {/* Grid Pattern Layer */}
      {showGrid && (
        <div
          className="absolute inset-0"
          style={{
            opacity: gridOpacity,
            backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        />
      )}

      {/* Animated Glitch Lines */}
      {showGlitchLines && (
        <div className="absolute inset-0 opacity-20 mix-blend-screen overflow-hidden">
          <div
            className="absolute inset-x-0 h-0.5 bg-white/20 animate-glitch-line-move"
            style={{
              background: `linear-gradient(90deg, transparent, ${gridColor}, transparent)`,
              boxShadow: `0 0 15px ${gridColor}`,
            }}
          />
          <div
            className="absolute inset-x-0 h-px bg-fuchsia-500/30 animate-glitch-line-move"
            style={{
              animationDelay: "-2.5s",
              animationDuration: "7s",
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Alias for backward compatibility during transition
 * @deprecated Use CyberpunkBackground instead
 */
export const CyberpunkGrid = CyberpunkBackground;
