import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/stitch/admin-shell";
import { getCurrentProfile, hasRole, isAccountOperational } from "@/lib/auth/current-profile";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login?next=/admin");
  if (!isAccountOperational(profile)) redirect("/forbidden");
  if (!hasRole(profile, ["Moderator", "Admin", "SuperAdmin"])) redirect("/forbidden");
  return <AdminShell viewer={{ id: profile.id, firstName: profile.firstName, lastName: profile.lastName, email: profile.email, role: profile.role, accountStatus: profile.accountStatus }}>{children}</AdminShell>;
}
