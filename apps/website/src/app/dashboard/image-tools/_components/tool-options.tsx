"use client";

import type { ImageToolName } from "@/types/image-tools";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ToolOptionsProps {
  tool: ImageToolName;
  options: Record<string, unknown>;
  onChange: (options: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function ToolOptions({
  tool,
  options,
  onChange,
  disabled,
}: ToolOptionsProps) {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white/80">
        {tool === "resize" && "Resize Options"}
        {tool === "compress" && "Compression Level"}
        {tool === "convert" && "Output Format"}
        {tool === "upscale" && "Upscale Factor"}
      </h3>

      {tool === "resize" && (
        <ResizeOptions
          options={options}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {tool === "compress" && (
        <CompressOptions
          options={options}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {tool === "convert" && (
        <ConvertOptions
          options={options}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {tool === "upscale" && (
        <UpscaleOptions
          options={options}
          onChange={onChange}
          disabled={disabled}
        />
      )}
    </div>
  );
}

function ResizeOptions({
  options,
  onChange,
  disabled,
}: {
  options: Record<string, unknown>;
  onChange: (options: Record<string, unknown>) => void;
  disabled?: boolean;
}) {
  const mode = options.percentage ? "percentage" : "pixels";

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-2 rounded-lg border border-white/8 bg-white/3 p-1">
        {(["pixels", "percentage"] as const).map((m) => (
          <button
            key={m}
            type="button"
            disabled={disabled}
            onClick={() =>
              onChange(
                m === "percentage"
                  ? { percentage: 50, maintainRatio: true }
                  : { width: 800, height: 600, maintainRatio: true }
              )
            }
            className={cn(
              "flex-1 cursor-pointer rounded-md py-1.5 text-xs font-medium transition-all duration-200",
              mode === m
                ? "bg-cyan-500/20 text-cyan-400 shadow-sm"
                : "text-white/40 hover:text-white/60"
            )}
          >
            {m === "pixels" ? "Pixels" : "Percentage"}
          </button>
        ))}
      </div>

      {mode === "pixels" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Width (px)</Label>
            <Input
              type="number"
              min={1}
              max={10000}
              value={(options.width as number) || ""}
              onChange={(e) =>
                onChange({ ...options, width: parseInt(e.target.value) || 0 })
              }
              disabled={disabled}
              className="h-9 bg-white/5 text-white border-white/10 focus:border-cyan-500/50"
              placeholder="800"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Height (px)</Label>
            <Input
              type="number"
              min={1}
              max={10000}
              value={(options.height as number) || ""}
              onChange={(e) =>
                onChange({ ...options, height: parseInt(e.target.value) || 0 })
              }
              disabled={disabled}
              className="h-9 bg-white/5 text-white border-white/10 focus:border-cyan-500/50"
              placeholder="600"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label className="text-xs text-white/50">Scale (%)</Label>
          <Input
            type="number"
            min={1}
            max={1000}
            value={(options.percentage as number) || ""}
            onChange={(e) =>
              onChange({
                ...options,
                percentage: parseInt(e.target.value) || 0,
              })
            }
            disabled={disabled}
            className="h-9 bg-white/5 text-white border-white/10 focus:border-cyan-500/50"
            placeholder="50"
          />
        </div>
      )}

      {/* Maintain aspect ratio — shadcn Checkbox */}
      <div className="flex items-center gap-2.5">
        <Checkbox
          id="maintain-ratio"
          checked={(options.maintainRatio as boolean) !== false}
          onCheckedChange={(checked) =>
            onChange({ ...options, maintainRatio: !!checked })
          }
          disabled={disabled}
          className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
        />
        <label
          htmlFor="maintain-ratio"
          className="cursor-pointer select-none text-xs text-white/50"
        >
          Maintain aspect ratio
        </label>
      </div>
    </div>
  );
}

function CompressOptions({
  options,
  onChange,
  disabled,
}: {
  options: Record<string, unknown>;
  onChange: (options: Record<string, unknown>) => void;
  disabled?: boolean;
}) {
  const level = (options.level as string) || "recommended";

  const levels = [
    {
      value: "low",
      label: "Low",
      desc: "Best quality",
      icon: "◆◇◇",
    },
    {
      value: "recommended",
      label: "Balanced",
      desc: "Size + quality",
      icon: "◆◆◇",
    },
    {
      value: "extreme",
      label: "Extreme",
      desc: "Smallest size",
      icon: "◆◆◆",
    },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-2">
      {levels.map((l) => (
        <button
          key={l.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange({ level: l.value })}
          className={cn(
            "cursor-pointer flex flex-col items-center gap-1.5 rounded-lg p-3 text-center transition-all duration-200",
            level === l.value
              ? "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.08)]"
              : "bg-white/5 text-white/50 hover:bg-white/8 hover:text-white/70"
          )}
        >
          <span className="text-[10px] tracking-widest opacity-60">
            {l.icon}
          </span>
          <span className="text-sm font-semibold">{l.label}</span>
          <span className="text-[10px] text-white/30">{l.desc}</span>
        </button>
      ))}
    </div>
  );
}

function ConvertOptions({
  options,
  onChange,
  disabled,
}: {
  options: Record<string, unknown>;
  onChange: (options: Record<string, unknown>) => void;
  disabled?: boolean;
}) {
  const target = (options.to as string) || "jpg";

  const formats = [
    { value: "jpg", label: "JPG", desc: "Photos" },
    { value: "png", label: "PNG", desc: "Transparent" },
    { value: "gif", label: "GIF", desc: "Animated" },
    { value: "webp", label: "WebP", desc: "Modern" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {formats.map((f) => (
        <button
          key={f.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange({ to: f.value })}
          className={cn(
            "cursor-pointer flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
            target === f.value
              ? "bg-cyan-500/15 ring-1 ring-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.08)]"
              : "bg-white/5 hover:bg-white/8"
          )}
        >
          <span
            className={cn(
              "text-sm font-bold uppercase",
              target === f.value ? "text-cyan-400" : "text-white/60"
            )}
          >
            {f.label}
          </span>
          <span className="text-[10px] text-white/30">{f.desc}</span>
        </button>
      ))}
    </div>
  );
}

function UpscaleOptions({
  options,
  onChange,
  disabled,
}: {
  options: Record<string, unknown>;
  onChange: (options: Record<string, unknown>) => void;
  disabled?: boolean;
}) {
  const multiplier = (options.multiplier as string) || "2";

  const scales = [
    { value: "2", label: "2×", desc: "200% resolution", badge: "Standard" },
    { value: "4", label: "4×", desc: "400% resolution", badge: "Ultra HD" },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3">
      {scales.map((s) => (
        <button
          key={s.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange({ multiplier: s.value })}
          className={cn(
            "cursor-pointer flex flex-col items-center gap-1 rounded-lg p-4 text-center transition-all duration-200",
            multiplier === s.value
              ? "bg-amber-500/10 ring-1 ring-amber-500/40 shadow-[0_0_16px_rgba(245,158,11,0.1)]"
              : "bg-white/5 hover:bg-white/8"
          )}
        >
          <span
            className={cn(
              "text-3xl font-black tracking-tight",
              multiplier === s.value ? "text-amber-400" : "text-white/50"
            )}
          >
            {s.label}
          </span>
          <span className="text-[10px] text-white/30">{s.desc}</span>
          <span
            className={cn(
              "mt-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
              multiplier === s.value
                ? "bg-amber-500/20 text-amber-400"
                : "bg-white/5 text-white/25"
            )}
          >
            {s.badge}
          </span>
        </button>
      ))}
    </div>
  );
}
