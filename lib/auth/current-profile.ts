import type { AppRole, Profile } from "@prisma/client";
import { auth } from "@/lib/neon-auth";
import { prisma } from "@/lib/db/client";

export type CurrentProfile = Pick<
  Profile,
  "id" | "email" | "firstName" | "lastName" | "role" | "accountStatus" | "onboardingComplete"
>;

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;

  return prisma.profile.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      accountStatus: true,
      onboardingComplete: true,
    },
  });
}

export function hasRole(profile: CurrentProfile, roles: readonly AppRole[]) {
  return roles.includes(profile.role);
}

export function isAccountOperational(profile: CurrentProfile) {
  return profile.accountStatus !== "Suspended";
}
