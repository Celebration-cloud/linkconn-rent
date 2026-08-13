import { AuditWorkspace } from "@/features/admin/components/admin-workspaces";
import { parseAdminSearchParams, type AdminSearchParams } from "@/features/admin/server/admin-page-data";
import { AdministrationRepository } from "@/repositories/administration.repository";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { canReviewQueues } from "@/lib/admin-permissions";
import { redirect } from "next/navigation";

export default async function AdminAuditPage({ searchParams }: { searchParams: AdminSearchParams }) {
  await connection();
  const [filters, profile] = await Promise.all([parseAdminSearchParams(searchParams), getCurrentProfile()]);
  if (!profile || !canReviewQueues(profile.role)) redirect("/forbidden");
  const [data, detail] = await Promise.all([AdministrationRepository.listAuditEvents(filters, profile.role), filters.item ? AdministrationRepository.getAuditEventDetail(filters.item, profile.role) : null]);
  return <AuditWorkspace data={data} detail={detail} />;
}
import { connection } from "next/server";
