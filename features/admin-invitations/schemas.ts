import { z } from "zod";

export const adminInvitationEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(254),
});

export const adminInvitationTokenSchema = z.object({
  token: z.string().min(32, "Invitation token is invalid").max(256),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(1024),
    newPassword: z.string().min(12, "New password must be at least 12 characters").max(1024),
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: "Choose a new password that differs from the current password",
    path: ["newPassword"],
  });

export function normalizeInvitationEmail(email: string) {
  return email.trim().toLowerCase();
}

