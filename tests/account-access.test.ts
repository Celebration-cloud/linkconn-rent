import { describe, expect, it } from "vitest";
import type { AccountAccessProfile } from "@/lib/auth/account-access";
import {
  getAccountGateDestination,
  getPostLoginDestination,
} from "@/lib/auth/account-access";
import { isAdminReviewExemptRole } from "@/lib/auth/review-access";

function profile(
  overrides: Partial<AccountAccessProfile> = {},
): AccountAccessProfile {
  return {
    id: "profile-1",
    role: "Tenant",
    accountStatus: "Active",
    onboardingComplete: true,
    accountReviewStatus: "Pending",
    ...overrides,
  };
}

describe("post-login account routing", () => {
  it("routes pending accounts to review and unsubmitted accounts to onboarding", () => {
    expect(getPostLoginDestination(profile(), "/dashboard")).toBe(
      "/account-review",
    );
    expect(
      getPostLoginDestination(
        profile({ accountReviewStatus: "NotSubmitted" }),
        "/dashboard",
      ),
    ).toBe("/onboarding");
  });

  it("preserves the requested destination only for approved accounts", () => {
    expect(
      getPostLoginDestination(
        profile({ accountReviewStatus: "Approved" }),
        "/dashboard?tab=saved",
      ),
    ).toBe("/dashboard?tab=saved");
  });

  it("sends incomplete accounts to onboarding and suspended accounts to forbidden", () => {
    expect(
      getAccountGateDestination(profile({ onboardingComplete: false })),
    ).toBe("/onboarding");
    expect(
      getAccountGateDestination(profile({ accountStatus: "Suspended" })),
    ).toBe("/forbidden");
    expect(getPostLoginDestination(null, "/dashboard")).toBe("/onboarding");
  });

  it("does not trust a stale completed flag when the latest review is a draft", () => {
    expect(
      getAccountGateDestination(
        profile({ onboardingComplete: true, accountReviewStatus: "Draft" }),
      ),
    ).toBe("/onboarding");
  });

  it.each(["Admin", "SuperAdmin"] as const)(
    "keeps review-exempt %s accounts on their requested workspace",
    (role) => {
      expect(
        getPostLoginDestination(
          profile({ role, accountReviewStatus: "NotSubmitted" }),
          "/dashboard",
        ),
      ).toBe("/dashboard");
    },
  );

  it.each(["PropertyManager", "Moderator"] as const)(
    "keeps non-admin %s accounts in the review workflow",
    (role) => {
      expect(
        getPostLoginDestination(
          profile({ role, accountReviewStatus: "NotSubmitted" }),
          "/dashboard",
        ),
      ).toBe("/account-review");
    },
  );

  it("recognizes database and client Super Admin role names", () => {
    expect(isAdminReviewExemptRole("Admin")).toBe(true);
    expect(isAdminReviewExemptRole("SuperAdmin")).toBe(true);
    expect(isAdminReviewExemptRole("Super Admin")).toBe(true);
    expect(isAdminReviewExemptRole("Moderator")).toBe(false);
  });
});
