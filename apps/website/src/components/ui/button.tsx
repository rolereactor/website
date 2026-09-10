import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black hover:bg-cyan-50 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.6)] font-bold uppercase tracking-wide text-xs relative overflow-hidden group/btn",
        destructive:
          "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 hover:text-red-400 hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.5)] font-semibold uppercase tracking-wide text-xs backdrop-blur-sm",
        outline:
          "border border-white/20 bg-black/40 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-cyan-500/50 hover:shadow-[0_0_15px_-5px_rgba(6,182,212,0.3)] uppercase tracking-wide font-semibold text-xs backdrop-blur-sm",
        secondary:
          "bg-zinc-900 text-zinc-300 border border-white/10 hover:border-white/30 hover:text-white hover:bg-zinc-800 font-semibold uppercase tracking-wide text-xs",
        ghost:
          "text-zinc-500 hover:text-white hover:bg-white/5 uppercase tracking-wide font-semibold text-xs",
        link: "text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] uppercase tracking-wide font-bold text-xs",
        // Specialized Cyberpunk variants
        glitch:
          "bg-white text-black hover:bg-cyan-50 font-bold uppercase tracking-wide text-xs border border-white/20 hover-glitch shadow-[0_0_15px_-5px_rgba(6,182,212,0.5)] rounded-lg",
        neon: "border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] font-bold uppercase tracking-wide text-xs backdrop-blur-sm hover:text-cyan-400 rounded-lg",
        "ghost-glow":
          "text-zinc-400 hover:text-white hover:bg-zinc-800/50 hover:shadow-[0_0_15px_-5px_rgba(255,255,255,0.2)] rounded-lg text-xs uppercase tracking-wide font-semibold",
        "destructive-glitch":
          "text-red-500 hover:text-red-400 hover:bg-red-950/30 hover:shadow-[0_0_15px_-5px_rgba(239,68,68,0.4)] font-mono tracking-wide hover-glitch border border-red-900/0 hover:border-red-500/30 rounded-lg text-xs uppercase",
        cyber:
          "bg-cyan-500 text-black font-bold uppercase tracking-wide text-xs hover:bg-cyan-400 hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.6)] rounded-lg shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]",
        premium:
          "bg-amber-500 text-black font-bold uppercase tracking-wide text-xs hover:bg-amber-400 hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.6)] rounded-lg shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)]",
        discord:
          "bg-[#5865F2] text-white font-bold uppercase tracking-wide text-xs hover:bg-[#4752C4] hover:shadow-[0_0_25px_-5px_rgba(88,101,242,0.6)] rounded-lg shadow-[0_0_15px_-3px_rgba(88,101,242,0.4)]",
        plasma:
          "bg-purple-500 text-white font-bold uppercase tracking-wide text-xs hover:bg-purple-400 hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.6)] rounded-lg shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]",
      },
      size: {
        default: "h-9 md:h-10 px-3 md:px-4 py-2",
        sm: "h-8 md:h-9 rounded-lg px-2 md:px-3",
        lg: "h-10 md:h-11 rounded-lg px-6 md:px-8",
        icon: "h-9 w-9 md:h-10 md:w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
