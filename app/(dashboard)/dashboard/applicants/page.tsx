import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { ApplicationRepository } from "@/repositories/application.repository";
import { ApplicationWorkspace } from "@/features/applications/components/application-workspace";

export default async function ApplicantsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/applicants");
  return <ApplicationWorkspace role={profile.role} items={await ApplicationRepository.list(profile)} detail={null} />;
}
