"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/form-controls";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
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
      setError(parsed.error.issues[0]?.message || "Enter your registered email");
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

    setSuccess(result.data?.message || "We sent a secure password reset link to your email.");
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-forest-950">Registered email address</span>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          placeholder="e.g. name@example.com"
          leadingIcon={Mail}
          required
        />
      </label>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 flex items-start gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{success}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="stitch-button w-full justify-center py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
      >
        {loading ? "Sending reset instructions..." : "Send Password Reset Link"}
      </button>

      <div className="rounded-lg border border-forest-100 bg-forest-50/70 p-3 text-xs text-forest-950">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-forest-700" />
          <p className="leading-relaxed">
            We will send a one-time cryptographic token to your registered email to safely reset your credentials.
          </p>
        </div>
      </div>
    </form>
  );
}
