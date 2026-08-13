import { redirect } from "next/navigation";
import { SupportWorkspace } from "@/features/support/components/support-workspace";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { SupportRepository } from "@/repositories/support.repository";
export default async function SupportPage() { const profile = await getCurrentProfile(); if (!profile) redirect("/login?next=/dashboard/support"); if (!isAccountOperational(profile)) redirect("/forbidden"); return <SupportWorkspace tickets={await SupportRepository.listForProfile(profile.id)} detail={null} />; }
