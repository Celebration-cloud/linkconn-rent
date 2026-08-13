import { notFound, redirect } from "next/navigation";
import { SupportWorkspace } from "@/features/support/components/support-workspace";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { SupportRepository } from "@/repositories/support.repository";
export default async function SupportDetailPage({ params }: { params: Promise<{ id: string }> }) { const profile = await getCurrentProfile(); if (!profile) redirect("/login?next=/dashboard/support"); if (!isAccountOperational(profile)) redirect("/forbidden"); const { id } = await params; const [tickets, detail] = await Promise.all([SupportRepository.listForProfile(profile.id), SupportRepository.detailForProfile(profile.id, id)]); if (!detail) notFound(); return <SupportWorkspace tickets={tickets} detail={detail} />; }
