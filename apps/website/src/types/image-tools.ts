import { z } from "zod";

// Tool names
export const ImageToolName = z.enum([
  "resize",
  "compress",
  "convert",
  "upscale",
]);
export type ImageToolName = z.infer<typeof ImageToolName>;

// Resize options
export const ResizeOptions = z.object({
  width: z.number().int().min(1).max(10000).optional(),
  height: z.number().int().min(1).max(10000).optional(),
  percentage: z.number().int().min(1).max(1000).optional(),
  maintainRatio: z.boolean().default(true),
  noEnlargeIfSmall: z.boolean().default(true),
});

// Compress options
export const CompressOptions = z.object({
  level: z.enum(["extreme", "recommended", "low"]).default("recommended"),
});

// Convert options
export const ConvertOptions = z.object({
  to: z.enum(["jpg", "png", "gif", "webp"]).default("jpg"),
});

// Upscale options
export const UpscaleOptions = z.object({
  multiplier: z.enum(["2", "4"]).default("2"),
});

// Union of all tool options
export const ImageToolOptions = z.discriminatedUnion("tool", [
  z.object({ tool: z.literal("resize"), options: ResizeOptions }),
  z.object({ tool: z.literal("compress"), options: CompressOptions }),
  z.object({ tool: z.literal("convert"), options: ConvertOptions }),
  z.object({ tool: z.literal("upscale"), options: UpscaleOptions }),
]);

// Tool config (from bot API)
export const ImageToolConfig = z.object({
  name: z.string(),
  description: z.string(),
  userCores: z.number(),
  allowedTypes: z.array(z.string()),
  maxFileSizeMB: z.number(),
});

export const ImageToolsConfigResponse = z.object({
  status: z.literal("success"),
  tools: z.record(ImageToolName, ImageToolConfig),
  timestamp: z.string(),
});

// Tool metadata for UI
export const IMAGE_TOOL_META: Record<
  ImageToolName,
  { label: string; description: string; icon: string }
> = {
  resize: {
    label: "Resize",
    description: "Change image dimensions by pixels or percentage",
    icon: "Maximize",
  },
  compress: {
    label: "Compress",
    description: "Reduce file size while maintaining quality",
    icon: "Minimize2",
  },
  convert: {
    label: "Convert",
    description: "Convert between JPG, PNG, GIF, and WebP formats",
    icon: "ArrowRightLeft",
  },
  upscale: {
    label: "Upscale",
    description: "Increase resolution with AI upscaling",
    icon: "Sparkles",
  },
};
