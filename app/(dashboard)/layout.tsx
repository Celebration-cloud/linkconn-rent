import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/neon-auth";
import {
  getAccountAccessProfile,
  getAccountGateDestination,
} from "@/lib/auth/account-access";
import { DashboardShell } from "@/features/dashboard/dashboard-shell";
import { NotificationRepository } from "@/repositories/notification.repository";

const WORKSPACE_ROLES = ["Tenant", "Landlord", "PropertyManager"] as const;

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
  if (!profile || !WORKSPACE_ROLES.includes(profile.role as (typeof WORKSPACE_ROLES)[number])) {
    return children;
  }

  const nameParts = (session.user.name || "").trim().split(/\s+/).filter(Boolean);
  const emailName = session.user.email.split("@")[0] || "LinkConn member";
  const notifications = await NotificationRepository.list(profile.id);

  return (
    <DashboardShell
      viewer={{
        firstName: nameParts[0] || emailName,
        lastName: nameParts.slice(1).join(" "),
        email: session.user.email,
        role: profile.role,
        accountStatus: profile.accountStatus,
      }}
      initialNotifications={notifications}
    >
      {children}
    </DashboardShell>
  );
}
