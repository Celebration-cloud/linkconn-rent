import { PropertiesWorkspace } from "@/features/admin/components/admin-workspaces";
import { parseAdminSearchParams, type AdminSearchParams } from "@/features/admin/server/admin-page-data";
import { AdministrationRepository } from "@/repositories/administration.repository";

export default async function AdminPropertiesPage({ searchParams }: { searchParams: AdminSearchParams }) {
  const data = await AdministrationRepository.listProperties(await parseAdminSearchParams(searchParams));
  return <PropertiesWorkspace data={data} />;
}
