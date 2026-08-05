import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/neon-auth";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";

export default async function ProtectedDashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/login");
  const profile = await getCurrentProfile();
  if (profile && !isAccountOperational(profile)) redirect("/forbidden");
  return children;
}
