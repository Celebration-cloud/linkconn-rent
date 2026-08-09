import { PaymentsWorkspace } from "@/features/admin/components/admin-workspaces";
import { parseAdminSearchParams, type AdminSearchParams } from "@/features/admin/server/admin-page-data";
import { AdministrationRepository } from "@/repositories/administration.repository";

export default async function AdminPaymentsPage({ searchParams }: { searchParams: AdminSearchParams }) {
  await connection();
  const data = await AdministrationRepository.listPayments(await parseAdminSearchParams(searchParams));
  return <PaymentsWorkspace data={data} />;
}
import { connection } from "next/server";
