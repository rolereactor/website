/**
 * Shared API validation utilities
 */

const SNOWFLAKE_REGEX = /^\d{17,20}$/;

/**
 * Validate a Discord snowflake ID (guild, user, channel, etc.)
 */
export function isValidSnowflake(id: string | null | undefined): id is string {
  return !!id && SNOWFLAKE_REGEX.test(id);
}

/**
 * Clamp a numeric query param to a safe range
 */
export function clampQueryParam(
  value: string | null,
  min: number,
  max: number,
  defaultValue: number
): number {
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitize a search query string (strip special chars, limit length)
 */
export function sanitizeSearchQuery(
  query: string | null,
  maxLength = 100
): string {
  if (!query) return "";
  return query.slice(0, maxLength).replace(/[<>"'`;]/g, "");
}
