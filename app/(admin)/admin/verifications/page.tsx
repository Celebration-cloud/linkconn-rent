import { VerificationQueue } from "@/components/stitch/admin-centers";
import { parseAdminSearchParams, type AdminSearchParams } from "@/features/admin/server/admin-page-data";
import { AdministrationRepository } from "@/repositories/administration.repository";

export default async function AdminVerificationsPage({ searchParams }: { searchParams: AdminSearchParams }) {
  const filters = await parseAdminSearchParams(searchParams);
  const data = await AdministrationRepository.listVerifications(filters);
  return <VerificationQueue initialData={data} />;
}
