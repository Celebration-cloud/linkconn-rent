import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { ViewingRepository } from "@/repositories/viewing.repository";
import { ViewingWorkspace } from "@/features/viewings/components/viewing-workspace";
export default async function ViewingsPage() { const profile = await getCurrentProfile(); if (!profile) redirect("/login?next=/dashboard/viewings"); return <ViewingWorkspace role={profile.role} items={await ViewingRepository.list(profile)} detail={null} />; }
