"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Check, Shield } from "@/components/shared/icons";
import { Input } from "@/components/ui/form-controls";
import { getInternalRedirectPath } from "@/lib/security/internal-redirect";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type Props = {
  token?: string;
  defaultDestination?: string;
};

export default function ResetPasswordForm({ token, defaultDestination = "/login" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const next = getInternalRedirectPath(searchParams.get("next"), defaultDestination);
  const resolvedToken = token || searchParams.get("token") || "";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const parsed = schema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Check your password");
      return;
    }
    if (!resolvedToken) {
      setError("Missing reset token. Open the link from your email.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/custom/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: parsed.data.password,
        token: resolvedToken,
      }),
    });

    const resData = await res.json();
    const result = {
      data: resData.data,
      error: resData.success ? null : { message: resData.message },
    };
    setLoading(false);

    if (!result) {
      setError("Reset endpoint is unavailable.");
      return;
    }

    if (result.error) {
      setError(result.error.message || "Unable to reset password");
      return;
    }

    setSuccess("Password updated. Redirecting to sign in.");
    router.push(next);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-700">New password</span>
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-700">Confirm password</span>
        <Input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
        />
      </label>

      {error && <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {success && (
        <div role="status" className="border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-900">
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{success}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="stitch-button w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Updating..." : "Reset password"}
      </button>

      <div className="border border-line bg-sand-100 px-4 py-3 text-sm text-muted">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brandgreen-600" />
          <p>Use the exact link from your email. It carries the token needed to update your password.</p>
        </div>
      </div>
    </form>
  );
}
