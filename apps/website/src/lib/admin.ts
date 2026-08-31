/**
 * Admin utility functions
 */

import type { User } from "next-auth";

/**
 * Extended user type with role information
 */
export interface ExtendedUser extends Omit<User, "id"> {
  id: string | null;
  role?: string;
}

export interface ExtendedSession {
  user?: ExtendedUser;
}

/**
 * User Roles constants matching the bot backend
 */
export const UserRoles = {
  USER: "user", // Standard user
  SUPPORT: "support", // Access to stats and logs
  ADMIN: "admin", // Partial management
  OWNER: "owner", // Full system access
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

/**
 * Checks if a user has administrative access to the global bot dashboard.
 *
 * @param user The user object from the session (must include id and role)
 * @returns true if the user is a developer/admin
 */
export function isDeveloper(user?: ExtendedUser | null): boolean {
  if (!user?.id) return false;

  // 1. Root IDs always have access (server-side env vars only)
  const botDevIds = process.env.DISCORD_DEVELOPERS ?? "";

  const rootIds = botDevIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (rootIds.includes(user.id)) return true;

  // 2. Roles: Support, Admin, and Owner roles count as developers in the UI
  const devRoles: UserRole[] = [
    UserRoles.SUPPORT,
    UserRoles.ADMIN,
    UserRoles.OWNER,
  ];
  if (user.role && devRoles.includes(user.role as UserRole)) return true;

  return false;
}

/**
 * Higher-level role check
 */
export function hasRole(
  userRole: UserRole | undefined,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false;

  const roleHierarchy: Record<UserRole, number> = {
    [UserRoles.USER]: 0,
    [UserRoles.SUPPORT]: 1,
    [UserRoles.ADMIN]: 2,
    [UserRoles.OWNER]: 3,
  };

  const userLevel = roleHierarchy[userRole] ?? 0;
  const requiredLevel = roleHierarchy[requiredRole] ?? 0;

  return userLevel >= requiredLevel;
}
