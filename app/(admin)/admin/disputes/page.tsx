import { DisputeCenter } from "@/components/stitch/admin-centers";
import { parseAdminSearchParams, type AdminSearchParams } from "@/features/admin/server/admin-page-data";
import { AdministrationRepository } from "@/repositories/administration.repository";

export default async function AdminDisputesPage({ searchParams }: { searchParams: AdminSearchParams }) {
  await connection();
  const filters = await parseAdminSearchParams(searchParams);
  const data = await AdministrationRepository.listDisputes(filters);
  return <DisputeCenter initialData={data} />;
}
import { connection } from "next/server";
