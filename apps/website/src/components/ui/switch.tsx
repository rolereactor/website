"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const switchVariants = cva(
  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-zinc-800 hover:data-[state=unchecked]:bg-zinc-700",
  {
    variants: {
      variant: {
        default:
          "data-[state=checked]:bg-cyan-500 data-[state=checked]:shadow-[0_0_15px_rgba(6,182,212,0.6)] focus-visible:ring-cyan-500/50",
        cyan: "data-[state=checked]:bg-cyan-500 data-[state=checked]:shadow-[0_0_15px_rgba(6,182,212,0.6)] focus-visible:ring-cyan-500/50",
        amber:
          "data-[state=checked]:bg-amber-500 data-[state=checked]:shadow-[0_0_15px_rgba(245,158,11,0.6)] focus-visible:ring-amber-500/50",
        emerald:
          "data-[state=checked]:bg-emerald-500 data-[state=checked]:shadow-[0_0_15px_rgba(16,185,129,0.6)] focus-visible:ring-emerald-500/50",
        purple:
          "data-[state=checked]:bg-purple-500 data-[state=checked]:shadow-[0_0_15px_rgba(168,85,247,0.6)] focus-visible:ring-purple-500/50",
        pink: "data-[state=checked]:bg-pink-500 data-[state=checked]:shadow-[0_0_15px_rgba(236,72,153,0.6)] focus-visible:ring-pink-500/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> &
    VariantProps<typeof switchVariants>
>(({ className, variant, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(switchVariants({ variant, className }))}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
