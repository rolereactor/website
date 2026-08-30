import { toast as sonnerToast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { audiowide } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning" | "loading";

interface ToastProps {
  title?: string;
  description?: string;
  type?: ToastType;
}

const getIcon = (type: ToastType) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-4 w-4" />;
    case "error":
      return <AlertCircle className="h-4 w-4" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4" />;
    case "info":
      return <Info className="h-4 w-4" />;
    case "loading":
      return <Loader2 className="h-4 w-4 animate-spin" />;
    default:
      return null;
  }
};

const getTitle = (type: ToastType) => {
  switch (type) {
    case "success":
      return "SUCCESS";
    case "error":
      return "CRITICAL ERROR";
    case "warning":
      return "SYSTEM WARNING";
    case "info":
      return "INFORMATION";
    case "loading":
      return "PROCESSING";
    default:
      return "NOTIFICATION";
  }
};

const CustomToast = ({ title, description, type = "info" }: ToastProps) => {
  const variant =
    type === "loading"
      ? "info"
      : type === "warning"
        ? "warning"
        : type === "error"
          ? "error"
          : type === "success"
            ? "success"
            : "info";

  return (
    <Alert
      variant={variant}
      className="border-white/5 backdrop-blur-2xl shadow-2xl min-w-80 max-w-105"
    >
      {getIcon(type)}
      <AlertTitle className={cn(audiowide.className, "tracking-[0.2em]")}>
        {title || getTitle(type)}
      </AlertTitle>
      {description && (
        <AlertDescription className="font-medium">
          {description}
        </AlertDescription>
      )}
    </Alert>
  );
};

interface ToastOptions {
  id?: string | number;
  duration?: number;
  onDismiss?: () => void;
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.custom(
      () => <CustomToast type="success" description={message} />,
      options
    );
  },
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.custom(
      () => <CustomToast type="error" description={message} />,
      options
    );
  },
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.custom(
      () => <CustomToast type="info" description={message} />,
      options
    );
  },
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.custom(
      () => <CustomToast type="warning" description={message} />,
      options
    );
  },
  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.custom(
      () => <CustomToast type="loading" description={message} />,
      options
    );
  },
  // Allow custom titles/descriptions
  custom: (props: ToastProps, options?: ToastOptions) => {
    return sonnerToast.custom(() => <CustomToast {...props} />, options);
  },
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};
