import type { AuthUser, Role, VerificationLevel } from "@/domain/types/auth";

type NeonSession = {
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
    phoneNumber?: string | null;
    phoneNumberVerified?: boolean | null;
    role?: string | null;
  };
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    impersonatedBy?: string | null;
    activeOrganizationId?: string | null;
  };
};

const ROLE_FALLBACK: Role = "Tenant";

function parseName(name: string) {
  const cleaned = name.trim().replace(/\s+/g, " ");
  if (!cleaned) return { firstName: "New", lastName: "User" };
  const [first, ...rest] = cleaned.split(" ");
  return {
    firstName: first || "New",
    lastName: rest.join(" ") || "User",
  };
}

/**
 * Maps a raw Neon Auth session to our AuthUser shape.
 * NOTE: onboardingComplete is intentionally set to `false` here —
 * the auth provider will overwrite it with the DB value from /api/profile/me.
 */
export function mapSessionToAuthUser(
  session: NeonSession | null | undefined
): AuthUser | null {
  if (!session) return null;

  const { firstName, lastName } = parseName(session.user.name);
  const verificationLevel: VerificationLevel = session.user.emailVerified
    ? "Fully Verified"
    : "Unverified";
  const role =
    ((session.user.role as Role | undefined) ?? ROLE_FALLBACK) || ROLE_FALLBACK;

  return {
    id: session.user.id,
    email: session.user.email,
    firstName,
    lastName,
    avatar: session.user.image ?? undefined,
    role,
    emailVerified: session.user.emailVerified,
    phoneVerified: Boolean(session.user.phoneNumberVerified),
    twoFactorEnabled: false,
    // Always false from session alone — overwritten by DB profile fetch
    onboardingComplete: false,
    accountReviewStatus: "NotSubmitted",
    verificationLevel,
    createdAt: session.user.createdAt.toISOString(),
    location: "Nigeria",
  };
}
