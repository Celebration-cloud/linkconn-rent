import { notFound, redirect } from "next/navigation";
import { MaintenanceCenter } from "@/components/stitch/maintenance-center";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { TenantOperationsRepository } from "@/repositories/tenant-operations.repository";

export default async function MaintenanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/maintenance");
  if (!isAccountOperational(profile)) redirect("/forbidden");
  const items = await TenantOperationsRepository.listMaintenance(profile);
  const { id } = await params;
  const selected = items.find((item) => item.id === id);
  if (!selected) notFound();
  const eligibleProperties = profile.role === "Tenant" ? await TenantOperationsRepository.listEligibleMaintenanceProperties(profile.id) : [];
  return <MaintenanceCenter items={items} eligibleProperties={eligibleProperties} viewer={{ id: profile.id, role: profile.role }} selected={selected} />;
}
