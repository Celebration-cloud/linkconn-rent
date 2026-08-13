"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";
import { z } from "zod";
import { Input } from "@/features/auth/input";
import { changePasswordSchema } from "@/features/admin-invitations/schemas";
import { toastError, toastSuccess } from "@/stores/toast-store";

const changePasswordFormSchema = z
  .intersection(
    changePasswordSchema,
    z.object({ confirmPassword: z.string() }),
  )
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "The new passwords do not match.",
  });

export function DashboardSecurityForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = changePasswordFormSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!parsed.success) {
      toastError(
        "Password not changed",
        parsed.error.issues[0]?.message || "Check the password fields and try again.",
      );
      return;
    }

    setChanging(true);
    try {
      const response = await fetch("/api/auth/custom/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: parsed.data.currentPassword,
          newPassword: parsed.data.newPassword,
        }),
      });
      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };
      if (!response.ok || !result.success) {
        toastError("Password not changed", result.message || "Try again in a moment.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toastSuccess("Password updated", "Other sessions have been revoked.");
    } catch {
      toastError("Password not changed", "Check your connection and try again.");
    } finally {
      setChanging(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl border border-line bg-white p-5 sm:p-7">
      <div className="flex items-start gap-3 border-b border-line pb-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-forest-100 text-forest-800">
          <KeyRound className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold tracking-[-0.02em] text-ink">Change password</h2>
          <p className="mt-1 max-w-[65ch] text-sm leading-6 text-muted">
            Use at least 12 characters. Updating your password revokes your other authenticated sessions.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Input label="Current password" type="password" value={currentPassword} onChange={setCurrentPassword} showPasswordToggle required autoComplete="current-password" />
        <Input label="New password" type="password" value={newPassword} onChange={setNewPassword} showPasswordToggle required autoComplete="new-password" />
        <Input label="Confirm new password" type="password" value={confirmPassword} onChange={setConfirmPassword} showPasswordToggle required autoComplete="new-password" />
        <button type="submit" disabled={changing} className="stitch-button w-full disabled:cursor-wait disabled:opacity-60 sm:w-auto">
          {changing ? "Updating password…" : (
            <><CheckCircle2 className="size-4" aria-hidden="true" /> Update password</>
          )}
        </button>
      </form>
    </section>
  );
}
