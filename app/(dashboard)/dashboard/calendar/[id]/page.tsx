import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { ViewingRepository } from "@/repositories/viewing.repository";
import { ViewingWorkspace } from "@/features/viewings/components/viewing-workspace";
export default async function CalendarDetailPage({ params }: { params: Promise<{ id: string }> }) { const profile = await getCurrentProfile(); if (!profile) redirect("/login?next=/dashboard/calendar"); const { id } = await params; const [items, detail] = await Promise.all([ViewingRepository.list(profile), ViewingRepository.detail(profile, id)]); if (!detail) notFound(); return <ViewingWorkspace role={profile.role} items={items} detail={detail} />; }
