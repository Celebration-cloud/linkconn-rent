import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { ViewingRepository } from "@/repositories/viewing.repository";
import { ViewingWorkspace } from "@/features/viewings/components/viewing-workspace";
export default async function ViewingCalendarPage() { const profile = await getCurrentProfile(); if (!profile) redirect("/login?next=/dashboard/calendar"); return <ViewingWorkspace role={profile.role} items={await ViewingRepository.list(profile)} detail={null} />; }
