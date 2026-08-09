import { NextResponse } from "next/server";
import { auth } from "@/lib/neon-auth";
import { prisma } from "@/lib/db/client";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { verifyCsrf } from "@/lib/security/csrf";
import { completeOnboardingSchema } from "@/schemas/onboarding";
import { getDocumentStorage } from "@/services/storage/document-storage";
import {
  getMissingDocumentRequirements,
  getOnboardingDocumentRequirements,
} from "@/features/onboarding/document-requirements";

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

  if (!getDocumentStorage().configured) {
    return NextResponse.json(
      { success: false, message: "Private document storage is not configured. Save your draft and try again later." },
      { status: 503 },
    );
  }

  const requirements = getOnboardingDocumentRequirements(
    payload.role === "Tenant"
      ? { role: "Tenant", employmentType: payload.employment.employmentType }
      : { role: "Landlord" },
  );

  try {
    const uploadDraft = await prisma.verificationSubmission.findFirst({
      where: { ownerId: userId, type: "Identity", status: "Draft" },
      orderBy: { createdAt: "desc" },
      include: {
        documents: {
          where: { storageKey: { not: null }, deletedAt: null, uploadIntentId: null },
          select: { id: true, storageKey: true, mimeType: true, size: true },
        },
      },
    });
    if (!uploadDraft) throw new Error("DOCUMENTS_INCOMPLETE");
    const storage = getDocumentStorage();
    await Promise.all(uploadDraft.documents.map(async (document) => {
      if (!document.storageKey?.startsWith(`private-verifications/${uploadDraft.id}/${document.id}/`)) {
        throw new Error("DOCUMENT_BLOB_MISSING");
      }
      try {
        const stored = await storage.inspect(document.storageKey);
        if (stored.pathname !== document.storageKey || stored.contentType !== document.mimeType || stored.size !== document.size) {
          throw new Error("DOCUMENT_BLOB_MISSING");
        }
      } catch {
        throw new Error("DOCUMENT_BLOB_MISSING");
      }
    }));

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

      const draftReview = await tx.verificationSubmission.findFirst({
        where: { ownerId: userId, type: "Identity", status: "Draft" },
        orderBy: { createdAt: "desc" },
        include: {
          documents: {
            where: { storageKey: { not: null }, deletedAt: null },
            select: { id: true, kind: true, storageKey: true, uploadIntentId: true },
          },
        },
      });
      if (!draftReview) throw new Error("DOCUMENTS_INCOMPLETE");
      const verifiedDocuments = draftReview.documents.filter((document) =>
        document.uploadIntentId === null &&
        document.storageKey?.startsWith(`private-verifications/${draftReview.id}/${document.id}/`),
      );
      const missing = getMissingDocumentRequirements(
        requirements,
        verifiedDocuments.map((document) => document.kind),
      );
      if (missing.length > 0) throw new Error(`DOCUMENTS_INCOMPLETE:${missing.map((item) => item.label).join(", ")}`);
      const submittedIds = new Set(payload.documents.map((document) => document.id));
      if (verifiedDocuments.some((document) => !submittedIds.has(document.id))) {
        throw new Error("DOCUMENT_REFERENCES_INVALID");
      }
      await tx.verificationSubmission.update({
        where: { id: draftReview.id },
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
    });

    return NextResponse.json({
      success: true,
      message: "Profile submitted for review",
      data: { onboardingComplete: true, accountReviewStatus: "Pending" },
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("DOCUMENTS_INCOMPLETE")) {
      const missing = error.message.split(":").slice(1).join(":");
      return NextResponse.json(
        { success: false, message: missing ? `Upload the required documents: ${missing}.` : "Upload all required documents before submitting for review." },
        { status: 409 },
      );
    }
    if (error instanceof Error && error.message === "DOCUMENT_REFERENCES_INVALID") {
      return NextResponse.json(
        { success: false, message: "Document references are incomplete. Refresh the page and try again." },
        { status: 409 },
      );
    }
    if (error instanceof Error && error.message === "DOCUMENT_BLOB_MISSING") {
      return NextResponse.json(
        { success: false, message: "One or more uploaded documents are unavailable or changed. Replace them and try again." },
        { status: 409 },
      );
    }
    console.error("[POST /api/onboarding/complete]", error);
    return NextResponse.json(
      { success: false, message: "Failed to save onboarding data." },
      { status: 500 }
    );
  }
}
