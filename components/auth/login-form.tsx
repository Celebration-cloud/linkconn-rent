"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { motion } from "framer-motion";
import { authClient } from "@/lib/neon-auth-client";
import { Check, Sparkle } from "@/components/shared/icons";
import { LockKeyhole, Mail } from "lucide-react";
import { Input } from "@/components/ui/form-controls";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session.data) {
      router.replace(searchParams.get("next") || "/dashboard");
    }
  }, [router, searchParams, session.data]);

  const next = searchParams.get("next") || "/dashboard";

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
        }),
      });

      const resData = await res.json();
      const result = {
        data: resData.data,
        error: resData.success ? null : { message: resData.message },
      };

      if (result.error) {
        setError(result.error.message || "Unable to sign in");
        return;
      }

      if (!result.data.user.emailVerified) {
        router.push(`/verify-email?email=${encodeURIComponent(parsed.data.email)}&next=${encodeURIComponent(next)}`);
        return;
      }

      router.push(result.data?.url || next);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
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
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={loading}
        className="stitch-button w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Signing in..." : "Sign in"}
      </motion.button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => router.push(`/forgot-password?next=${encodeURIComponent(next)}`)}
          className="min-h-11 font-bold text-forest-700 hover:underline"
        >
          Forgot password?
        </button>
        <span className="inline-flex items-center gap-1 text-muted">
          <Sparkle className="h-4 w-4 text-forest-600" />
          Email only
        </span>
      </div>

      <div className="rounded-lg border border-forest-100 bg-forest-50 px-4 py-3 text-sm text-forest-900">
        <div className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Guest sessions redirect into the dashboard after sign in.</p>
        </div>
      </div>
    </form>
  );
}
