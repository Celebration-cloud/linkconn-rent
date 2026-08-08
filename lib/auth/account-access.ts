import "server-only";

import type {
  AccountStatus,
  AppRole,
  VerificationSubmissionStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { isAdminReviewExemptRole } from "@/lib/auth/review-access";

export type AccountReviewStatus =
  | VerificationSubmissionStatus
  | "NotSubmitted";

export type AccountAccessProfile = {
  id: string;
  role: AppRole;
  accountStatus: AccountStatus;
  onboardingComplete: boolean;
  accountReviewStatus: AccountReviewStatus;
};

export async function getAccountAccessProfile(
  userId: string,
): Promise<AccountAccessProfile | null> {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      accountStatus: true,
      onboardingComplete: true,
      verificationSubmissions: {
        where: { type: "Identity" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true },
      },
    },
  });
  if (!profile) return null;

  const latestStatus = profile.verificationSubmissions[0]?.status;
  return {
    id: profile.id,
    role: profile.role,
    accountStatus: profile.accountStatus,
    onboardingComplete: profile.onboardingComplete,
    accountReviewStatus:
      latestStatus === "Draft" ? "NotSubmitted" : latestStatus ?? "NotSubmitted",
  };
}

export async function getAccountRoleByEmail(email: string): Promise<AppRole | null> {
  const profile = await prisma.profile.findFirst({
    where: { email: { equals: email.trim(), mode: "insensitive" } },
    select: { role: true },
  });
  return profile?.role ?? null;
}

export function getAccountGateDestination(
  profile: AccountAccessProfile,
): "/forbidden" | "/onboarding" | "/account-review" | null {
  if (profile.accountStatus === "Suspended") return "/forbidden";
  if (isAdminReviewExemptRole(profile.role)) return null;
  if (!profile.onboardingComplete) return "/onboarding";
  if (profile.accountReviewStatus !== "Approved") return "/account-review";
  return null;
}

export function getPostLoginDestination(
  profile: AccountAccessProfile | null,
  requestedPath: string,
) {
  if (!profile) return "/onboarding";
  return getAccountGateDestination(profile) ?? requestedPath;
}
