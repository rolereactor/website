import { z } from "zod";

/**
 * Discord API Schemas
 */

export const DiscordGuildSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable().optional().default("Unknown Server"),
    icon: z.string().nullable().optional(),
    permissions: z.union([z.string(), z.number(), z.null()]).optional(),
  })
  .catchall(z.unknown());

export const DiscordChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.number(),
});

export const DiscordRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.number(),
  managed: z.boolean(),
  position: z.number().optional(),
  permissions: z.string().optional(),
});

/**
 * XP & Leaderboard Schemas
 */

export const LeaderboardEntrySchema = z.object({
  userId: z.string(),
  totalXP: z.number(),
  dailyXP: z.number().optional(),
  weeklyXP: z.number().optional(),
  monthlyXP: z.number().optional(),
  level: z.number(),
  user: z.object({
    username: z.string(),
    discriminator: z.string(),
    avatar: z.string().nullable(),
    bot: z.boolean(),
  }),
  rankInfo: z
    .object({
      title: z.string(),
      emoji: z.string(),
      color: z.number(),
      minLevel: z.number(),
    })
    .optional(),
});

export const XPSettingsSchema = z
  .object({
    enabled: z.boolean(),
    messageXP: z.boolean(),
    commandXP: z.boolean(),
    roleXP: z.boolean(),
    voiceXP: z.boolean(),
    messageXPAmount: z.any().optional(),
    roleXPAmount: z.number().optional().catch(0),
    commandXPAmount: z.any().optional(),
    voiceXPAmount: z.any().optional(),
    messageCooldown: z.number().optional().catch(60),
    commandCooldown: z.number().optional().catch(60),
    levelUpMessages: z.boolean(),
    levelUpChannel: z.string().nullable().optional(),
    publicLeaderboard: z.boolean().optional().catch(true),
  })
  .catchall(z.unknown());

/**
 * Pro Engine & Subscription Schemas
 */

export const ProSubscriptionSchema = z.object({
  expiresAt: z.string().nullable().optional(),
  activatedAt: z.string().nullable().optional(),
  cancelled: z.boolean().nullable().optional(),
  cancelledAt: z.string().nullable().optional(),
  autoRenew: z.boolean().nullable().optional(),
  cost: z.number().nullable().optional(),
  period: z.string().nullable().optional(),
  payerUserId: z.string().nullable().optional(),
  lastDeductionDate: z.string().nullable().optional(),
  isTrial: z.boolean().nullable().optional(),
  trialEndsAt: z.string().nullable().optional(),
  trialUsed: z.boolean().nullable().optional(),
});

export const ProEngineSettingsSchema = z
  .object({
    status: z.string().optional(),
    isPremium: z
      .object({
        pro: z.boolean(),
      })
      .catchall(z.boolean().optional()),
    subscription: ProSubscriptionSchema.nullable().optional(),
    premiumConfig: z
      .record(
        z.string(),
        z.object({
          cost: z.number(),
          period: z.string(),
          periodDays: z.number(),
        })
      )
      .optional(),
    settings: z
      .object({
        disabledCommands: z.array(z.string()).optional(),
        autoDeductFromOwner: z.boolean().optional(),
      })
      .catchall(z.unknown()),
    availableCommands: z
      .array(
        z
          .object({
            name: z.string(),
            description: z.string(),
            category: z.string().optional(),
          })
          .catchall(z.unknown())
      )
      .optional(),
  })
  .catchall(z.unknown());

/**
 * Pricing & User Schemas
 */

export const UserPricingInfoSchema = z.object({
  userId: z.string(),
  isFirstPurchase: z.boolean(),
  currentCredits: z.number(),
  eligibleForFirstPurchaseBonus: z.boolean(),
  hasActivePro: z.boolean().optional(),
});

/**
 * Admin Config Schemas
 */

export const BotConfigSchema = z.object({
  config: z
    .object({
      botInfo: z
        .object({
          name: z.string().optional(),
        })
        .optional(),
      discord: z.record(z.string(), z.unknown()).optional(),
      database: z.record(z.string(), z.unknown()).optional(),
      logging: z.record(z.string(), z.unknown()).optional(),
      features: z.record(z.string(), z.unknown()).optional(),
      aiSettings: z.record(z.string(), z.unknown()).optional(),
      rateLimits: z.record(z.string(), z.unknown()).optional(),
      cacheLimits: z.record(z.string(), z.unknown()).optional(),
      payments: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
  environment: z.string(),
  isProduction: z.boolean(),
});

export const PremiumStatusSchema = z
  .object({
    isPremium: z.any().optional(),
    subscription: z
      .object({
        activatedAt: z.string().nullable().optional(),
        expiresAt: z.string().nullable().optional(),
        autoRenew: z.boolean().nullable().optional(),
        isTrial: z.boolean().nullable().optional(),
        trialEndsAt: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .catchall(z.unknown());

/**
 * TypeScript Types
 */

export type DiscordGuild = z.infer<typeof DiscordGuildSchema>;
export type DiscordChannel = z.infer<typeof DiscordChannelSchema>;
export type DiscordRole = z.infer<typeof DiscordRoleSchema>;
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
export type XPSettings = z.infer<typeof XPSettingsSchema>;
export type ProSubscription = z.infer<typeof ProSubscriptionSchema>;
export type ProEngineSettings = z.infer<typeof ProEngineSettingsSchema>;
export type UserPricingInfo = z.infer<typeof UserPricingInfoSchema>;
export type BotConfig = z.infer<typeof BotConfigSchema>;
export type PremiumStatus = z.infer<typeof PremiumStatusSchema>;
