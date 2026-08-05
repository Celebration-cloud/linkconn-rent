import { NextResponse } from "next/server";
import { auth } from "@/lib/neon-auth";
import { prisma } from "@/lib/db/client";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { verifyCsrf } from "@/lib/security/csrf";
import { completeOnboardingSchema } from "@/schemas/onboarding";

/**
 * POST /api/onboarding/complete
 *
 * Persists all onboarding data for a user and marks their profile as
 * onboarding_complete = true. Requires an active, email-verified session.
 *
 * Body: CompleteOnboardingPayload (discriminated union by role)
 */
export async function POST(req: Request) {
  // 1. CSRF check
  if (!verifyCsrf(req)) {
    return NextResponse.json(
      { success: false, message: "Security check failed: Origin mismatch." },
      { status: 403 }
    );
  }

  // 2. Rate limiting — 10 attempts per hour per IP
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, "onboarding", 10, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many onboarding attempts. Please try again later.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(
            (rateLimit.resetTime - Date.now()) / 1000
          ).toString(),
        },
      }
    );
  }

  // 3. Auth check
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!session.user.emailVerified) {
    return NextResponse.json(
      { success: false, message: "Please verify your email before completing onboarding." },
      { status: 403 }
    );
  }

  // 4. Validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const parsed = completeOnboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: parsed.error.issues[0]?.message || "Validation failed",
        errors: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const userId = session.user.id;

  try {
    // Persist the profile and submit one idempotent identity review request.
    await prisma.$transaction(async (tx) => {
      await tx.profile.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: session.user.email,
          firstName: payload.personal.firstName,
          lastName: payload.personal.lastName,
          phone: payload.personal.phone,
          role: payload.role === "Tenant" ? "Tenant" : "Landlord",
          emailVerified: session.user.emailVerified,
          onboardingComplete: true,
        },
        update: {
          firstName: payload.personal.firstName,
          lastName: payload.personal.lastName,
          phone: payload.personal.phone,
          role: payload.role === "Tenant" ? "Tenant" : "Landlord",
          onboardingComplete: true,
        },
      });

    // 6. Upsert role sub-profile
    if (payload.role === "Tenant") {
      await tx.tenantProfile.upsert({
        where: { profileId: userId },
        create: {
          profileId: userId,
          employmentType: payload.employment.employmentType,
          employerName: payload.employment.employerName || null,
          jobTitle: payload.employment.jobTitle || null,
          incomeRange: payload.employment.incomeRange,
          preferredLocations: payload.preferences.preferredLocations,
          preferredTypes: payload.preferences.preferredTypes,
          budgetMin: payload.preferences.budgetMin ?? null,
          budgetMax: payload.preferences.budgetMax ?? null,
          moveInDate: payload.preferences.moveInDate
            ? new Date(payload.preferences.moveInDate)
            : null,
          ninNumber: payload.personal.nin || null,
          ninStatus: payload.personal.nin ? "Pending" : "NotSubmitted",
        },
        update: {
          employmentType: payload.employment.employmentType,
          employerName: payload.employment.employerName || null,
          jobTitle: payload.employment.jobTitle || null,
          incomeRange: payload.employment.incomeRange,
          preferredLocations: payload.preferences.preferredLocations,
          preferredTypes: payload.preferences.preferredTypes,
          budgetMin: payload.preferences.budgetMin ?? null,
          budgetMax: payload.preferences.budgetMax ?? null,
          moveInDate: payload.preferences.moveInDate
            ? new Date(payload.preferences.moveInDate)
            : null,
          ninNumber: payload.personal.nin || null,
          ninStatus: payload.personal.nin ? "Pending" : "NotSubmitted",
        },
      });
    } else if (payload.role === "Landlord") {
      await tx.landlordProfile.upsert({
        where: { profileId: userId },
        create: {
          profileId: userId,
          businessName: payload.business.businessName || null,
          propertyCount: payload.business.propertyCount,
          propertyTypesOffered: payload.business.propertyTypesOffered,
          ninNumber: payload.personal.nin || null,
          ninStatus: payload.personal.nin ? "Pending" : "NotSubmitted",
          bankName: payload.payout.bankName,
          accountNumber: payload.payout.accountNumber,
          accountName: payload.payout.accountName,
        },
        update: {
          businessName: payload.business.businessName || null,
          propertyCount: payload.business.propertyCount,
          propertyTypesOffered: payload.business.propertyTypesOffered,
          ninNumber: payload.personal.nin || null,
          ninStatus: payload.personal.nin ? "Pending" : "NotSubmitted",
          bankName: payload.payout.bankName,
          accountNumber: payload.payout.accountNumber,
          accountName: payload.payout.accountName,
        },
      });
    }

      const latestReview = await tx.verificationSubmission.findFirst({
        where: { ownerId: userId, type: "Identity" },
        orderBy: { createdAt: "desc" },
      });
      if (!latestReview) {
        await tx.verificationSubmission.create({
          data: {
            ownerId: userId,
            type: "Identity",
            status: "Pending",
            documentType: "NIN",
            note: "Account review submitted after onboarding.",
            submittedAt: new Date(),
          },
        });
      } else if (latestReview.status === "Rejected") {
        await tx.verificationSubmission.update({
          where: { id: latestReview.id },
          data: {
            status: "Pending",
            submittedAt: new Date(),
            assignedToId: null,
            reviewedById: null,
            reviewedAt: null,
            decisionReason: null,
            reviewNotes: null,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Profile submitted for review",
      data: { onboardingComplete: true, accountReviewStatus: "Pending" },
    });
  } catch (error) {
    console.error("[POST /api/onboarding/complete]", error);
    return NextResponse.json(
      { success: false, message: "Failed to save onboarding data." },
      { status: 500 }
    );
  }
}
