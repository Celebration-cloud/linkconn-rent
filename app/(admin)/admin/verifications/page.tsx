import { AdminVerificationWorkspace } from "@/features/verifications/components/admin-verification-workspace";
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
  const detail = filters.item && profile
    ? await AdministrationRepository.getVerificationDetail(filters.item, profile.role)
    : null;
  return (
    <AdminVerificationWorkspace
      data={data}
      detail={detail}
      query={{ status: filters.status, query: filters.query, item: filters.item }}
      canRevealSensitive={Boolean(profile && canAccessPrivateVerificationDocuments(profile.role))}
    />
  );
}
import { connection } from "next/server";
