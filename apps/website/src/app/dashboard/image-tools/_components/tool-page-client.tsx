"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Coins,
  Download,
  RotateCcw,
  FileImage,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { UploadZone } from "./upload-zone";
import { ToolOptions } from "./tool-options";
import { ResultPreview } from "./result-preview";

import type { ImageToolName } from "@/types/image-tools";

const TOOL_COST_FALLBACK: Record<ImageToolName, number> = {
  resize: 0.5,
  compress: 0.5,
  convert: 0.5,
  upscale: 5,
};

const TOOL_DEFAULT_OPTIONS: Record<ImageToolName, Record<string, unknown>> = {
  resize: { width: 800, height: 600, maintainRatio: true },
  compress: { level: "recommended" },
  convert: { to: "jpg" },
  upscale: { multiplier: "2" },
};

// Human-readable button label per tool
const TOOL_ACTION_LABEL: Record<ImageToolName, string> = {
  resize: "Resize Image",
  compress: "Compress Image",
  convert: "Convert Image",
  upscale: "Upscale Image",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface ToolPageClientProps {
  tool: ImageToolName;
}

export function ToolPageClient({ tool }: ToolPageClientProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [options, setOptions] = useState<Record<string, unknown>>(
    TOOL_DEFAULT_OPTIONS[tool]
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFilename, setResultFilename] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [toolInfo, setToolInfo] = useState<
    Record<string, { cost: number; freeDaily: boolean }>
  >({});
  const [freeQuotaRemaining, setFreeQuotaRemaining] = useState<number | null>(
    null
  );
  const [freeQuotaTotal, setFreeQuotaTotal] = useState<number | null>(null);
  const [isLoadingCosts, setIsLoadingCosts] = useState(true);

  // Reset options and result when tool changes (fix #2)
  useEffect(() => {
    setOptions(TOOL_DEFAULT_OPTIONS[tool]);
    setResultBlob(null);
    setError(null);
    // Keep the selected file so user doesn't lose their upload when switching tools
  }, [tool]);

  // Fetch live tool config and free quota
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, quotaRes] = await Promise.all([
          fetch("/api/image-tools"),
          fetch("/api/image-tools/free-quota"),
        ]);

        if (configRes.ok) {
          const data = await configRes.json();
          const tools = data?.tools as
            | Record<string, { userCores: number; freeDaily: boolean }>
            | undefined;
          if (tools) {
            const info: Record<string, { cost: number; freeDaily: boolean }> =
              {};
            for (const [key, val] of Object.entries(tools)) {
              info[key] = { cost: val.userCores, freeDaily: val.freeDaily };
            }
            setToolInfo(info);
          }
        }

        if (quotaRes.ok) {
          const data = await quotaRes.json();
          if (data?.remaining !== undefined) {
            setFreeQuotaRemaining(data.remaining);
          }
          if (data?.total !== undefined) {
            setFreeQuotaTotal(data.total);
          }
        }
      } catch {
        // Silently fall back
      } finally {
        setIsLoadingCosts(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/user/balance");
        if (res.ok) {
          const data = await res.json();
          setUserBalance(data.credits ?? null);
        }
      } catch {
        // Silently fail — balance is optional
      } finally {
        setIsLoadingBalance(false);
      }
    };
    fetchBalance();
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResultBlob(null);
    setError(null);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setResultBlob(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("tool", tool);
      formData.append("options", JSON.stringify(options));

      const response = await fetch("/api/image-tools", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Processing failed (${response.status})`);
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="?(.+?)"?$/);
      const filename = filenameMatch?.[1] || `processed_${selectedFile.name}`;

      setResultBlob(blob);
      setResultFilename(filename);

      const creditsDeducted = response.headers.get("X-Credits-Deducted");
      const freeRemaining = response.headers.get("X-Free-Remaining");

      toast.success(
        creditsDeducted && creditsDeducted !== "0"
          ? `Image processed! Used ${creditsDeducted} cores.`
          : "Image processed successfully for free!"
      );

      // Update balances optimistically
      if (creditsDeducted && creditsDeducted !== "0" && userBalance !== null) {
        setUserBalance((prev) =>
          prev !== null ? prev - parseFloat(creditsDeducted) : null
        );
      }
      if (freeRemaining !== null) {
        setFreeQuotaRemaining(parseInt(freeRemaining, 10));
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process image";
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResultBlob(null);
    setError(null);
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = resultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const info = toolInfo[tool] ?? {
    cost: TOOL_COST_FALLBACK[tool],
    freeDaily: false,
  };
  const cost = info.cost;
  const isFreeEligible = info.freeDaily;
  const isCurrentlyFree =
    isFreeEligible && freeQuotaRemaining !== null && freeQuotaRemaining > 0;
  const isUpscale = tool === "upscale";

  // Fix #1: Check if balance is sufficient (only if it's not currently free)
  const hasInsufficientBalance =
    !isCurrentlyFree && userBalance !== null && userBalance < cost;

  // Process button is disabled if: no file, processing, or insufficient balance
  const isProcessDisabled =
    isProcessing || !selectedFile || hasInsufficientBalance;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="min-w-0 space-y-4">
        {!selectedFile ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            disabled={isProcessing}
            tool={tool}
          />
        ) : (
          <ResultPreview
            originalFile={selectedFile}
            resultBlob={resultBlob}
            isProcessing={isProcessing}
            error={error}
          />
        )}
      </div>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {/* Options */}
        <ToolOptions
          tool={tool}
          options={options}
          onChange={setOptions}
          disabled={isProcessing}
        />

        {/* Process card */}
        <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
          {/* Balance */}
          {isLoadingBalance ? (
            <Skeleton className="h-4 w-full rounded bg-white/10" />
          ) : userBalance !== null ? (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-white/40">
                <Coins className="h-3.5 w-3.5" />
                Your balance
              </span>
              <span
                className={cn(
                  "font-semibold",
                  hasInsufficientBalance ? "text-red-400" : "text-white/70"
                )}
              >
                {userBalance} cores
              </span>
            </div>
          ) : null}

          {/* Cost row */}
          {isLoadingCosts ? (
            <Skeleton className="h-8 w-full rounded-lg bg-white/10" />
          ) : (
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
              <span className="text-white/40">Cost per image</span>
              {isCurrentlyFree ? (
                <span className="font-semibold text-emerald-400">
                  Free ({freeQuotaRemaining}
                  {freeQuotaTotal ? `/${freeQuotaTotal}` : ""} remaining today)
                </span>
              ) : (
                <span
                  className={cn(
                    "font-semibold",
                    isUpscale ? "text-amber-400" : "text-cyan-400"
                  )}
                >
                  {cost} cores
                </span>
              )}
            </div>
          )}

          {/* Fix #1: Insufficient balance warning */}
          {hasInsufficientBalance && selectedFile && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                Insufficient balance. You need{" "}
                <span className="font-semibold">{cost} cores</span> but only
                have <span className="font-semibold">{userBalance}</span>.
              </span>
            </div>
          )}

          {/* Fix #3: Upscale time estimate */}
          {isUpscale && selectedFile && !resultBlob && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-400/80">
              <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>AI upscaling may take up to 60 seconds</span>
            </div>
          )}

          {/* Fix #6: File info in sidebar */}
          {selectedFile && !resultBlob && !isProcessing && (
            <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-xs">
              <FileImage className="h-3.5 w-3.5 shrink-0 text-white/30" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white/60">
                  {selectedFile.name}
                </p>
                <p className="text-white/30">
                  {formatBytes(selectedFile.size)}
                </p>
              </div>
            </div>
          )}

          {/* Fix #5: Dynamic process button label */}
          <Button
            onClick={handleProcess}
            disabled={isProcessDisabled}
            size="lg"
            className={cn(
              "w-full font-semibold transition-all",
              selectedFile && !hasInsufficientBalance
                ? isUpscale
                  ? "bg-amber-500 text-white hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                  : "bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                : "bg-white/5 text-white/30"
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              TOOL_ACTION_LABEL[tool]
            )}
          </Button>

          {!selectedFile && (
            <p className="text-center text-[11px] text-white/30">
              Upload an image above to get started
            </p>
          )}

          {selectedFile && !resultBlob && !isProcessing && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 font-semibold"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Choose Different Image
              </Button>
            </div>
          )}

          {resultBlob && !isProcessing && (
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={handleDownload}
                size="lg"
                className={cn(
                  "w-full font-semibold transition-all",
                  isUpscale
                    ? "bg-amber-500 text-white hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                    : "bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                )}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Result
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 font-semibold"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                New Image
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
