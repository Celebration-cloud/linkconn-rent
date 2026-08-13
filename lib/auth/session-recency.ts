export const FRESH_AUTH_MAX_AGE_MS = 15 * 60 * 1000;

export function isFreshAuthentication(
  session: { createdAt: Date | string } | null | undefined,
  now = new Date(),
  maximumAgeMs = FRESH_AUTH_MAX_AGE_MS,
) {
  if (!session) return false;
  const createdAt = new Date(session.createdAt).getTime();
  const age = now.getTime() - createdAt;
  return Number.isFinite(createdAt) && age >= 0 && age <= maximumAgeMs;
}
