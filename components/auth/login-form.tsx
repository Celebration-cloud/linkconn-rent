"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { motion } from "framer-motion";
import { Check, Sparkle } from "@/components/shared/icons";
import { LockKeyhole, Mail } from "lucide-react";
import { Input } from "@/components/ui/form-controls";
import { getInternalRedirectPath } from "@/lib/security/internal-redirect";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormProps = {
  portal?: "public" | "admin";
  defaultDestination?: string;
  forgotPasswordHref?: string;
};

export default function LoginForm({
  portal = "public",
  defaultDestination = "/dashboard",
  forgotPasswordHref = "/forgot-password",
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const next = getInternalRedirectPath(searchParams.get("next"), defaultDestination);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Check your credentials");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/custom/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: parsed.data.email,
          password: parsed.data.password,
          callbackURL: next,
          portal,
        }),
      });

      const resData = await res.json();
      const result = {
        data: resData.data,
        error: resData.success ? null : { message: resData.message },
      };

      if (result.error) {
        setError(result.error.message || "Unable to sign in");
        setLoading(false);
        return;
      }

      if (!result.data.user.emailVerified) {
        router.replace(`/verify-email?email=${encodeURIComponent(parsed.data.email)}&next=${encodeURIComponent(next)}`);
        return;
      }

      // Authentication changes the session cookie. A document navigation makes
      // the first protected request read that new cookie instead of reusing a
      // stale prefetched RSC/session response from the login page.
      window.location.replace(result.data?.url || next);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-forest-900">Email address</span>
        <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            leadingIcon={Mail}
          />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-forest-900">Password</span>
        <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            leadingIcon={LockKeyhole}
          />
      </label>

      {error && (
        <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={loading}
        className="stitch-button w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Signing in and checking account…" : "Sign in"}
      </motion.button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => router.push(`${forgotPasswordHref}?next=${encodeURIComponent(next)}`)}
          className="min-h-11 font-bold text-forest-700 hover:underline"
        >
          Reset password
        </button>
        <span className="inline-flex items-center gap-1 text-muted">
          <Sparkle className="h-4 w-4 text-forest-600" />
          Email only
        </span>
      </div>

      <div className="border border-forest-100 bg-forest-50 px-4 py-3 text-sm text-forest-900">
        <div className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <p>We check your account status before opening the correct workspace.</p>
        </div>
      </div>
    </form>
  );
}
