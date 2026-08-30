"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ACCEPTED_TYPES_ALL = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const TOOL_CONFIG: Record<
  string,
  { maxFileSizeMB: number; acceptedTypes: string[]; formats: string[] }
> = {
  resize: {
    maxFileSizeMB: 20,
    acceptedTypes: ACCEPTED_TYPES_ALL,
    formats: ["JPG", "PNG", "GIF", "WebP"],
  },
  compress: {
    maxFileSizeMB: 20,
    acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
    formats: ["JPG", "PNG", "WebP"],
  },
  convert: {
    maxFileSizeMB: 20,
    acceptedTypes: ACCEPTED_TYPES_ALL,
    formats: ["JPG", "PNG", "GIF", "WebP"],
  },
  upscale: {
    maxFileSizeMB: 10,
    acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
    formats: ["JPG", "PNG", "WebP"],
  },
};

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  tool?: string;
}

export function UploadZone({
  onFileSelect,
  disabled,
  tool = "resize",
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = TOOL_CONFIG[tool] ?? TOOL_CONFIG.resize;
  const MAX_FILE_SIZE = config.maxFileSizeMB * 1024 * 1024;

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      if (!config.acceptedTypes.includes(file.type)) {
        setError(`Invalid file type. Upload ${config.formats.join(", ")}.`);
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large. Maximum size is ${config.maxFileSizeMB}MB.`);
        return false;
      }

      return true;
    },
    [config, MAX_FILE_SIZE]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelect(file);
      }
    },
    [validateFile, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative flex min-h-80 flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed p-10 transition-all duration-300",
          isDragOver
            ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.12)]"
            : "border-white/10 bg-white/3 hover:border-white/25 hover:bg-white/5 hover:shadow-[0_0_30px_rgba(255,255,255,0.03)]",
          disabled && "cursor-not-allowed opacity-50",
          !disabled && "cursor-pointer"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={config.acceptedTypes.join(",")}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Icon container */}
        <div
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300",
            isDragOver
              ? "bg-cyan-500/20 text-cyan-400 scale-110"
              : "bg-white/5 text-white/30"
          )}
        >
          {isDragOver ? (
            <ImageIcon className="h-9 w-9" />
          ) : (
            <Upload className="h-9 w-9" />
          )}
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-white/70">
            {isDragOver ? (
              <span className="text-cyan-400">Drop your image here</span>
            ) : (
              <>
                <span className="text-cyan-400">Click to upload</span> or drag
                and drop
              </>
            )}
          </p>
          <p className="text-sm text-white/30">
            {config.formats.join(", ")} — up to {config.maxFileSizeMB} MB
          </p>
        </div>

        {/* Format badges */}
        <div className="flex items-center gap-2">
          {config.formats.map((fmt) => (
            <span
              key={fmt}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/30"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          <X className="h-4 w-4 shrink-0" />
          {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-6 w-6 p-0 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            onClick={() => setError(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
