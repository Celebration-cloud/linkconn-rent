import { z } from "zod";

// Common fields
const baseSchema = {
  fullName: z.string().min(1, "Full Name is required"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().min(5, "Address is required"),
  profilePic: z.any().optional(),
};

// Landlord-specific
export const landlordSchema = z.object({
  ...baseSchema,
  role: z.literal("landlord"),
  companyName: z.string().min(1, "Company Name is required"),
});



// Tenant-specific
export const tenantSchema = z.object({
  ...baseSchema,
  role: z.literal("tenant"),
  preferredLocation: z.string().optional(),
  budgetRange: z.string().optional(),
  moveInDate: z.string().optional(),
});

// Unified schema for form resolver (no nulls, smart merging)
export const signupSchema = z.discriminatedUnion("role", [
  landlordSchema,
  tenantSchema,
]);

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password required"),
  role: z.enum(["landlord", "tenant"]),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email"),
});

export const postSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
  author_id: z.string(),
});
export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  email: z.email(),
  created_at: z.string().optional(),
});
export const commentSchema = z.object({
  post_id: z.string(),
  author_id: z.string(),
  content: z.string().min(1),
  created_at: z.string().optional(),
});
export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.email().optional(),
});
export const aiRequestSchema = z.object({
  prompt: z.string().min(1),
  model: z.string().optional(),
});
export const aiResponseSchema = z.object({
  response: z.string(),
  model: z.string(),
  created_at: z.string().optional(),
});
export const fileSchema = z.object({
  filename: z.string().min(1),
  url: z.url(),
  size: z.number().nonnegative(),
  uploaded_at: z.string().optional(),
});
export const workerTaskSchema = z.object({
  task_id: z.string(),
  status: z.enum(["pending", "in_progress", "completed", "failed"]),
  result: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
export const filterSchema = z.object({
  searchTerm: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export const listingSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(0),
  ownerId: z.string(), // uuid or string id
  images: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
});

export const bookingSchema = z.object({
  id: z.string().optional(),
  listingId: z.string(),
  userId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(["pending", "confirmed", "cancelled"]).default("pending"),
});

// ==========================
// Onboarding Validation Schemas
// Built with Zod
// ==========================

// These schemas handle validation for Landlord, and Tenant onboarding flows.
// Each schema enforces strict field validation for form reliability and backend consistency.

// ==========================
// LANDLORD SCHEMAS
// ==========================

// 1. Identity Verification
// Used for landlord onboarding step to verify identity and property ownership.
export const landlordIdentitySchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  phone: z.string().regex(/^0\d{10}$/, "Enter a valid 11-digit phone number"),
  address: z.string().min(10, "Full address required"),
  idType: z.string().nonempty("Select an ID type"),
  idFile: z
    .any()
    .refine(
      (files) => files && files.length === 1,
      "Upload your government ID"
    ),
  landDoc: z
    .any()
    .refine(
      (files) => files && files.length === 1,
      "Upload your verified land document"
    ),
});

// 2. Property Details
// Used when a landlord is listing or registering a property.
export const landlordPropertySchema = z.object({
  title: z.string().min(5, "Property title is required"),
  type: z.string().nonempty("Select a property type"),
  address: z.string().min(10, "Full property address required"),
  price: z.string().regex(/^\d+$/, "Enter a valid price"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  images: z
    .any()
    .refine(
      (files) => files && files.length >= 3,
      "Upload at least three images"
    )
    .refine((files) => files && files.length <= 5, "Max 5 images allowed"),
});

// 3. Payout Setup
// Used for landlord payment details and ownership verification.
export const landlordPayoutSchema = z.object({
  bank: z.string().min(1, "Select your bank"),
  accountNumber: z.string().length(10, "Account number must be 10 digits"),
  accountName: z.string().min(3, "Account name is required"),
  confirmOwnership: z.literal(true, {
    errorMap: () => ({ message: "Confirm this account is yours" }),
  }),
});

// ==========================
// TENANT SCHEMAS
// ==========================

// 1. Identity Verification
// Used to validate tenant identity and uploaded ID documents.
export const tenantIdentitySchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  phone: z.coerce.number().min(10, "Valid phone number required"),
  address: z.string().min(5, "Address is required"),
  idType: z.enum(["NIN", "Driver’s License", "Voter’s Card"], {
    required_error: "Select an ID type",
  }),
  idUpload: z
    .any()
    .refine((file) => file?.length >= 1, "Upload a valid ID document"),
  confirm: z.literal(true, {
    errorMap: () => ({ message: "You must confirm the accuracy of details" }),
  }),
});

// 2. Employment & Financial Details
// Used to verify tenant’s income, occupation, and employment status.
export const tenantEmploymentSchema = z.object({
  employmentStatus: z.enum(["Employed", "Self-employed", "Unemployed"], {
    required_error: "Select your employment status",
  }),
  companyName: z.string().optional(),
  monthlyIncome: z.string().min(3, "Enter your monthly income"),
  occupation: z.string().min(3, "Occupation is required"),
  payslip: z
    .any()
    .refine(
      (file) => file?.length >= 1,
      "Upload at least one document (payslip, proof of income)"
    ),
  confirm: z.literal(true, {
    errorMap: () => ({
      message: "You must confirm your financial details are accurate",
    }),
  }),
});

// 3. Rent Preferences
// Used to capture tenant preferences for housing search recommendations.
export const tenantPreferenceSchema = z
  .object({
    location: z.string().min(2, "Preferred location is required"),
    minBudget: z.number().min(1000, "Enter a valid minimum budget"),
    maxBudget: z.number().min(1000, "Enter a valid maximum budget"),
    propertyType: z.string().min(1, "Select a property type"),
    moveInDate: z.string().min(1, "Select a move-in date"),
    agreeToPolicy: z.boolean().refine((val) => val === true, {
      message: "You must agree to tenancy policy",
    }),
  })
  .refine((data) => data.maxBudget > data.minBudget, {
    path: ["maxBudget"],
    message: "Max budget must be higher than Min budget",
  });
