"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardBody, Button, Spinner, Input } from "@heroui/react";
import {
  CheckCircle2,
  XCircle,
  MailCheck,
  LogOut,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { authClient, useSession, getSession } from "@/lib/auth/client";
import { showToast } from "@/components/ui/Toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const { data: session, isPending } = useSession();
  const verificationEmail = emailParam || session?.user?.email || "";

  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error' | 'interactive'
  const [errorMsg, setErrorMsg] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [resending, setResending] = useState(false);

  // OTP Verification States & Refs
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const inputRefs = useRef([]);
  const submittingRef = useRef(false);
  const verifiedRef = useRef(false);
  const otpRef = useRef(otp);

  useEffect(() => {
    async function verify() {
      if (!token) {
        if (!isPending) {
          if (verificationEmail) {
            setStatus("interactive");
          } else {
            setStatus("error");
            setErrorMsg(
              "No active session or verification token found. Please log in.",
            );
          }
        }

        return;
      }

      try {
        const { error } = await authClient.verifyEmail({
          query: {
            token,
          },
        });

        if (error) {
          throw new Error(error.message || "Failed to verify email.");
        }

        setStatus("success");
        showToast({
          title: "Email verified!",
          description: "Your account is now ready. Redirecting...",
          type: "success",
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setErrorMsg(
          err.message || "An unexpected error occurred during verification.",
        );
        showToast({
          title: "Verification failed",
          description: err.message,
          type: "error",
        });
      }
    }

    verify();
  }, [token, router, session, isPending]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];

    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    const pasteDigits = pastedData.slice(0, 6).split("");

    pasteDigits.forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtp(newOtp);

    const focusIndex = Math.min(pasteDigits.length, 5);

    inputRefs.current[focusIndex]?.focus();
  };

  useEffect(() => {
    otpRef.current = otp;
  }, [otp]);

  const handleVerifyOtp = useCallback(
    async (codeToVerify) => {
      if (verifiedRef.current) return;

      const code = codeToVerify ?? otpRef.current.join("");

      if (code.length !== 6) {
        showToast({
          title: "Invalid Code",
          description: "Please enter all 6 digits of the verification code.",
          type: "error",
        });

        return;
      }

      const emailToUse = verificationEmail;

      if (!emailToUse) {
        showToast({
          title: "Missing Email",
          description: "Could not identify email address to verify.",
          type: "error",
        });
        setVerifyingOtp(false);
        return;
      }

      if (submittingRef.current) {
        return;
      }

      submittingRef.current = true;
      setVerifyingOtp(true);
      try {
        const { error } = await authClient.emailOtp.verifyEmail({
          email: emailToUse,
          otp: code,
        });

        if (error) {
          throw new Error(
            error.message || "Failed to verify email using code.",
          );
        }

        verifiedRef.current = true;
        setStatus("success");
        showToast({
          title: "Email verified!",
          description: "Your account is now ready. Redirecting...",
          type: "success",
        });

        await getSession();

        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (err) {
        console.error("Verification error:", err);
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
        showToast({
          title: "Verification failed",
          description: err.message,
          type: "error",
        });
      } finally {
        setVerifyingOtp(false);
        submittingRef.current = false;
      }
    },
    [session, emailParam, router],
  );

  // Handle auto-submit of OTP code
  useEffect(() => {
    const code = otpRef.current.join("");

    if (code.length !== 6 || verifyingOtp || submittingRef.current || verifiedRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      handleVerifyOtp(code);
    }, 250);

    return () => clearTimeout(timer);
  }, [otp, verifyingOtp, handleVerifyOtp]);

  const handleResend = async () => {
    const emailToUse = session?.user?.email || emailParam;

    if (!emailToUse) {
      showToast({
        title: "Missing email",
        description: "No email address available to resend verification.",
        type: "error",
      });
      return;
    }
    setResending(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: emailToUse,
        type: "email-verification",
      });

      if (error) throw error;
      showToast({
        title: "Verification email sent",
        description: "Please check your inbox.",
        type: "success",
      });
    } catch (err) {
      showToast({
        title: "Failed to send email",
        description: err.message,
        type: "error",
      });
    } finally {
      setResending(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      showToast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        type: "error",
      });

      return;
    }
    setUpdatingEmail(true);
    try {
      const { error } = await authClient.changeEmail({
        newEmail: newEmail,
        callbackURL: window.location.origin + "/auth/verify-email",
      });

      if (error) throw error;
      showToast({
        title: "Email updated",
        description: "Verification link sent to your new email.",
        type: "success",
      });
      setNewEmail("");
    } catch (err) {
      showToast({
        title: "Failed to change email",
        description: err.message,
        type: "error",
      });
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (session?.user) {
        await authClient.signOut();
        showToast({
          title: "Logged out",
          description: "You have been successfully logged out.",
          type: "success",
        });
      }
      router.push("/auth/login");
    } catch (err) {
      showToast({
        title: "Logout failed",
        description: err.message,
        type: "error",
      });
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 25 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-card/75 border border-default-200/50 backdrop-blur-md shadow-2xl overflow-hidden">
        <CardBody className="py-8 px-6 flex flex-col items-center justify-center min-h-[300px]">
          <AnimatePresence mode="wait">
            {(isPending || (status === "loading" && token)) && (
              <motion.div
                key="loading"
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-4"
                exit={{ opacity: 0, scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                  <Spinner color="primary" size="lg" />
                </div>
                <h2 className="text-xl font-bold">Verifying Your Email</h2>
                <p className="text-default-500 text-sm max-w-xs">
                  We are securely communicating with Neon Auth to register your
                  verification. Please don&apos;t close this page.
                </p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success"
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-4"
                exit={{ opacity: 0, scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ scale: [0, 1.2, 1] }}
                  className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mb-2"
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                <h2 className="text-xl font-bold text-success">
                  Verification Complete!
                </h2>
                <p className="text-default-500 text-sm max-w-xs">
                  Thank you! Your email has been successfully verified.
                  Redirecting to your dashboard...
                </p>
                <Button
                  className="mt-2"
                  color="primary"
                  variant="shadow"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="error"
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-4"
                exit={{ opacity: 0, scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ scale: [0, 1.2, 1] }}
                  className="w-16 h-16 rounded-full bg-danger/10 text-danger flex items-center justify-center mb-2"
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <XCircle className="w-10 h-10" />
                </motion.div>
                <h2 className="text-xl font-bold text-danger">
                  Verification Failed
                </h2>
                <p className="text-default-500 text-sm max-w-xs">{errorMsg}</p>
                <div className="flex gap-3 mt-2">
                  <Button
                    color="primary"
                    variant="shadow"
                    onClick={() => router.push("/auth/login")}
                  >
                    Back to Login
                  </Button>
                  <Button
                    color="default"
                    variant="flat"
                    onClick={() => router.push("/auth/signup")}
                  >
                    Create Account
                  </Button>
                </div>
              </motion.div>
            )}

            {status === "interactive" && verificationEmail && (
              <motion.div
                key="interactive"
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col w-full text-center gap-5"
                exit={{ opacity: 0, scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-warning/10 text-warning flex items-center justify-center mb-3">
                    <MailCheck className="w-9 h-9" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Verify Your Email
                  </h2>
                  <p className="text-default-500 text-sm max-w-xs mt-2">
                    We sent a verification code to{" "}
                    <strong className="text-foreground">
                      {verificationEmail}
                    </strong>
                    . Please check your inbox and enter the 6-digit code below.
                  </p>
                </div>

                {/* 6-Digit OTP Input Field */}
                <div className="flex flex-col gap-3 my-2 items-center w-full">
                  <div
                    className="flex justify-center gap-2 w-full"
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        className="w-12 h-14 text-center text-xl font-bold bg-default-100/50 border-2 border-default-200 rounded-xl focus:border-primary focus:bg-background outline-none transition-all duration-200 shadow-sm"
                        inputMode="numeric"
                        maxLength={1}
                        pattern="\d*"
                        type="text"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      />
                    ))}
                  </div>
                  <Button
                    className="w-full font-semibold"
                    color="primary"
                    isDisabled={otp.join("").length !== 6}
                    isLoading={verifyingOtp}
                    variant="shadow"
                    onClick={() => handleVerifyOtp()}
                  >
                    Verify Code
                  </Button>
                </div>

                <div className="flex flex-col gap-3 w-full mt-2">
                  <Button
                    color="primary"
                    isLoading={resending}
                    size="lg"
                    startContent={<RefreshCw className="w-4 h-4" />}
                    variant="flat"
                    onClick={handleResend}
                  >
                    Resend Verification Email
                  </Button>

                  {session?.user && (
                    <form
                      className="flex flex-col gap-2 border-t border-default-200/50 pt-4 mt-2 text-left"
                      onSubmit={handleChangeEmail}
                    >
                      <label className="text-xs font-semibold text-default-600 px-1">
                        Change Email Address
                      </label>
                      <div className="flex gap-2">
                        <Input
                          className="flex-1"
                          placeholder="new.email@example.com"
                          size="sm"
                          startContent={
                            <Edit3 className="w-4 h-4 text-default-400" />
                          }
                          type="email"
                          value={newEmail}
                          variant="bordered"
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                        <Button
                          color="secondary"
                          isLoading={updatingEmail}
                          size="sm"
                          type="submit"
                          variant="flat"
                        >
                          Update
                        </Button>
                      </div>
                    </form>
                  )}

                  <Button
                    className="mt-4"
                    color="danger"
                    size="sm"
                    startContent={<LogOut className="w-4 h-4" />}
                    variant="light"
                    onClick={handleLogout}
                  >
                    {session?.user ? "Logout & Sign In" : "Back to Login"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardBody>
      </Card>
    </motion.div>
  );
}
