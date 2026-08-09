import { UsersWorkspace } from "@/features/admin/components/admin-workspaces";
import { parseAdminSearchParams, type AdminSearchParams } from "@/features/admin/server/admin-page-data";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { canSanctionUsers } from "@/lib/admin-permissions";
import { AdministrationRepository } from "@/repositories/administration.repository";

export default async function AdminUsersPage({ searchParams }: { searchParams: AdminSearchParams }) {
  await connection();
  const [filters, profile] = await Promise.all([parseAdminSearchParams(searchParams), getCurrentProfile()]);
  const data = await AdministrationRepository.listUsers(filters);
  return <UsersWorkspace data={data} currentUserId={profile?.id ?? ""} canSanction={profile ? canSanctionUsers(profile.role) : false} />;
}
import { connection } from "next/server";
