import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getDashboardRoleRedirect } from "@/features/dashboard/dashboard-shell-config";
import { getCurrentProfile } from "@/lib/auth/current-profile";

export default async function PropertyManagementLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  const destination = getDashboardRoleRedirect(profile.role, "/dashboard/properties");
  if (destination) redirect("/forbidden");

  return children;
}
