import { prisma } from "@/lib/db/client";
import type { OnboardingDraftPayload } from "@/schemas/onboarding";

export class OnboardingRepository {
  static async getDraft(profileId: string) {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { tenantProfile: true, landlordProfile: true },
    });
    if (!profile) throw new Error("NOT_FOUND");

    const personal = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || "",
      nin:
        profile.role === "Landlord"
          ? profile.landlordProfile?.ninNumber || ""
          : profile.tenantProfile?.ninNumber || "",
    };

    if (profile.role === "Landlord") {
      return {
        role: "Landlord" as const,
        personal,
        business: {
          businessName: profile.landlordProfile?.businessName || "",
          propertyCount: profile.landlordProfile?.propertyCount || 1,
          propertyTypesOffered:
            profile.landlordProfile?.propertyTypesOffered || [],
        },
        payout: {
          bankName: profile.landlordProfile?.bankName || "",
          accountNumber: profile.landlordProfile?.accountNumber || "",
          accountName: profile.landlordProfile?.accountName || "",
        },
      };
    }

    return {
      role: "Tenant" as const,
      personal,
      preferences: {
        preferredLocations: profile.tenantProfile?.preferredLocations || [],
        preferredTypes: profile.tenantProfile?.preferredTypes || [],
        budgetMin: profile.tenantProfile?.budgetMin ?? undefined,
        budgetMax: profile.tenantProfile?.budgetMax ?? undefined,
        moveInDate: profile.tenantProfile?.moveInDate
          ?.toISOString()
          .slice(0, 10),
      },
      employment: {
        employmentType: profile.tenantProfile?.employmentType || "Employed",
        employerName: profile.tenantProfile?.employerName || "",
        jobTitle: profile.tenantProfile?.jobTitle || "",
        incomeRange: profile.tenantProfile?.incomeRange || "Below50k",
      },
    };
  }

  static async saveDraft(profileId: string, input: OnboardingDraftPayload) {
    const personal = input.personal;
    await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({
        where: { id: profileId },
        select: { id: true },
      });
      if (!profile) throw new Error("NOT_FOUND");

      await tx.profile.update({
        where: { id: profileId },
        data: {
          role: input.role,
          ...(personal?.firstName?.trim()
            ? { firstName: personal.firstName.trim() }
            : {}),
          ...(personal?.lastName?.trim()
            ? { lastName: personal.lastName.trim() }
            : {}),
          ...(personal?.phone?.trim() ? { phone: personal.phone.trim() } : {}),
          onboardingComplete: false,
        },
      });

      if (input.role === "Tenant") {
        const preferences = input.preferences;
        const employment = input.employment;
        await tx.tenantProfile.upsert({
          where: { profileId },
          create: {
            profileId,
            ...(personal?.nin ? { ninNumber: personal.nin, ninStatus: "Pending" } : {}),
            ...(preferences?.preferredLocations
              ? { preferredLocations: preferences.preferredLocations }
              : {}),
            ...(preferences?.preferredTypes
              ? { preferredTypes: preferences.preferredTypes }
              : {}),
            ...(preferences?.budgetMin !== undefined
              ? { budgetMin: preferences.budgetMin }
              : {}),
            ...(preferences?.budgetMax !== undefined
              ? { budgetMax: preferences.budgetMax }
              : {}),
            ...(preferences?.moveInDate
              ? { moveInDate: new Date(preferences.moveInDate) }
              : {}),
            ...(employment?.employmentType
              ? { employmentType: employment.employmentType }
              : {}),
            ...(employment?.employerName !== undefined
              ? { employerName: employment.employerName || null }
              : {}),
            ...(employment?.jobTitle !== undefined
              ? { jobTitle: employment.jobTitle || null }
              : {}),
            ...(employment?.incomeRange
              ? { incomeRange: employment.incomeRange }
              : {}),
          },
          update: {
            ...(personal?.nin ? { ninNumber: personal.nin, ninStatus: "Pending" } : {}),
            ...(preferences?.preferredLocations
              ? { preferredLocations: preferences.preferredLocations }
              : {}),
            ...(preferences?.preferredTypes
              ? { preferredTypes: preferences.preferredTypes }
              : {}),
            ...(preferences?.budgetMin !== undefined
              ? { budgetMin: preferences.budgetMin }
              : {}),
            ...(preferences?.budgetMax !== undefined
              ? { budgetMax: preferences.budgetMax }
              : {}),
            ...(preferences?.moveInDate
              ? { moveInDate: new Date(preferences.moveInDate) }
              : {}),
            ...(employment?.employmentType
              ? { employmentType: employment.employmentType }
              : {}),
            ...(employment?.employerName !== undefined
              ? { employerName: employment.employerName || null }
              : {}),
            ...(employment?.jobTitle !== undefined
              ? { jobTitle: employment.jobTitle || null }
              : {}),
            ...(employment?.incomeRange
              ? { incomeRange: employment.incomeRange }
              : {}),
          },
        });
        return;
      }

      const business = input.business;
      const payout = input.payout;
      await tx.landlordProfile.upsert({
        where: { profileId },
        create: {
          profileId,
          ...(personal?.nin ? { ninNumber: personal.nin, ninStatus: "Pending" } : {}),
          ...(business?.businessName !== undefined
            ? { businessName: business.businessName || null }
            : {}),
          ...(business?.propertyCount !== undefined
            ? { propertyCount: business.propertyCount }
            : {}),
          ...(business?.propertyTypesOffered
            ? { propertyTypesOffered: business.propertyTypesOffered }
            : {}),
          ...(payout?.bankName !== undefined
            ? { bankName: payout.bankName || null }
            : {}),
          ...(payout?.accountNumber !== undefined
            ? { accountNumber: payout.accountNumber || null }
            : {}),
          ...(payout?.accountName !== undefined
            ? { accountName: payout.accountName || null }
            : {}),
        },
        update: {
          ...(personal?.nin ? { ninNumber: personal.nin, ninStatus: "Pending" } : {}),
          ...(business?.businessName !== undefined
            ? { businessName: business.businessName || null }
            : {}),
          ...(business?.propertyCount !== undefined
            ? { propertyCount: business.propertyCount }
            : {}),
          ...(business?.propertyTypesOffered
            ? { propertyTypesOffered: business.propertyTypesOffered }
            : {}),
          ...(payout?.bankName !== undefined
            ? { bankName: payout.bankName || null }
            : {}),
          ...(payout?.accountNumber !== undefined
            ? { accountNumber: payout.accountNumber || null }
            : {}),
          ...(payout?.accountName !== undefined
            ? { accountName: payout.accountName || null }
            : {}),
        },
      });
    });

    return this.getDraft(profileId);
  }
}
