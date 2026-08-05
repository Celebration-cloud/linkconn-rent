import { z } from "zod";

const optionalNumber = z.coerce.number().finite().optional();

const optionalBoolean = z.preprocess((value) => {
  if (value === undefined || value === "") return undefined;
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  return value;
}, z.boolean().optional());

const commaSeparated = (maximum: number) =>
  z
    .union([z.string(), z.array(z.string())])
    .transform((value) => {
      const values = Array.isArray(value) ? value : value.split(",");
      return [...new Set(values.map((item) => item.trim()).filter(Boolean))];
    })
    .refine((value) => value.length <= maximum, {
      message: `Choose no more than ${maximum} options`,
    })
    .optional();

export const propertySearchSchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    location: z.string().trim().max(120).optional(),
    type: z.string().trim().max(60).optional(),
    types: commaSeparated(10),
    minPrice: optionalNumber,
    maxPrice: optionalNumber,
    bedrooms: z.coerce.number().int().min(0).max(20).optional(),
    bathrooms: z.coerce.number().int().min(0).max(20).optional(),
    verified: optionalBoolean,
    period: z.enum(["month", "year"]).optional(),
    sort: z
      .enum([
        "recommended",
        "newest",
        "lowest-rent",
        "highest-rent",
        "lowest-move-in",
      ])
      .transform((value) =>
        value === "lowest-move-in" ? ("recommended" as const) : value,
      )
      .optional(),
    amenities: commaSeparated(20),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(200).default(12),
    mode: z.enum(["list", "map"]).default("list"),
    north: z.coerce.number().min(-90).max(90).optional(),
    south: z.coerce.number().min(-90).max(90).optional(),
    east: z.coerce.number().min(-180).max(180).optional(),
    west: z.coerce.number().min(-180).max(180).optional(),
  })
  .superRefine((input, context) => {
    if (
      input.minPrice !== undefined &&
      input.maxPrice !== undefined &&
      input.minPrice > input.maxPrice
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum price cannot exceed maximum price",
        path: ["minPrice"],
      });
    }
    if (
      input.north !== undefined &&
      input.south !== undefined &&
      input.north < input.south
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "North bound must be above south bound",
        path: ["north"],
      });
    }
    {
      const { north, south, east, west } = input;
      const values = [north, south, east, west];
      const complete =
        values.every((value) => value === undefined) ||
        values.every((value) => value !== undefined);
      if (!complete) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "All four map bounds are required",
          path: ["north"],
        });
      }
    }
    if (input.mode === "list" && input.pageSize > 24) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "List pages can contain at most 24 properties",
        path: ["pageSize"],
      });
    }
  });

export const savedPropertySchema = z.object({
  propertyId: z.string().uuid(),
});

export const applicationCreateSchema = z.object({
  propertyId: z.string().uuid(),
  message: z.string().trim().max(800).optional(),
});

export const applicationDecisionSchema = z.object({
  status: z.enum(["Shortlisted", "Accepted", "Declined"]),
});

export const viewingCreateSchema = z.object({
  propertyId: z.string().uuid(),
  scheduledAt: z.coerce.date().refine((value) => value.getTime() > Date.now(), {
    message: "Viewing time must be in the future",
  }),
  note: z.string().trim().max(500).optional(),
});

export const conversationCreateSchema = z.object({
  propertyId: z.string().uuid(),
  applicationId: z.string().uuid().optional(),
});

export const messageCreateSchema = z.object({
  body: z.string().trim().min(1).max(4000),
  clientId: z.string().trim().max(100).optional(),
});

export const messageCursorSchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(40),
});

export const propertyDraftSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(4).max(120),
  type: z.string().trim().min(2).max(60),
  location: z.string().trim().min(4).max(160),
  city: z.string().trim().min(2).max(80),
  description: z.string().trim().min(20).max(5000),
  price: z.coerce.number().nonnegative(),
  period: z.enum(["month", "year"]).default("year"),
  bedrooms: z.coerce.number().int().min(0).max(30),
  bathrooms: z.coerce.number().int().min(0).max(30),
  toilets: z.coerce.number().int().min(0).max(30),
  area: z.coerce.number().nonnegative(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  images: z
    .array(
      z.string().refine(
        (value) => value.startsWith("/") || URL.canParse(value),
        "Use a valid image URL or local asset path",
      ),
    )
    .max(20)
    .default([]),
  amenities: z.array(z.string().trim().min(1).max(80)).max(50).default([]),
  houseRules: z.array(z.string().trim().min(1).max(120)).max(30).default([]),
  cautionFee: z.coerce.number().nonnegative().default(0),
  legalFee: z.coerce.number().nonnegative().default(0),
  agencyFee: z.coerce.number().nonnegative().default(0),
  serviceCharge: z.coerce.number().nonnegative().default(0),
  publish: z.boolean().default(false),
});

export const propertyFeesSchema = z.object({
  price: z.coerce.number().positive(),
  period: z.enum(["month", "year"]),
  cautionFee: z.coerce.number().nonnegative(),
  legalFee: z.coerce.number().nonnegative(),
  agencyFee: z.coerce.number().nonnegative(),
  serviceCharge: z.coerce.number().nonnegative(),
});

export const verificationDraftSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["Identity", "PropertyOwnership"]),
  propertyId: z.string().uuid().optional(),
  documentType: z.string().trim().min(2).max(80),
  note: z.string().trim().max(1000).optional(),
  documents: z
    .array(
      z.object({
        fileName: z.string().trim().min(1).max(255),
        storageKey: z.string().trim().max(500).optional(),
        mimeType: z.string().trim().max(120).optional(),
        size: z.number().int().nonnegative().optional(),
      }),
    )
    .max(12)
    .default([]),
  submit: z.boolean().default(false),
});

export const supportTicketSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(180),
  category: z.enum([
    "Tenant",
    "Landlord",
    "Verification",
    "Payment",
    "Viewing",
    "Lease",
    "Maintenance",
    "Dispute",
    "Security",
  ]),
  subject: z.string().trim().min(4).max(160),
  message: z.string().trim().min(20).max(4000),
});

export type PropertySearchInput = z.infer<typeof propertySearchSchema>;
export type PropertyDraftInput = z.infer<typeof propertyDraftSchema>;
export type PropertyFeesInput = z.infer<typeof propertyFeesSchema>;
export type VerificationDraftInput = z.infer<typeof verificationDraftSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
