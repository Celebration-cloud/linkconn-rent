"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { z } from "zod";
import { authClient } from "@/lib/neon-auth-client";
import { CheckCircle2, Clock, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/form-controls";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { getInternalRedirectPath } from "@/lib/security/internal-redirect";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
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
    codeWasAlreadySent ? "We sent a 6-digit verification code to your email." : "",
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

    if (autoSendStartedRef.current) return;
    autoSendStartedRef.current = true;

    let active = true;
    const run = async () => {
      setCodeLoading(true);
      setError("");
      setStatus("");
      let resData: { success: boolean; data?: { retryAfterSeconds?: number }; message?: string };
      try {
        const res = await fetch("/api/auth/custom/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resolvedEmail }),
        });
        resData = await res.json();
      } finally {
        if (active) setCodeLoading(false);
      }
      if (!active) return;
      const result = {
        data: resData.data,
        error: resData.success ? null : { message: resData.message },
      };
      if (result.error) {
        setResendSeconds(resData.data?.retryAfterSeconds || 0);
        setError(result.error.message || "Unable to send verification code");
        return;
      }
      setSentFor(resolvedEmail);
      setAutoSent(true);
      setResendSeconds(result.data?.retryAfterSeconds || 60);
      setStatus("We sent a 6-digit verification code to your email.");
    };
    void run();
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

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length > 0) {
      const nextCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        nextCode[i] = pastedData[i] || "";
      }
      setCode(nextCode);
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
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
<<<<<<< HEAD
      <div className="rounded-xl border border-forest-200 bg-forest-50 p-4 text-xs text-forest-950">
        <div className="flex items-start gap-2.5">
          <Mail className="size-4 shrink-0 text-forest-700 mt-0.5" />
          <p className="leading-relaxed">
            Enter the 6-digit confirmation code sent to your email to verify account ownership.
          </p>
=======
      <div className="border border-forest-200 bg-forest-50 p-4 text-sm text-forest-900">
        <div className="flex items-start gap-2">
          <Verified className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Enter the 6-digit code sent to your email to finish verification and continue.</p>
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-forest-950">Email destination</span>
        <Input
          value={resolvedEmail}
          onChange={(e) => {
            setEmail(e.target.value);
            setAutoSent(false);
            setSentFor("");
          }}
          type="email"
          autoComplete="email"
          placeholder="e.g. name@example.com"
          leadingIcon={Mail}
        />
      </label>

      {codeLoading ? (
        <motion.div
<<<<<<< HEAD
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="rounded-xl border border-[#d6ddd5] bg-[#f8faf7] p-4 text-center text-xs font-bold text-forest-800 flex items-center justify-center gap-2"
=======
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.3, repeat: Infinity }}
          className="border border-line bg-sand-100 px-4 py-4 text-sm text-muted"
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
        >
          <RefreshCw className="size-4 animate-spin" />
          Dispatching 6-digit verification code...
        </motion.div>
      ) : (
        <>
          <div className="space-y-2">
            <span className="block text-xs font-bold text-forest-950">Enter 6-Digit Code</span>
            <div className="grid grid-cols-6 gap-2">
              {code.map((value, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    inputRefs.current[index] = node;
                  }}
                  value={value}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  aria-label={`Digit ${index + 1}`}
                  className="h-13 text-center text-xl font-black tabular-nums border border-[#d6ddd5] bg-[#f8faf7] focus:bg-white focus:border-forest-800 focus:outline-none rounded-lg"
                />
              ))}
            </div>
          </div>

          {error && (
<<<<<<< HEAD
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
=======
            <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
              {error}
            </div>
          )}

          {status && (
<<<<<<< HEAD
            <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{status}</p>
=======
            <div role="status" className="border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-900">
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{status}</p>
              </div>
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={() => void verifyCode()}
<<<<<<< HEAD
            className="stitch-button w-full justify-center py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
=======
            className="stitch-button w-full disabled:cursor-not-allowed disabled:opacity-70"
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying Code..." : "Confirm & Access Account"}
          </motion.button>

          <button
            type="button"
            onClick={() => void resend()}
            disabled={codeLoading || resendSeconds > 0}
<<<<<<< HEAD
            className="w-full py-2.5 text-xs font-bold text-forest-800 bg-[#edf1eb] hover:bg-[#e2e8df] border border-[#d6ddd5] rounded-lg transition disabled:opacity-60 flex items-center justify-center gap-1.5"
=======
            className="stitch-button stitch-button-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
          >
            <Clock className="size-3.5" />
            {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend 6-digit code"}
          </button>
        </>
      )}

<<<<<<< HEAD
      <div className="rounded-xl border border-forest-100 bg-forest-50/70 p-3.5 text-xs text-forest-950">
=======
      <div className="grid gap-3 border border-line bg-sand-100 p-4 text-sm text-muted">
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-forest-700" />
          <p className="leading-relaxed">
            Can&apos;t find the email? Check your spam/promotions tab or ensure your address was entered accurately.
          </p>
        </div>
      </div>
    </div>
  );
}
