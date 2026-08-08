import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/neon-auth";
import {
  getAccountAccessProfile,
  getAccountGateDestination,
} from "@/lib/auth/account-access";

export default async function ProtectedDashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/login");
  if (!session.user.emailVerified) {
    redirect(
      `/verify-email?email=${encodeURIComponent(session.user.email)}&next=${encodeURIComponent("/dashboard")}`,
    );
  }
  const profile = await getAccountAccessProfile(session.user.id);
  const destination = profile
    ? getAccountGateDestination(profile)
    : "/onboarding";
  if (destination) redirect(destination);
  return children;
}
