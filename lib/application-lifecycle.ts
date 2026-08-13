import type { ApplicationStatus } from "@prisma/client";

const TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  Pending: ["Shortlisted", "Accepted", "Declined"],
  Shortlisted: ["Accepted", "Declined"],
  Accepted: [],
  Declined: [],
  Withdrawn: [],
};

export interface TenantApplicationTransitionInput {
  actorId: string;
  tenantId: string;
  from: ApplicationStatus;
  to: ApplicationStatus;
}

export function canTransitionApplication(
  from: ApplicationStatus,
  to: ApplicationStatus,
) {
  return TRANSITIONS[from].includes(to);
}

export function canTenantTransitionApplication({
  actorId,
  tenantId,
  from,
  to,
}: TenantApplicationTransitionInput) {
  return (
    actorId === tenantId &&
    to === "Withdrawn" &&
    (from === "Pending" || from === "Shortlisted")
  );
}
