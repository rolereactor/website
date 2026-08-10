"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Columns2,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Expand,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ComparisonSlider } from "./comparison-slider";

interface FileMetadata {
  width?: number;
  height?: number;
  format?: string;
}

interface ResultPreviewProps {
  originalFile: File | null;
  resultBlob: Blob | null;
  isProcessing: boolean;
  error: string | null;
}

export function ResultPreview({
  originalFile,
  resultBlob,
  isProcessing,
  error,
}: ResultPreviewProps) {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalMeta, setOriginalMeta] = useState<FileMetadata>({});
  const [resultMeta, setResultMeta] = useState<FileMetadata>({});
  const [viewMode, setViewMode] = useState<"slider" | "side">("slider");

  useEffect(() => {
    if (originalFile) {
      const url = URL.createObjectURL(originalFile);
      setOriginalUrl(url);
      const img = new window.Image();
      img.onload = () =>
        setOriginalMeta({
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: originalFile.type.split("/")[1]?.toUpperCase(),
        });
      img.src = url;
      return () => URL.revokeObjectURL(url);
    }
    setOriginalUrl(null);
    setOriginalMeta({});
  }, [originalFile]);

  useEffect(() => {
    if (resultBlob) {
      const url = URL.createObjectURL(resultBlob);
      setResultUrl(url);
      const img = new window.Image();
      img.onload = () =>
        setResultMeta({
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: resultBlob.type?.split("/")[1]?.toUpperCase(),
        });
      img.src = url;
      return () => URL.revokeObjectURL(url);
    }
    setResultUrl(null);
    setResultMeta({});
  }, [resultBlob]);

  if (!originalFile) return null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasResult = !!resultUrl && !isProcessing;
  const sizeDelta =
    resultBlob && originalFile
      ? ((resultBlob.size - originalFile.size) / originalFile.size) * 100
      : null;
  const sizeReduced = sizeDelta !== null && sizeDelta < 0;

  // ─── Processing State ───────────────────────────────────────────────────────
  if (isProcessing) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03]">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-white/60">
            Processing your image…
          </p>
          <p className="mt-1 text-xs text-white/30">
            This may take a few seconds
          </p>
        </div>
      </div>
    );
  }

  // ─── Original Only (no result yet) ─────────────────────────────────────────
  if (!hasResult) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white/50">
            Selected image
          </span>
          <span className="text-xs text-white/30">
            {formatSize(originalFile.size)}
            {originalMeta.width &&
              ` · ${originalMeta.width}×${originalMeta.height}px`}
            {originalMeta.format && ` · ${originalMeta.format}`}
          </span>
        </div>

        {/* Show original preview */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {originalUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={originalUrl}
              alt="Original"
              className="w-full h-auto block"
            />
          )}
        </div>
      </div>
    );
  }

  // ─── Result Ready ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Original size" value={formatSize(originalFile.size)} />
        <StatCard
          label="Result size"
          value={formatSize(resultBlob!.size)}
          highlight={sizeReduced ? "green" : "amber"}
        />
        {sizeDelta !== null && (
          <StatCard
            label="Size change"
            value={`${sizeReduced ? "−" : "+"}${Math.abs(sizeDelta).toFixed(0)}%`}
            icon={sizeReduced ? TrendingDown : TrendingUp}
            highlight={sizeReduced ? "green" : "amber"}
          />
        )}
        {resultMeta.width && (
          <StatCard
            label="Output resolution"
            value={`${resultMeta.width}×${resultMeta.height}`}
            icon={Expand}
            highlight="cyan"
          />
        )}
      </div>

      {/* ── View mode toggle ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">Before / After comparison</span>
        <div className="flex gap-1 rounded-lg border border-white/8 bg-white/[0.03] p-1">
          <button
            type="button"
            onClick={() => setViewMode("slider")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
              viewMode === "slider"
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-white/30 hover:text-white/60"
            )}
          >
            <SlidersHorizontal className="h-3 w-3" />
            Slider
          </button>
          <button
            type="button"
            onClick={() => setViewMode("side")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
              viewMode === "side"
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-white/30 hover:text-white/60"
            )}
          >
            <Columns2 className="h-3 w-3" />
            Side by Side
          </button>
        </div>
      </div>

      {/* ── Comparison ────────────────────────────────────────────────────── */}
      {viewMode === "slider" ? (
        <ComparisonSlider originalUrl={originalUrl!} resultUrl={resultUrl} />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Original */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/50">
                Original
              </span>
              <span className="text-xs text-white/30">
                {formatSize(originalFile.size)}
                {originalMeta.width &&
                  ` · ${originalMeta.width}×${originalMeta.height}`}
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              {originalUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={originalUrl}
                  alt="Original"
                  className="w-full h-auto block"
                />
              )}
            </div>
          </div>

          {/* Result */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/50">Result</span>
              <span className="text-xs text-white/30">
                {formatSize(resultBlob!.size)}
                {resultMeta.width &&
                  ` · ${resultMeta.width}×${resultMeta.height}`}
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resultUrl}
                alt="Result"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}

// ── Stat card sub-component ─────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
  highlight?: "green" | "amber" | "cyan";
}) {
  const valueColor =
    highlight === "green"
      ? "text-emerald-400"
      : highlight === "amber"
        ? "text-amber-400"
        : highlight === "cyan"
          ? "text-cyan-400"
          : "text-white/80";

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-white/30">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 flex items-center gap-1 text-sm font-semibold",
          valueColor
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        {value}
      </p>
    </div>
  );
}
