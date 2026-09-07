import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

import { FumadocsProvider } from "@/components/providers/fumadocs-provider";
import { MobileNavClose } from "@/components/common/mobile-nav-close";
import { Analytics } from "@vercel/analytics/next";

import { links } from "@/constants/links";
import { SessionProvider } from "@/components/auth/session-provider";
import { Toaster } from "sonner";
import { PWAMeta, PWAProvider } from "@/components/pwa/pwa-provider";
import { initPerformanceMonitoring } from "@/lib/web-vitals";
import { Web3Provider } from "@/components/providers/web3-provider";
import "./global.css";

import { inter } from "@/lib/fonts";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || links.home;

// Initialize performance monitoring
if (typeof window !== "undefined") {
  initPerformanceMonitoring();
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Role Reactor - Discord Bot for Automated Role Management",
    template: "%s | Role Reactor",
  },
  description:
    "Role Reactor — Discord bot for reaction roles, XP levels, welcome system, temp roles & server automation. Free, powerful & easy to set up.",
  keywords: [
    "role reactor",
    "role reactor bot",
    "discord bot",
    "discord bots",
    "discord bot for roles",
    "role management discord bot",
    "discord roles bot",
    "reaction roles discord",
    "discord automation",
    "discord server management",
    "role assignment",
    "discord permissions",
    "server moderation",
    "discord utilities",
    "self assign roles",
    "emoji roles",
    "discord role bot",
    "free discord bot",
    "discord bot list",
    "discord xp bot",
    "discord leveling bot",
    "discord level bot",
    "discord xp leveling system",
    "discord rank card bot",
    "discord leaderboard bot",
    "discord welcome bot",
    "discord welcome message bot",
    "discord goodbye message",
    "discord temporary roles",
    "temp roles discord",
    "discord scheduled roles",
    "discord poll bot",
    "discord polls",
    "discord voice roles",
    "discord live reactor",
    "twitch discord bot",
    "twitch stream alerts discord",
    "discord image bot",
    "discord rank card",
    "discord community bot",
  ],
  authors: [{ name: "rolereactor" }],
  creator: "rolereactor",
  publisher: "rolereactor",
  category: "Technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "Role Reactor - Discord Bot for Role Management",
    description:
      "Role Reactor is a powerful Discord bot for automated role management. Set up reaction roles instantly, manage permissions, and enhance your Discord server experience.",
    siteName: "Role Reactor",
    images: [
      {
        url: `${baseUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: "Role Reactor - Discord Bot for Role Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Role Reactor - Discord Bot for Role Management",
    description:
      "Role Reactor is a powerful Discord bot for automated role management. Set up reaction roles instantly, manage permissions, and enhance your Discord server experience.",
    images: [`${baseUrl}/og.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: "/images/favicon/favicon.ico" },
      {
        url: "/images/favicon/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/images/favicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [{ url: "/images/favicon/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/images/favicon/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Role Reactor",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={inter.className}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        className="flex flex-col min-h-screen antialiased"
        suppressHydrationWarning
      >
        <MobileNavClose />
        <PWAMeta />
        <PWAProvider />
        <SessionProvider>
          <Web3Provider>
            <FumadocsProvider>
              {children}
              <Toaster
                position="top-center"
                expand={false}
                theme="dark"
                className="toaster group"
                toastOptions={{
                  unstyled: true,
                  classNames: {
                    toast: "w-full flex justify-center",
                  },
                }}
              />
            </FumadocsProvider>
          </Web3Provider>
        </SessionProvider>
        {/* Only load analytics in production to prevent development errors */}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
