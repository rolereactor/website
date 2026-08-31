import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { env } from "@/lib/env";
import { botFetchJson } from "@/lib/bot-fetch";

const discordClientId = env.DISCORD_CLIENT_ID;
const discordClientSecret = env.DISCORD_CLIENT_SECRET;
const authSecret = env.AUTH_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord({
      clientId: discordClientId,
      clientSecret: discordClientSecret,
      authorization: {
        params: {
          scope: "identify email guilds",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id ?? token.sub ?? "";

        // Use cached role from JWT to avoid per-request bot API calls
        session.user.role = (token.userRole as string) ?? "user";

        if (token.accessToken) {
          session.accessToken = token.accessToken;
        }

        if (token.picture) {
          session.user.image = token.picture;
        } else if (token.id || token.sub) {
          const discordId = token.id ?? token.sub ?? "0";
          session.user.image = `https://cdn.discordapp.com/embed/avatars/${
            Number(discordId) % 5
          }.png`;
        }
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile?.id) {
        token.id = profile.id;

        try {
          const userData = await botFetchJson<{ id: string; role: string }>(
            `/user/${profile.id}`,
            { silent: true }
          );
          // Cache role in JWT to avoid per-request lookups
          token.userRole = userData.role ?? "user";

          await botFetchJson("/user/sync", {
            method: "POST",
            userId: profile.id,
            body: JSON.stringify({
              id: profile.id,
              username: profile.username ?? profile.name,
              globalName: profile.global_name ?? profile.name,
              avatar: profile.avatar,
              email: profile.email,
              accessToken: account?.access_token,
              refreshToken: account?.refresh_token,
            }),
          });
        } catch (error) {
          console.error(
            `[Auth] Failed to sync user ${profile.id} with bot:`,
            error
          );
          token.userRole = "user";
        }

        const avatar = profile.avatar;
        if (avatar && typeof avatar === "string") {
          const avatarFormat = avatar.startsWith("a_") ? "gif" : "png";
          token.picture = `https://cdn.discordapp.com/avatars/${profile.id}/${avatar}.${avatarFormat}`;
        } else {
          token.picture = `https://cdn.discordapp.com/embed/avatars/${
            Number(profile.id) % 5
          }.png`;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: authSecret,
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
});
