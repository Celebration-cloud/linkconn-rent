import { redirect } from "next/navigation";
import AccountPage from "@/features/dashboard/account-page";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { DashboardRepository } from "@/repositories/dashboard.repository";

export default async function DashboardPageRoute() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard");

  const snapshot = await DashboardRepository.getSnapshot(profile);
  return <AccountPage initialSnapshot={snapshot} />;
}
