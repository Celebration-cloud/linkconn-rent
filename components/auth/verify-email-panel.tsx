"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { z } from "zod";
import { authClient } from "@/lib/neon-auth-client";
import { Check, Shield, Verified } from "@/components/shared/icons";
import { Input } from "@/components/ui/form-controls";
import { toastError, toastSuccess } from "@/stores/toast-store";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type Props = {
  token?: string;
};

export default function VerifyEmailPanel({ token }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = authClient.useSession();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [sentFor, setSentFor] = useState("");
  const [autoSent, setAutoSent] = useState(false);

  const next = searchParams.get("next") || "/dashboard";
  const emailFromQuery = searchParams.get("email") || "";
  const emailFromSession = session.data?.user.email || "";
  const resolvedEmail = useMemo(() => email || emailFromQuery || emailFromSession, [email, emailFromQuery, emailFromSession]);
  const resolvedToken = token || searchParams.get("token") || "";
  const otp = code.join("");

  useEffect(() => {
    if (emailFromQuery && email !== emailFromQuery) {
      setEmail(emailFromQuery);
    } else if (!emailFromQuery && emailFromSession && !email) {
      setEmail(emailFromSession);
    }
  }, [email, emailFromQuery, emailFromSession]);

  useEffect(() => {
    if (session.isPending || autoSent) return;
    if (!resolvedEmail) return;
    if (sentFor === resolvedEmail) return;
    if (resolvedToken) return;

    let active = true;
    const sendCode = async () => {
      setCodeLoading(true);
      setStatus("");
      const res = await fetch("/api/auth/custom/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resolvedEmail }),
      });
      const resData = await res.json();
      const result = {
        data: resData.data,
        error: resData.success ? null : { message: resData.message },
      };
      if (!active) return;
      setCodeLoading(false);
      if (result.error) {
        setError(result.error.message || "Unable to send verification code");
        toastError("Verification code failed", result.error.message || "Unable to send verification code");
        return;
      }
      setSentFor(resolvedEmail);
      setAutoSent(true);
      setStatus("We sent a 6-digit code to your email.");
      toastSuccess("Verification code sent", "Check your inbox for the code.");
    };
    void sendCode();
    return () => {
      active = false;
    };
  }, [autoSent, resolvedEmail, resolvedToken, sentFor, session.isPending]);

  useEffect(() => {
    if (!resolvedToken || !resolvedEmail) return;
    let active = true;
    const run = async () => {
      setLoading(true);
      const res = await fetch("/api/auth/custom/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: resolvedToken,
          callbackURL: next,
        }),
      });
      const resData = await res.json();
      const result = {
        data: resData.data,
        error: resData.success ? null : { message: resData.message },
      };
      if (!active) return;
      setLoading(false);
      if (result.error) {
        setError(result.error.message || "Verification failed");
        toastError("Verification failed", result.error.message || "Unable to verify code");
        return;
      }
      toastSuccess("Email verified", "Continue to onboarding.");
      router.replace(next);
      router.refresh();
    };
    void run();
    return () => {
      active = false;
    };
  }, [next, resolvedEmail, resolvedToken, router]);

  const updateDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const nextCode = [...prev];
      nextCode[index] = digit;
      return nextCode;
    });
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async () => {
    setError("");
    const parsed = emailSchema.safeParse({ email: resolvedEmail });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Enter your email");
      toastError("Invalid email", parsed.error.issues[0]?.message || "Enter your email");
      return;
    }
    if (otp.length !== 6) {
      setError("Enter the 6-digit code from your email");
      toastError("Invalid code", "Enter the 6-digit code from your email");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/custom/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: parsed.data.email,
        otp,
      }),
    });
    const resData = await res.json();
    const result = {
      data: resData.data,
      error: resData.success ? null : { message: resData.message },
    };
    setLoading(false);

    if (result.error) {
      setError(result.error.message || "Unable to verify code");
      toastError("Verification failed", result.error.message || "Unable to verify code");
      return;
    }

    toastSuccess("Email verified", "Continue to onboarding.");
    router.replace(next);
    router.refresh();
  };

  const resend = async () => {
    const parsed = emailSchema.safeParse({ email: resolvedEmail });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Enter your email");
      toastError("Invalid email", parsed.error.issues[0]?.message || "Enter your email");
      return;
    }

    setError("");
    setStatus("");
    setCodeLoading(true);
    const res = await fetch("/api/auth/custom/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.data.email }),
    });
    const resData = await res.json();
    const result = {
      data: resData.data,
      error: resData.success ? null : { message: resData.message },
    };
    setCodeLoading(false);

    if (result.error) {
      setError(result.error.message || "Unable to send verification code");
      toastError("Verification code failed", result.error.message || "Unable to send verification code");
      return;
    }

    setSentFor(parsed.data.email);
    setAutoSent(true);
    setStatus("We sent another 6-digit code. Check your inbox.");
    toastSuccess("Verification code sent", "Check your inbox for the code.");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-brandgreen-100 bg-brandgreen-50/70 p-4 text-sm text-brandgreen-900">
        <div className="flex items-start gap-2">
          <Verified className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Enter the 6-digit code sent to your email to finish verification and continue.</p>
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-700">Email</span>
        <Input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setAutoSent(false);
            setSentFor("");
          }}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
      </label>

      {codeLoading ? (
        <motion.div
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.3, repeat: Infinity }}
          className="rounded-2xl border border-navy-100 bg-navy-50 px-4 py-4 text-sm text-navy-600"
        >
          Sending verification code...
        </motion.div>
      ) : (
        <>
          <div className="space-y-2">
            <span className="block text-sm font-semibold text-navy-700">6-digit code</span>
            <div className="grid grid-cols-6 gap-2">
              {code.map((value, index) => (
                <Input
                  key={index}
                  ref={(node) => {
                    inputRefs.current[index] = node;
                  }}
                  value={value}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  aria-label={`Digit ${index + 1}`}
                  className="h-12 text-center text-lg font-bold"
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {status && (
            <div className="rounded-2xl border border-brandgreen-200 bg-brandgreen-50 px-4 py-3 text-sm text-brandgreen-900">
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{status}</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => void verifyCode()}
            className="w-full rounded-2xl bg-navy-950 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy-950/15 transition-colors hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify email"}
          </button>

          <button
            type="button"
            onClick={() => void resend()}
            className="w-full rounded-2xl border border-navy-200 bg-white px-4 py-3.5 text-sm font-bold text-navy-900 transition-colors hover:bg-navy-50"
          >
            Resend 6-digit code
          </button>
        </>
      )}

      <div className="grid gap-3 rounded-2xl border border-navy-100 bg-navy-50/70 p-4 text-sm text-navy-600">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brandgreen-600" />
          <p>Unverified users are routed here automatically until the code is confirmed.</p>
        </div>
      </div>
    </div>
  );
}
