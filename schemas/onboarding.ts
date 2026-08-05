import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Shared enums
// ─────────────────────────────────────────────────────────────

export const employmentTypeEnum = z.enum([
  "Employed",
  "SelfEmployed",
  "Freelancer",
  "Student",
  "Unemployed",
  "Retired",
]);

export const incomeRangeEnum = z.enum([
  "Below50k",
  "Between50kAnd100k",
  "Between100kAnd250k",
  "Between250kAnd500k",
  "Above500k",
]);

export const INCOME_RANGE_LABELS: Record<z.infer<typeof incomeRangeEnum>, string> = {
  Below50k: "Below ₦50,000",
  Between50kAnd100k: "₦50,000 – ₦100,000",
  Between100kAnd250k: "₦100,000 – ₦250,000",
  Between250kAnd500k: "₦250,000 – ₦500,000",
  Above500k: "Above ₦500,000",
};

export const EMPLOYMENT_LABELS: Record<z.infer<typeof employmentTypeEnum>, string> = {
  Employed: "Employed",
  SelfEmployed: "Self-Employed",
  Freelancer: "Freelancer",
  Student: "Student",
  Unemployed: "Unemployed",
  Retired: "Retired",
};

export const PROPERTY_TYPES = [
  "Flat / Apartment",
  "Self-Contained",
  "Mini Flat",
  "Duplex",
  "Bungalow",
  "Detached House",
  "Semi-Detached",
  "Terraced",
  "Room & Parlour",
  "Studio",
] as const;

export const NIGERIAN_CITIES = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Kano",
  "Enugu",
  "Benin City",
  "Kaduna",
  "Owerri",
  "Warri",
  "Calabar",
  "Uyo",
  "Abeokuta",
  "Jos",
  "Lekki",
  "Victoria Island",
  "Ikoyi",
] as const;

export const NIGERIAN_BANKS = [
  "Access Bank",
  "First Bank",
  "GTBank",
  "UBA",
  "Zenith Bank",
  "Kuda Bank",
  "OPay",
  "PalmPay",
  "Moniepoint",
  "Sterling Bank",
  "Polaris Bank",
  "Fidelity Bank",
  "Stanbic IBTC",
  "Union Bank",
  "Wema Bank",
  "Ecobank",
] as const;

// ─────────────────────────────────────────────────────────────
// Step 1 — Personal Details (shared by Tenant + Landlord)
// ─────────────────────────────────────────────────────────────

export const personalDetailsSchema = z.object({
  firstName: z.string().min(2, "Enter your first name"),
  lastName: z.string().min(2, "Enter your last name"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^[+\d\s\-()]+$/, "Invalid phone number format"),
  nin: z
    .string()
    .length(11, "NIN must be 11 digits")
    .regex(/^\d+$/, "NIN must contain only digits"),
});

export type PersonalDetailsData = z.infer<typeof personalDetailsSchema>;

// ─────────────────────────────────────────────────────────────
// Step 2 — Tenant Housing Preferences
// ─────────────────────────────────────────────────────────────

export const tenantPreferencesSchema = z.object({
  preferredLocations: z
    .array(z.string())
    .min(1, "Select at least one preferred location"),
  preferredTypes: z
    .array(z.string())
    .min(1, "Select at least one property type"),
  budgetMin: z.coerce.number().min(0).optional(),
  budgetMax: z.coerce
    .number()
    .min(1, "Enter your maximum monthly budget")
    .optional(),
  moveInDate: z.string().optional(),
});

export type TenantPreferencesData = z.infer<typeof tenantPreferencesSchema>;

// ─────────────────────────────────────────────────────────────
// Step 3 — Tenant Employment & Income
// ─────────────────────────────────────────────────────────────

export const tenantEmploymentSchema = z.object({
  employmentType: employmentTypeEnum,
  employerName: z.string().optional().or(z.literal("")),
  jobTitle: z.string().optional().or(z.literal("")),
  incomeRange: incomeRangeEnum,
});

export type TenantEmploymentData = z.infer<typeof tenantEmploymentSchema>;

// ─────────────────────────────────────────────────────────────
// Step 2 — Landlord Business Info
// ─────────────────────────────────────────────────────────────

export const landlordBusinessSchema = z.object({
  businessName: z.string().optional().or(z.literal("")),
  propertyCount: z.coerce
    .number()
    .int()
    .min(1, "Enter how many properties you manage"),
  propertyTypesOffered: z
    .array(z.string())
    .min(1, "Select at least one property type"),
});

export type LandlordBusinessData = z.infer<typeof landlordBusinessSchema>;

// ─────────────────────────────────────────────────────────────
// Step 3 — Landlord Payout Setup
// ─────────────────────────────────────────────────────────────

export const landlordPayoutSchema = z.object({
  bankName: z.string().min(1, "Select your bank"),
  accountNumber: z
    .string()
    .length(10, "Account number must be 10 digits")
    .regex(/^\d+$/, "Account number must contain only digits"),
  accountName: z.string().min(2, "Enter the account name"),
});

export type LandlordPayoutData = z.infer<typeof landlordPayoutSchema>;

// ─────────────────────────────────────────────────────────────
// Combined API payload schemas
// ─────────────────────────────────────────────────────────────

export const completeTenantOnboardingSchema = z.object({
  role: z.literal("Tenant"),
  personal: personalDetailsSchema,
  preferences: tenantPreferencesSchema,
  employment: tenantEmploymentSchema,
});

export const completeLandlordOnboardingSchema = z.object({
  role: z.literal("Landlord"),
  personal: personalDetailsSchema,
  business: landlordBusinessSchema,
  payout: landlordPayoutSchema,
});

export const completeOnboardingSchema = z.discriminatedUnion("role", [
  completeTenantOnboardingSchema,
  completeLandlordOnboardingSchema,
]);

export type CompleteOnboardingPayload = z.infer<typeof completeOnboardingSchema>;

const personalDraftSchema = z.object({
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  phone: z.string().max(30).optional(),
  nin: z.string().regex(/^\d*$/, "NIN must contain only digits").max(11).optional(),
});
const tenantPreferencesDraftSchema = z.object({
  preferredLocations: z.array(z.string().max(80)).max(20).optional(),
  preferredTypes: z.array(z.string().max(80)).max(20).optional(),
  budgetMin: z.coerce.number().min(0).optional(),
  budgetMax: z.coerce.number().min(0).optional(),
  moveInDate: z.string().max(30).optional(),
});
const tenantEmploymentDraftSchema = z.object({
  employmentType: employmentTypeEnum.optional(),
  employerName: z.string().max(120).optional(),
  jobTitle: z.string().max(120).optional(),
  incomeRange: incomeRangeEnum.optional(),
});
const landlordBusinessDraftSchema = z.object({
  businessName: z.string().max(160).optional(),
  propertyCount: z.coerce.number().int().min(0).optional(),
  propertyTypesOffered: z.array(z.string().max(80)).max(20).optional(),
});
const landlordPayoutDraftSchema = z.object({
  bankName: z.string().max(100).optional(),
  accountNumber: z.string().regex(/^\d*$/).max(10).optional(),
  accountName: z.string().max(160).optional(),
});

export const onboardingDraftSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("Tenant"),
    currentStep: z.number().int().min(0).max(2),
    personal: personalDraftSchema.optional(),
    preferences: tenantPreferencesDraftSchema.optional(),
    employment: tenantEmploymentDraftSchema.optional(),
  }),
  z.object({
    role: z.literal("Landlord"),
    currentStep: z.number().int().min(0).max(2),
    personal: personalDraftSchema.optional(),
    business: landlordBusinessDraftSchema.optional(),
    payout: landlordPayoutDraftSchema.optional(),
  }),
]);

export type OnboardingDraftPayload = z.infer<typeof onboardingDraftSchema>;
