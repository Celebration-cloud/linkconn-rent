import { VerificationQueue } from "@/components/stitch/admin-centers";
import { parseAdminSearchParams, type AdminSearchParams } from "@/features/admin/server/admin-page-data";
import { AdministrationRepository } from "@/repositories/administration.repository";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { canAccessPrivateVerificationDocuments } from "@/lib/admin-permissions";

export default async function AdminVerificationsPage({ searchParams }: { searchParams: AdminSearchParams }) {
  await connection();
  const [filters, profile] = await Promise.all([
    parseAdminSearchParams(searchParams),
    getCurrentProfile(),
  ]);
  const data = await AdministrationRepository.listVerifications(filters, profile?.role);
  return (
    <VerificationQueue
      initialData={data}
      canViewPrivateDocuments={Boolean(profile && canAccessPrivateVerificationDocuments(profile.role))}
    />
  );
}
import { connection } from "next/server";
