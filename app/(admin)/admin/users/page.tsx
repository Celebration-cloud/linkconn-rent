import { UsersWorkspace } from "@/features/admin/components/admin-workspaces";
import { parseAdminSearchParams, type AdminSearchParams } from "@/features/admin/server/admin-page-data";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { canSanctionUsers } from "@/lib/admin-permissions";
import { canReviewQueues } from "@/lib/admin-permissions";
import { redirect } from "next/navigation";
import { AdministrationRepository } from "@/repositories/administration.repository";

export default async function AdminUsersPage({ searchParams }: { searchParams: AdminSearchParams }) {
  await connection();
  const [filters, profile] = await Promise.all([parseAdminSearchParams(searchParams), getCurrentProfile()]);
  if (!profile || !canReviewQueues(profile.role)) redirect("/forbidden");
  const [data, detail] = await Promise.all([AdministrationRepository.listUsers(filters, profile.role), filters.item ? AdministrationRepository.getUserDetail(filters.item, profile.role) : null]);
  return <UsersWorkspace data={data} detail={detail} currentUserId={profile?.id ?? ""} canSanction={profile ? canSanctionUsers(profile.role) : false} />;
}
import { connection } from "next/server";
