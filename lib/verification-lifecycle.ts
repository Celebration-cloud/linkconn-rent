import type { VerificationSubmissionStatus } from "@prisma/client";

const VERIFICATION_TRANSITIONS: Record<
  VerificationSubmissionStatus,
  readonly VerificationSubmissionStatus[]
> = {
  Draft: ["Pending"],
  Pending: ["Approved", "Rejected", "NeedsChanges"],
  NeedsChanges: ["Pending"],
  Approved: [],
  Rejected: [],
};

export function canTransitionVerificationSubmission(
  from: VerificationSubmissionStatus,
  to: VerificationSubmissionStatus,
) {
  return VERIFICATION_TRANSITIONS[from].includes(to);
}
