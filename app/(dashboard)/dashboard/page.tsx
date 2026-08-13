import { redirect } from "next/navigation";
import AccountPage from "@/features/dashboard/account-page";
import {
  getLegacyDashboardRedirect,
  type DashboardSearchParams,
} from "@/features/dashboard/dashboard-shell-config";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { DashboardRepository } from "@/repositories/dashboard.repository";

export default async function DashboardPageRoute({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const legacyDestination = getLegacyDashboardRedirect(await searchParams);
  if (legacyDestination) redirect(legacyDestination);

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard");

  const snapshot = await DashboardRepository.getSnapshot(profile);
  return (
    <AccountPage
      initialSnapshot={snapshot}
      landlord={profile.role === "Landlord" || profile.role === "PropertyManager"}
    />
  );
}
