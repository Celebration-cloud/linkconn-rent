"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { motion } from "framer-motion";
import { Check, Sparkle } from "@/components/shared/icons";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
        <span className="mb-1.5 block text-xs font-bold text-forest-950">Email address</span>
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

      <label className="block relative">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-forest-950">Password</span>
          <button
            type="button"
            onClick={() => router.push(`${forgotPasswordHref}?next=${encodeURIComponent(next)}`)}
            className="text-xs font-bold text-forest-700 hover:text-forest-950 hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            leadingIcon={LockKeyhole}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </label>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={loading}
        className="stitch-button w-full justify-center py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
      >
        {loading ? "Authenticating & verifying workspace…" : "Sign In to Account"}
      </motion.button>

      <div className="rounded-lg border border-forest-100 bg-forest-50/70 p-3 text-xs text-forest-950">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-forest-700" />
          <p className="leading-relaxed">
            Your role (Tenant, Landlord, or Property Manager) is automatically detected to load the appropriate dashboard tools.
          </p>
        </div>
      </div>
    </form>
  );
}
