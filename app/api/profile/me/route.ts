import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { auth } from "@/lib/neon-auth";
import { prisma } from "@/lib/db/client";

/**
 * GET /api/profile/me
 *
 * Returns the authenticated user's Profile row (+ role sub-profile).
 * Used by the auth provider to hydrate onboardingComplete, role, etc.
 */
export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Try to fetch existing profile
    let profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        tenantProfile: true,
        landlordProfile: true,
        verificationSubmissions: {
          where: { type: "Identity" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { status: true, decisionReason: true },
        },
      },
    });

    // Auto-create profile on first request (post email verification)
    if (!profile) {
      const name = session.user.name ?? "";
      const [firstName = "New", ...rest] = name.trim().split(" ");
      const lastName = rest.join(" ") || "User";

      profile = await prisma.profile.create({
        data: {
          id: userId,
          email: session.user.email,
          firstName,
          lastName,
          emailVerified: session.user.emailVerified,
          role: "Tenant", // default — updated during onboarding
          onboardingComplete: false,
        },
        include: {
          tenantProfile: true,
          landlordProfile: true,
          verificationSubmissions: {
            where: { type: "Identity" },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { status: true, decisionReason: true },
          },
        },
      });
    }

    // Sync emailVerified if it changed
    if (profile.emailVerified !== session.user.emailVerified) {
      profile = await prisma.profile.update({
        where: { id: userId },
        data: { emailVerified: session.user.emailVerified },
        include: {
          tenantProfile: true,
          landlordProfile: true,
          verificationSubmissions: {
            where: { type: "Identity" },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { status: true, decisionReason: true },
          },
        },
      });
    }

    const latestReview = profile.verificationSubmissions[0];
    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        accountReviewStatus:
          latestReview?.status === "Draft"
            ? "NotSubmitted"
            : latestReview?.status || "NotSubmitted",
        accountReviewReason: latestReview?.decisionReason || null,
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/profile/me]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
