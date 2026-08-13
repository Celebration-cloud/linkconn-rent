import { redirect } from "next/navigation";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { LeaseRepository } from "@/repositories/lease.repository";
import { LeaseWorkspace } from "@/features/leases/components/lease-workspace";

export default async function LeasesPage({ searchParams }: { searchParams: Promise<{ item?: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/leases");
  if (!isAccountOperational(profile)) redirect("/forbidden");
  const leases = await LeaseRepository.list(profile);
  const query = await searchParams;
  const selectedId = query.item ?? leases[0]?.id;
  const selected = selectedId ? await LeaseRepository.detail(profile, selectedId) : null;
  return <LeaseWorkspace leases={leases} selected={selected} viewer={{ id: profile.id, role: profile.role }} />;
}
