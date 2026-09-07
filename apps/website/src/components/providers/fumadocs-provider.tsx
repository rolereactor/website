"use client";

import { usePathname } from "next/navigation";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";

export function FumadocsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <RootProvider
      search={
        isDashboard
          ? { enabled: false }
          : {
              enabled: true,
              options: {
                api: "/api/search",
              },
            }
      }
      theme={{
        defaultTheme: "dark",
        forcedTheme: "dark",
        attribute: "class",
        enableSystem: false,
      }}
    >
      {children}
    </RootProvider>
  );
}
