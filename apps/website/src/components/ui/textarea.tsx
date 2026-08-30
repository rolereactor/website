"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex min-h-20 w-full border bg-zinc-900/40 text-sm text-white ring-offset-zinc-950 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "rounded-lg border-white/10 px-3 py-2 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 hover:border-white/20 hover:bg-zinc-900/60",
        cyber:
          "rounded-lg border-white/5 bg-zinc-950/80 px-4 py-3 focus-visible:border-cyan-500/40 focus-visible:ring-cyan-500/10 hover:bg-zinc-900/80 font-mono tracking-tight",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface TextareaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
