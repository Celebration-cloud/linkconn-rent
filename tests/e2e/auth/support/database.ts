import type { AppRole } from "@prisma/client";
import { authE2EPrisma as prisma } from "./prisma";
import type { AuthRole } from "./types";

export async function assignFixtureRole(email: string, role: AuthRole): Promise<string> {
  const profile = await prisma.profile.findUnique({ where: { email }, select: { id: true } });
  if (!profile) throw new Error(`Profile mirror was not created for the ${role} fixture.`);
  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      role: role as AppRole,
      onboardingComplete: !["Tenant", "Landlord"].includes(role),
      accountStatus: "Active",
    },
  });
  return profile.id;
}

export async function assertProfileMirror(input: {
  email: string;
  userId: string;
  role: AuthRole;
  onboardingComplete: boolean;
}): Promise<void> {
  const profile = await prisma.profile.findUnique({
    where: { email: input.email },
    include: { tenantProfile: true, landlordProfile: true },
  });
  if (!profile || profile.id.toLowerCase() !== input.userId.toLowerCase()) throw new Error(`Neon Auth/Profile ID mismatch for ${input.role}.`);
  if (!profile.emailVerified) throw new Error(`Email verification was not mirrored for ${input.role}.`);
  if (profile.role !== input.role || profile.onboardingComplete !== input.onboardingComplete) throw new Error(`Profile state mismatch for ${input.role}.`);
  if (input.onboardingComplete && input.role === "Tenant" && !profile.tenantProfile) throw new Error("Tenant sub-profile is missing.");
  if (input.onboardingComplete && input.role === "Landlord" && !profile.landlordProfile) throw new Error("Landlord sub-profile is missing.");
}

export async function setAccountStatus(userId: string, status: "Active" | "Suspended"): Promise<void> {
  await prisma.profile.update({ where: { id: userId }, data: { accountStatus: status } });
}

export async function deleteExactProfile(userId: string, email: string): Promise<void> {
  const profile = await prisma.profile.findUnique({ where: { id: userId }, select: { email: true } });
  if (!profile) return;
  if (profile.email !== email) throw new Error("Cleanup refused: fixture identity does not match the recorded E2E account.");
  await prisma.profile.delete({ where: { id: userId } });
}
