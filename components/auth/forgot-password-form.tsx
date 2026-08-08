"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Check, Shield } from "@/components/shared/icons";
import { Input } from "@/components/ui/form-controls";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type ForgotPasswordFormProps = {
  portal?: "public" | "admin";
  redirectTo?: string;
};

export default function ForgotPasswordForm({
  portal = "public",
  redirectTo = "/reset-password",
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Enter your email");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/custom/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: parsed.data.email,
        redirectTo,
        portal,
      }),
    });

    const resData = await res.json();
    const result = {
      data: resData.data,
      error: resData.success ? null : { message: resData.message },
    };
    setLoading(false);

    if (result.error) {
      setError(result.error.message || "Unable to send reset email");
      return;
    }

    setSuccess(result.data?.message || "Check your inbox for the reset link.");
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-700">Email</span>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
      </label>

      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {success && (
        <div role="status" className="rounded-2xl border border-brandgreen-200 bg-brandgreen-50 px-4 py-3 text-sm text-brandgreen-900">
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{success}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-navy-950 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy-950/15 transition-colors hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>

      <div className="rounded-2xl border border-navy-100 bg-navy-50/70 px-4 py-3 text-sm text-navy-600">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brandgreen-600" />
          <p>We’ll send a secure link that returns you to the password reset page.</p>
        </div>
      </div>
    </form>
  );
}
