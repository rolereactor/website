"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/common/error-view";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <ErrorView
        title="Fatal Exception"
        message="The system experienced a core exception. Safe mode has been initialized to protect your session."
        errorId={error.digest}
        onRetry={reset}
        showHome={true}
      />
    </div>
  );
}
