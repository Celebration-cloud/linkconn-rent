import { z } from "zod";

export const maintenanceCreateSchema = z.object({
  propertyId: z.string().uuid(),
  title: z.string().trim().min(4).max(140),
  description: z.string().trim().min(10).max(3000),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
});

export const maintenanceListQuerySchema = z.object({
  status: z.enum(["Pending", "InProgress", "Completed", "Closed"]).optional(),
});

export const maintenanceUpdateSchema = z.object({
  status: z.enum(["Pending", "InProgress", "Completed", "Closed"]).optional(),
  note: z.string().trim().min(2).max(2000).optional(),
}).refine((value) => value.status || value.note, "Provide a status or note");

export const propertyActionSchema = z.object({
  action: z.enum(["publish", "archive", "duplicate"]),
});

export const paymentInitializeSchema = z.object({
  channel: z.enum(["card", "bank", "ussd"]).default("card"),
});

export const paymentVerifySchema = z.object({
  reference: z.string().trim().min(6).max(120),
});
