"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

import { useGlitchSound } from "@/hooks/use-glitch-sound";

import { cva, type VariantProps } from "class-variance-authority";

const dialogContentVariants = cva(
  "fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] sm:w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl overflow-hidden shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
  {
    variants: {
      variant: {
        default:
          "border bg-zinc-950/95 p-6 backdrop-blur-2xl border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/5 dialog-glitch-animation",
        glitch:
          "p-0 bg-transparent shadow-none dialog-glitch-advanced border-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface DialogContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  hideClose?: boolean;
  innerClassName?: string;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    { className, children, hideClose, variant, innerClassName, ...props },
    ref
  ) => {
    const { playIn, playOut } = useGlitchSound();
    const internalRef = React.useRef<HTMLDivElement>(null);

    // Sync ref
    React.useImperativeHandle(ref, () => internalRef.current!);

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={internalRef}
          onAnimationStart={(e) => {
            if (e.target === e.currentTarget) {
              const dataState = (e.target as HTMLElement).getAttribute(
                "data-state"
              );

              // Trigger entry sound on opening animations
              if (
                dataState === "open" &&
                (e.animationName.includes("dialogGlitchIn") ||
                  e.animationName.includes("rgbSplit") ||
                  // Trigger for default animation if set
                  e.animationName.includes("fade-in") ||
                  e.animationName.includes("zoom-in"))
              ) {
                playIn();
              }

              // Trigger exit sound on closing animations
              if (
                dataState === "closed" &&
                (e.animationName.includes("dialogGlitchOut") ||
                  e.animationName.includes("fade-out") ||
                  e.animationName.includes("glitch-explosion") ||
                  e.animationName.includes("rgbSplit") ||
                  e.animationName.includes("zoom-out"))
              ) {
                playOut();
              }
            }
            props.onAnimationStart?.(e);
          }}
          className={cn(dialogContentVariants({ variant, className }))}
          {...props}
        >
          {variant === "glitch" ? (
            <div
              className={cn(
                "dialog-inner-content relative h-full w-full bg-zinc-950/90 border border-white/10 shadow-[0_0_50px_-12px_rgba(6,182,212,0.25)] p-0 rounded-2xl overflow-hidden backdrop-blur-2xl ring-1 ring-white/5",
                innerClassName
              )}
            >
              {children}
              {!hideClose && (
                <DialogPrimitive.Close className="absolute right-5 top-5 w-9 h-9 flex items-center justify-center rounded-xl opacity-70 bg-zinc-900 border border-white/10 transition-all hover:opacity-100 hover:bg-zinc-800 hover:border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:pointer-events-none text-zinc-400 hover:text-white hover:shadow-[0_0_10px_-2px_rgba(6,182,212,0.3)] z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-500">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </div>
          ) : (
            <>
              {children}
              {!hideClose && (
                <DialogPrimitive.Close className="absolute right-5 top-5 w-9 h-9 flex items-center justify-center rounded-xl opacity-70 bg-zinc-900 border border-white/10 transition-all hover:opacity-100 hover:bg-zinc-800 hover:border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:pointer-events-none text-zinc-400 hover:text-white hover:shadow-[0_0_10px_-2px_rgba(6,182,212,0.3)] z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-500">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const dialogTitleVariants = cva(
  "text-lg font-semibold leading-none tracking-tight",
  {
    variants: {
      variant: {
        default: "",
        glitch: "text-cyan-400 font-mono uppercase tracking-widest text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface DialogTitleProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>,
    VariantProps<typeof dialogTitleVariants> {}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(dialogTitleVariants({ variant, className }))}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const dialogDescriptionVariants = cva("text-sm text-muted-foreground", {
  variants: {
    variant: {
      default: "",
      glitch: "text-cyan-500/70 font-mono text-xs",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface DialogDescriptionProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>,
    VariantProps<typeof dialogDescriptionVariants> {}

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(dialogDescriptionVariants({ variant, className }))}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
