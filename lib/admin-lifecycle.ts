import type {
  DisputeStatus,
  ModerationStatus,
  VerificationSubmissionStatus,
} from "@prisma/client";

const DISPUTE_TRANSITIONS: Record<DisputeStatus, readonly DisputeStatus[]> = {
  Open: ["Investigating", "Dismissed"],
  Investigating: ["Resolved", "Dismissed"],
  Resolved: [],
  Dismissed: [],
};

export function canTransitionDispute(from: DisputeStatus, to: DisputeStatus) {
  return DISPUTE_TRANSITIONS[from].includes(to);
}

export function canReviewVerification(status: VerificationSubmissionStatus) {
  return status === "Pending";
}

export function isListingDecision(status: ModerationStatus) {
  return status === "Approved" || status === "Flagged" || status === "Removed";
}

export function paystackAmountMatches(nairaAmount: number, amountInKobo: number) {
  return Number.isFinite(nairaAmount) && Math.round(nairaAmount * 100) === amountInKobo;
}
