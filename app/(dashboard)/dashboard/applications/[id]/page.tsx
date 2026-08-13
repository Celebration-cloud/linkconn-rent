import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { ApplicationRepository } from "@/repositories/application.repository";
import { ApplicationWorkspace } from "@/features/applications/components/application-workspace";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/applications");
  const { id } = await params;
  const [items, detail] = await Promise.all([ApplicationRepository.list(profile), ApplicationRepository.detail(profile, id)]);
  if (!detail) notFound();
  return <ApplicationWorkspace role={profile.role} items={items} detail={detail} />;
}
