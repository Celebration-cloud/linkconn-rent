import { ModerationCenter } from "@/components/stitch/admin-centers";
import { AdministrationRepository } from "@/repositories/administration.repository";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { canSanctionUsers } from "@/lib/admin-permissions";

export default async function AdminModerationPage() {
  await connection();
  const [initialData, profile] = await Promise.all([AdministrationRepository.listModeration(), getCurrentProfile()]);
  const canSanction = profile ? canSanctionUsers(profile.role) : false;
  return <ModerationCenter initialData={canSanction ? initialData : { ...initialData, users: [] }} />;
}
import { connection } from "next/server";
