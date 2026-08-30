import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { Audiowide } from "next/font/google";
import { useUiSound } from "@/hooks/use-ui-sound";

import { cn } from "@/lib/utils";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const alertVariants = cva(
  "relative w-full border p-4 [&>svg~*]:pl-7 [&>svg+h5]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 backdrop-blur-xl overflow-hidden transition-all duration-500 rounded-lg",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-950/90 text-zinc-100 border-zinc-500/20 shadow-[0_0_20px_-12px_rgba(255,255,255,0.1)] [&>svg]:text-zinc-400",
        info: "bg-cyan-950/30 text-cyan-100 border-cyan-500/30 shadow-[0_0_20px_-12px_rgba(6,182,212,0.3)] [&>svg]:text-cyan-400",
        success:
          "bg-emerald-950/30 text-emerald-100 border-emerald-500/30 shadow-[0_0_20px_-12px_rgba(16,185,129,0.3)] [&>svg]:text-emerald-400",
        warning:
          "bg-amber-950/30 text-amber-100 border-amber-500/30 shadow-[0_0_20px_-12px_rgba(245,158,11,0.3)] [&>svg]:text-amber-400",
        error:
          "bg-red-950/30 text-red-100 border-red-500/40 shadow-[0_0_30px_-12px_rgba(239,68,68,0.4)] [&>svg]:text-red-400 animate-tv-flicker",
        glitch:
          "bg-black/90 text-cyan-400 border-cyan-500/50 shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)] [&>svg]:text-cyan-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const AlertContext = React.createContext<{
  variant?: VariantProps<typeof alertVariants>["variant"];
}>({});

interface AlertProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  onClose?: () => void;
  autoClose?: number;
}

const TechDecorations = ({ variant }: { variant?: string | null }) => {
  const styles = {
    default: {
      gradient: "via-zinc-500/50",
      corner: "border-zinc-500/30",
    },
    info: {
      gradient: "via-cyan-500/50",
      corner: "border-cyan-500/50",
    },
    success: {
      gradient: "via-emerald-500/50",
      corner: "border-emerald-500/50",
    },
    warning: {
      gradient: "via-amber-500/50",
      corner: "border-amber-500/50",
    },
    error: {
      gradient: "via-red-500/50",
      corner: "border-red-500/50",
    },
    glitch: {
      gradient: "via-cyan-400/50",
      corner: "border-cyan-400/80",
    },
  };

  // Safe fallback
  const activeStyle = styles[variant as keyof typeof styles] || styles.default;

  return (
    <>
      {/* Bottom Gradient Line */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent ${activeStyle.gradient} to-transparent opacity-50`}
      />

      {/* Top Right Corner Accent */}
      <div
        className={`absolute -top-px -right-px w-3 h-3 border-t border-r ${activeStyle.corner}`}
      />

      {/* Bottom Left Corner Accent */}
      <div
        className={`absolute -bottom-px -left-px w-3 h-3 border-b border-l ${activeStyle.corner}`}
      />
    </>
  );
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    { className, variant = "default", onClose, autoClose, children, ...props },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const [isClosing, setIsClosing] = React.useState(false);
    const { play, playSwitch } = useUiSound();

    const handleClose = React.useCallback(() => {
      setIsClosing(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 350);
    }, [onClose]);

    React.useEffect(() => {
      if (autoClose) {
        const timer = setTimeout(handleClose, autoClose);
        return () => clearTimeout(timer);
      }
    }, [autoClose, handleClose]);

    if (!isVisible) return null;

    return (
      <AlertContext.Provider value={{ variant }}>
        <div
          ref={ref}
          role="alert"
          data-state={isClosing ? "closed" : "open"}
          onAnimationStart={(e) => {
            if (e.target === e.currentTarget) {
              const dataState = (e.target as HTMLElement).getAttribute(
                "data-state"
              );

              if (
                dataState === "open" &&
                (e.animationName.includes("dialogGlitchIn") ||
                  e.animationName.includes("rgbSplit"))
              ) {
                // Dynamic sound based on variant
                switch (variant) {
                  case "error":
                    play("beep-electric-4", 0.5); // Harsh error tone
                    break;
                  case "glitch":
                    play("glitch-in", 0.5);
                    break;
                  case "warning":
                    play("beep-electric-2", 0.4);
                    break;
                  case "success":
                    play("confirm", 0.4);
                    break;
                  default:
                    play("readout-beep", 0.2); // Subtle readout for info/default
                    break;
                }
              }

              if (dataState === "closed") {
                playSwitch();
              }
            }
            props.onAnimationStart?.(e);
          }}
          className={cn(
            alertVariants({ variant }),
            "alert-glitch-animation group",
            className
          )}
          {...props}
        >
          <TechDecorations variant={variant} />
          {children}
          {onClose && (
            <button
              onClick={handleClose}
              className="absolute right-2 top-2 p-1 rounded-sm opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          )}
        </div>
      </AlertContext.Provider>
    );
  }
);
Alert.displayName = "Alert";

const alertTitleVariants = cva(
  "mb-1 font-bold leading-none tracking-wide text-sm uppercase",
  {
    variants: {
      variant: {
        default: "text-zinc-100",
        info: "text-cyan-400",
        success: "text-emerald-400",
        warning: "text-amber-400",
        error: "text-red-400",
        glitch: "text-cyan-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> &
    VariantProps<typeof alertTitleVariants>
>(({ className, variant: propsVariant, ...props }, ref) => {
  const { variant: contextVariant } = React.useContext(AlertContext);
  const variant = propsVariant || contextVariant;

  return (
    <h5
      ref={ref}
      className={cn(
        audiowide.className,
        alertTitleVariants({ variant, className })
      )}
      {...props}
    />
  );
});
AlertTitle.displayName = "AlertTitle";

const alertDescriptionVariants = cva(
  "text-xs [&_p]:leading-relaxed font-medium",
  {
    variants: {
      variant: {
        default: "text-zinc-400",
        info: "text-cyan-200/80",
        success: "text-emerald-200/80",
        warning: "text-amber-200/80",
        error: "text-red-200/80",
        glitch:
          "text-cyan-500/70 font-mono text-[10px] uppercase leading-tight tracking-wide",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> &
    VariantProps<typeof alertDescriptionVariants>
>(({ className, variant: propsVariant, ...props }, ref) => {
  const { variant: contextVariant } = React.useContext(AlertContext);
  const variant = propsVariant || contextVariant;

  return (
    <div
      ref={ref}
      className={cn(alertDescriptionVariants({ variant, className }))}
      {...props}
    />
  );
});
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
