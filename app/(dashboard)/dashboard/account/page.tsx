import { redirect } from "next/navigation";
import { DashboardAccountSummary } from "@/features/dashboard/dashboard-account-summary";
import { getCurrentProfile } from "@/lib/auth/current-profile";

export default async function DashboardAccountPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/account");

  return <DashboardAccountSummary profile={profile} />;
}
