import type {
  LeaseAcceptanceParty,
  LeaseStatus,
  PaymentStatus,
} from "@prisma/client";

const LEASE_TRANSITIONS: Record<LeaseStatus, readonly LeaseStatus[]> = {
  Draft: ["AwaitingAcceptance", "Cancelled"],
  AwaitingAcceptance: ["ChangesRequested", "AwaitingPayment", "Cancelled"],
  ChangesRequested: ["AwaitingAcceptance", "Cancelled"],
  AwaitingPayment: ["Active", "Cancelled"],
  Active: ["Completed", "Terminated"],
  Completed: [],
  Cancelled: [],
  Terminated: [],
};

export interface LeaseAcceptanceFact {
  leaseVersionId: string;
  agreementHash: string;
  party: LeaseAcceptanceParty;
}

export interface LeasePaymentFact {
  sequence: number;
  paymentId: string | null;
  paymentStatus: PaymentStatus | null;
}

export interface LeaseActivationFacts {
  currentVersionId: string;
  currentAgreementHash: string;
  acceptances: readonly LeaseAcceptanceFact[];
  paymentSchedule: readonly LeasePaymentFact[];
}

export function canTransitionLease(from: LeaseStatus, to: LeaseStatus) {
  return LEASE_TRANSITIONS[from].includes(to);
}

export function canActivateLease({
  currentVersionId,
  currentAgreementHash,
  acceptances,
  paymentSchedule,
}: LeaseActivationFacts) {
  const currentVersionParties = new Set(
    acceptances
      .filter(
        (acceptance) =>
          acceptance.leaseVersionId === currentVersionId &&
          acceptance.agreementHash === currentAgreementHash,
      )
      .map((acceptance) => acceptance.party),
  );

  if (
    !currentVersionParties.has("Tenant") ||
    !currentVersionParties.has("Landlord")
  ) {
    return false;
  }

  const firstScheduledPayment = paymentSchedule.toSorted(
    (left, right) => left.sequence - right.sequence,
  )[0];

  return (
    firstScheduledPayment !== undefined &&
    firstScheduledPayment.paymentId !== null &&
    firstScheduledPayment.paymentStatus === "Paid"
  );
}
