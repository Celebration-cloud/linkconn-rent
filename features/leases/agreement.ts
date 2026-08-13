import { createHash } from "node:crypto";
import { hashLeaseTerms } from "@/lib/lease-agreement";
import type { LeaseTerms } from "@/features/leases/contracts";

const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const escape = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);

export function renderLeaseAgreement(terms: LeaseTerms) {
  const schedule = [...terms.schedule]
    .sort((left, right) => left.sequence - right.sequence)
    .map((item) => `<li>${escape(item.label)}: ${naira.format(item.amountMinor / 100)} due ${item.dueDate}</li>`)
    .join("");
  const obligations = [...terms.utilities, ...terms.rules]
    .map((item) => `<li>${escape(item)}</li>`)
    .join("");
  return `<article><h1>Residential tenancy agreement</h1><p>${escape(terms.property.title)} — ${escape(terms.property.location)}</p><p>Between ${escape(terms.participants.landlord.name)} and ${escape(terms.participants.tenant.name)}.</p><p>Term: ${terms.startDate} to ${terms.endDate}. Rent: ${naira.format(terms.rentMinor / 100)} per ${terms.billingPeriod}.</p><h2>Payment schedule</h2><ol>${schedule}</ol><h2>Notice and renewal</h2><p>${terms.noticeDays} days. ${escape(terms.renewalTerms)}</p><h2>Utilities and rules</h2><ul>${obligations}</ul><p>${escape(terms.specialTerms)}</p><footer>Acceptance is an in-product audited acceptance. It is not a certified e-signature.</footer></article>`;
}

export function buildLeaseVersion(terms: LeaseTerms) {
  return { terms, contentHash: hashLeaseTerms(terms), renderedAgreement: renderLeaseAgreement(terms) };
}

export function hashLeaseEvidence(ip: string, userAgent: string, pepper: string) {
  const digest = (label: string, value: string) => createHash("sha256").update(`${label}:${pepper}:${value}`, "utf8").digest("hex");
  return { ipHash: digest("ip", ip), userAgentHash: digest("ua", userAgent) };
}

export function getLeaseEvidenceSecret() {
  const secret = process.env.LEASE_EVIDENCE_SECRET?.trim();
  if (!secret) throw new Error("LEASE_EVIDENCE_SECRET_NOT_CONFIGURED");
  return secret;
}
