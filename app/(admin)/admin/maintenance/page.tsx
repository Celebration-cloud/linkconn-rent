import { connection } from "next/server";
import { OperationsQueue } from "@/features/admin/components/operations-queues";
import { parseAdminSearchParams, type AdminSearchParams } from "@/features/admin/server/admin-page-data";
import { AdministrationRepository } from "@/repositories/administration.repository";

export default async function AdminMaintenancePage({ searchParams }: { searchParams: AdminSearchParams }) {
  await connection();
  const data = await AdministrationRepository.listMaintenanceRequests(await parseAdminSearchParams(searchParams));
  return <OperationsQueue kind="maintenance" data={data} />;
}
