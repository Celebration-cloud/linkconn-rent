import { AuditWorkspace } from "@/features/admin/components/admin-workspaces";
import { parseAdminSearchParams, type AdminSearchParams } from "@/features/admin/server/admin-page-data";
import { AdministrationRepository } from "@/repositories/administration.repository";

export default async function AdminAuditPage({ searchParams }: { searchParams: AdminSearchParams }) {
  const data = await AdministrationRepository.listAuditEvents(await parseAdminSearchParams(searchParams));
  return <AuditWorkspace data={data} />;
}
