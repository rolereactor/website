"use client";

import { useRouter, usePathname } from "next/navigation";
import { Expand, Shrink, ArrowRightLeft, ImageUpscale } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ImageToolName } from "@/types/image-tools";

const TOOLS: {
  tool: ImageToolName;
  label: string;
  icon: React.ElementType;
  cost: number;
  premium?: boolean;
}[] = [
  { tool: "resize", label: "Resize Image", icon: Expand, cost: 0.5 },
  { tool: "compress", label: "Compress Image", icon: Shrink, cost: 0.5 },
  { tool: "convert", label: "Convert Image", icon: ArrowRightLeft, cost: 0.5 },
  {
    tool: "upscale",
    label: "Upscale Image",
    icon: ImageUpscale,
    cost: 5,
    premium: true,
  },
];

export function ToolNav() {
  const router = useRouter();
  const pathname = usePathname();

  const currentTool =
    TOOLS.find((t) => pathname.endsWith(`/image-tools/${t.tool}`))?.tool ??
    "resize";
  const current = TOOLS.find((t) => t.tool === currentTool)!;

  const handleChange = (tool: string) => {
    router.push(`/dashboard/image-tools/${tool}`);
  };

  return (
    <Select value={currentTool} onValueChange={handleChange}>
      <SelectTrigger
        variant="cyber"
        className={cn(
          "h-10 w-[calc(100%-4px)] xl:w-[336px] mx-0.5 gap-3 px-4 text-xs font-bold transition-all duration-200 focus:ring-offset-0 [&>svg:last-child]:shrink-0",
          current.premium
            ? "border-amber-500/30 text-amber-400 hover:border-amber-500/60 hover:bg-amber-500/5 data-[state=open]:border-amber-500/60 focus:border-amber-500/60 focus:ring-amber-500/20"
            : "border-cyan-500/30 text-cyan-400 hover:border-cyan-500/60 hover:bg-cyan-500/5 data-[state=open]:border-cyan-500/60 focus:border-cyan-500/60 focus:ring-cyan-500/20"
        )}
      >
        {/*
          We intentionally skip <SelectValue> here.
          Radix tracks the value via the `value` prop on <Select> — SelectValue
          is only for display. By rendering current.icon + current.label directly,
          we avoid the double-icon bug that occurs when SelectValue re-renders the
          full SelectItem JSX (icon + label + cost badge) into the trigger.
        */}
        <current.icon className="h-3.5 w-3.5 shrink-0" />
        <span className="whitespace-nowrap">{current.label}</span>
      </SelectTrigger>

      <SelectContent
        variant="cyber"
        align="end"
        className="w-[var(--radix-select-trigger-width)]"
      >
        {TOOLS.map(({ tool, label, icon: Icon, premium }) => (
          <SelectItem
            key={tool}
            value={tool}
            textValue={label}
            className={cn(
              "cursor-pointer py-3 font-bold uppercase tracking-widest text-[11px]",
              tool === currentTool
                ? premium
                  ? "text-amber-400 focus:bg-amber-500/10 focus:text-amber-400 bg-amber-500/5"
                  : "text-cyan-400 focus:bg-cyan-500/10 focus:text-cyan-400 bg-cyan-500/5"
                : "text-white/70 focus:bg-white/5 focus:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
