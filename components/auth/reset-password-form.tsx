"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
      setError("Missing reset token. Please open the exact link from your email.");
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

    setSuccess("Password updated successfully! Redirecting to sign in...");
    setTimeout(() => {
      router.push(next);
    }, 1500);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block relative">
        <span className="mb-1.5 block text-xs font-bold text-forest-950">New password</span>
        <div className="relative">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            leadingIcon={LockKeyhole}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-forest-950">Confirm new password</span>
        <Input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat your password"
          leadingIcon={LockKeyhole}
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
        {loading ? "Updating password..." : "Set New Password"}
      </button>

      <div className="rounded-lg border border-forest-100 bg-forest-50/70 p-3 text-xs text-forest-950">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-forest-700" />
          <p className="leading-relaxed">
            Ensure your new password contains at least 8 characters with a mix of letters and numbers for maximum account security.
          </p>
        </div>
      </div>
    </form>
  );
}
