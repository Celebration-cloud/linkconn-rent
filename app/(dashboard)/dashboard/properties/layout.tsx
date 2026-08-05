import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { canListProperties } from "@/domain/constants/property-access";
import { getCurrentProfile } from "@/lib/auth/current-profile";

export default async function PropertyManagementLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (!canListProperties(profile.role)) redirect("/forbidden");

  return children;
}
