import { connection } from "next/server";
import { OperationsQueue } from "@/features/admin/components/operations-queues";
import { parseAdminSearchParams, type AdminSearchParams } from "@/features/admin/server/admin-page-data";
import { AdministrationRepository } from "@/repositories/administration.repository";

export default async function AdminSupportPage({ searchParams }: { searchParams: AdminSearchParams }) {
  await connection();
  const data = await AdministrationRepository.listSupportTickets(await parseAdminSearchParams(searchParams));
  return <OperationsQueue kind="support" data={data} />;
}
