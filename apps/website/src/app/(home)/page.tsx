import { Hero } from "@/app/(home)/_components/hero";
import { Features } from "@/app/(home)/_components/features";
import { SocialProof } from "@/app/(home)/_components/social-proof";
import { FooterCTA } from "@/app/(home)/_components/footer-cta";
import { ConditionalAdBlock } from "@/components/propellerads";
import { links } from "@/constants/links";
import { botFetchJson } from "@/lib/bot-fetch";

interface UsageData {
  summary?: {
    totalExecutions?: number;
    totalCommands?: number;
  };
}

interface StatsData {
  statistics?: {
    guilds?: number;
  };
}

export default async function HomePage() {
  // Fetch command usage and stats from the bot API
  let totalExecutions = 0;
  let totalGuilds = 0;
  let totalCommands = 0;
  try {
    const [usageData, statsData] = await Promise.all([
      botFetchJson<UsageData>("/commands/usage", {
        next: { revalidate: 3600 },
      }),
      botFetchJson<StatsData>("/stats", {
        next: { revalidate: 3600 },
      }),
    ]);
    totalExecutions = usageData.summary?.totalExecutions || 0;
    totalGuilds = statsData.statistics?.guilds || 0;
    totalCommands = usageData.summary?.totalCommands || 0;
  } catch (error) {
    console.error("Failed to fetch stats:", error);
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Role Reactor Bot",
    description:
      "A comprehensive Discord bot for self-assignable roles through reactions. Features temporary roles, scheduled assignments, welcome/goodbye systems, XP tracking, poll system, voice permissions, and more.",
    url: links.home,
    applicationCategory: "Discord Bot",
    operatingSystem: "Discord",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "rolereactor",
      email: "tyecoder@gmail.com",
      url: "https://github.com/rolereactor",
    },
    featureList: [
      "Self-assignable roles through reactions",
      "Temporary roles with auto-expiration",
      "Scheduled role assignments (one-time and recurring)",
      "Welcome system with customizable messages",
      "Goodbye system with customizable placeholders",
      "XP system with levels and leaderboards",
      "Interactive poll system",
      "Voice channel permission enforcement",
      "Role categories and organization",
      "Custom emoji support",
      "Bulk operations for role management",
    ],
    keywords:
      "discord bot, discord bots, role management, reaction roles, temporary roles, scheduled roles, welcome system, goodbye system, XP system, poll system, discord role bot, easy setup, community management, server roles",
    applicationSubCategory: "Role Management Bot",
    downloadUrl: links.inviteBot,
    installUrl: links.inviteBot,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen">
        <Hero />
        <div className="max-w-5xl mx-auto px-4">
          <div className="h-px bg-linear-to-r from-transparent via-white/6 to-transparent" />
        </div>
        <Features />
        <div className="max-w-5xl mx-auto px-4">
          <div className="h-px bg-linear-to-r from-transparent via-white/6 to-transparent" />
        </div>
        <div className="max-w-fd-container mx-auto px-4">
          <ConditionalAdBlock
            zoneId={process.env.NEXT_PUBLIC_PROPELLERADS_HOME_ZONE || ""}
            className="mb-8"
          />
        </div>
        <SocialProof
          totalExecutions={totalExecutions}
          totalGuilds={totalGuilds}
          totalCommands={totalCommands}
        />
        <div className="max-w-5xl mx-auto px-4">
          <div className="h-px bg-linear-to-r from-transparent via-white/6 to-transparent" />
        </div>
        <FooterCTA />
      </main>
    </>
  );
}
