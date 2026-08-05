import type { ApplicationStatus } from "@prisma/client";

const TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  Pending: ["Shortlisted", "Accepted", "Declined"],
  Shortlisted: ["Accepted", "Declined"],
  Accepted: [],
  Declined: [],
};

export function canTransitionApplication(
  from: ApplicationStatus,
  to: ApplicationStatus,
) {
  return TRANSITIONS[from].includes(to);
}
