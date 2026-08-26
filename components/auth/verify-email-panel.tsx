"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { z } from "zod";
import { authClient } from "@/lib/neon-auth-client";
import { Check, Shield, Verified } from "@/components/shared/icons";
import { Input } from "@/components/ui/form-controls";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { getInternalRedirectPath } from "@/lib/security/internal-redirect";

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
  const autoSendStartedRef = useRef(false);
  const sendInFlightRef = useRef(false);
  const emailFromQuery = searchParams.get("email") || "";
  const codeWasAlreadySent = searchParams.get("sent") === "1";
  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(
    codeWasAlreadySent ? "We sent a 6-digit code to your email." : "",
  );
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [sentFor, setSentFor] = useState(codeWasAlreadySent ? emailFromQuery : "");
  const [autoSent, setAutoSent] = useState(codeWasAlreadySent);
  const [resendSeconds, setResendSeconds] = useState(codeWasAlreadySent ? 60 : 0);

  const next = getInternalRedirectPath(searchParams.get("next"), "/dashboard");
  const emailFromSession = session.data?.user.email || "";
  const resolvedEmail = email ?? (emailFromQuery || emailFromSession);
  const resolvedToken = token || searchParams.get("token") || "";
  const otp = code.join("");

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (session.isPending || autoSent) return;
    if (!resolvedEmail) return;
    if (sentFor === resolvedEmail) return;
    if (resolvedToken) return;
    if (autoSendStartedRef.current || sendInFlightRef.current) return;

    autoSendStartedRef.current = true;
    sendInFlightRef.current = true;
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
      sendInFlightRef.current = false;
      setCodeLoading(false);
      if (result.error) {
        setResendSeconds(resData.data?.retryAfterSeconds || 0);
        setError(result.error.message || "Unable to send verification code");
        toastError("Verification code failed", result.error.message || "Unable to send verification code");
        return;
      }
      setSentFor(resolvedEmail);
      setAutoSent(true);
      setResendSeconds(resData.data?.retryAfterSeconds || 60);
      setStatus("We sent a 6-digit code to your email.");
      toastSuccess("Verification code sent", "Check your inbox for the code.");
    };
    void sendCode();
    return () => {
      active = false;
      sendInFlightRef.current = false;
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
    if (sendInFlightRef.current || codeLoading || resendSeconds > 0) return;
    const parsed = emailSchema.safeParse({ email: resolvedEmail });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Enter your email");
      toastError("Invalid email", parsed.error.issues[0]?.message || "Enter your email");
      return;
    }

    setError("");
    setStatus("");
    sendInFlightRef.current = true;
    setCodeLoading(true);
    let resData: { success: boolean; data?: { retryAfterSeconds?: number }; message?: string };
    try {
      const res = await fetch("/api/auth/custom/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.data.email }),
      });
      resData = await res.json();
    } finally {
      sendInFlightRef.current = false;
      setCodeLoading(false);
    }
    const result = {
      data: resData.data,
      error: resData.success ? null : { message: resData.message },
    };

    if (result.error) {
      setResendSeconds(resData.data?.retryAfterSeconds || 0);
      setError(result.error.message || "Unable to send verification code");
      toastError("Verification code failed", result.error.message || "Unable to send verification code");
      return;
    }

    setSentFor(parsed.data.email);
    setAutoSent(true);
    setResendSeconds(result.data?.retryAfterSeconds || 60);
    setStatus("We sent another 6-digit code. Check your inbox.");
    toastSuccess("Verification code sent", "Check your inbox for the code.");
  };

  return (
    <div className="space-y-5">
      <div className="border border-forest-200 bg-forest-50 p-4 text-sm text-forest-900">
        <div className="flex items-start gap-2">
          <Verified className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Enter the 6-digit code sent to your email to finish verification and continue.</p>
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-700">Email</span>
        <Input
          value={resolvedEmail}
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
          className="border border-line bg-sand-100 px-4 py-4 text-sm text-muted"
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
            <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {status && (
            <div role="status" className="border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-900">
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{status}</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => void verifyCode()}
            className="stitch-button w-full disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify email"}
          </button>

          <button
            type="button"
            onClick={() => void resend()}
            disabled={codeLoading || resendSeconds > 0}
            className="stitch-button stitch-button-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend 6-digit code"}
          </button>
        </>
      )}

      <div className="grid gap-3 border border-line bg-sand-100 p-4 text-sm text-muted">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brandgreen-600" />
          <p>Unverified users are routed here automatically until the code is confirmed.</p>
        </div>
      </div>
    </div>
  );
}
