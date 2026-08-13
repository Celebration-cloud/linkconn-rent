import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getDashboardRoleRedirect } from "@/features/dashboard/dashboard-shell-config";
import { getCurrentProfile } from "@/lib/auth/current-profile";

export default async function TenantViewingsLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/viewings");
  const destination = getDashboardRoleRedirect(profile.role, "/dashboard/viewings");
  if (destination) redirect(destination);
  return children;
}
