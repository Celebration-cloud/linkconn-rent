"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Clock3,
  FileCheck2,
  FileSearch,
  HelpCircle,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserCheck,
} from "lucide-react";
import { Logo } from "@/components/shared/icons";
import { useAuth } from "@/providers/auth-provider";

export default function AccountReviewPage() {
  const router = useRouter();
  const {
    user,
    isLoadingProfile,
    profileError,
    isLoggingOut,
    refreshProfile,
    logout,
  } = useAuth();
  const reducedMotion = useReducedMotion();
  const rejected = user?.accountReviewStatus === "Rejected";

  useEffect(() => {
    if (!isLoadingProfile && !profileError && !user) {
      router.replace("/login");
    }
  }, [isLoadingProfile, profileError, router, user]);

  if (isLoadingProfile) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-[#eef2ed] px-4">
        <div className="rounded-2xl border border-[#d6ddd5] bg-white px-8 py-10 text-center shadow-md">
          <RefreshCw className="mx-auto size-8 animate-spin text-forest-700" />
          <p className="mt-4 text-sm font-bold text-forest-950">
            Checking your verification status…
          </p>
        </div>
      </main>
    );
  }

  if (profileError || !user) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-[#eef2ed] px-4">
        <div className="max-w-md rounded-2xl border border-[#d6ddd5] bg-white p-7 text-center shadow-md">
          <TriangleAlert className="mx-auto size-9 text-amber-700" />
          <h1 className="mt-4 text-2xl font-extrabold text-ink">
            Status Unavailable
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            {profileError || "Please sign in again to load your review status."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => void refreshProfile()}
              className="stitch-button text-xs py-2"
            >
              <RefreshCw className="size-3.5" />
              Try again
            </button>
            <Link
              href="/login"
              className="stitch-button stitch-button-secondary text-xs py-2"
            >
              Back to Sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="min-h-[100dvh] bg-[#eef2ed] px-4 py-6 sm:px-6 flex flex-col justify-between"
    >
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between border-b border-[#d6ddd5] pb-4">
        <Link href="/" className="flex min-h-11 items-center" aria-label="LinkConn Rent home">
          <Logo variant="lockup" priority className="h-12 w-auto" sizes="118px" />
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          disabled={isLoggingOut}
          className="flex min-h-10 items-center gap-2 rounded-lg bg-white border border-[#d6ddd5] px-3.5 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
        >
          <LogOut className={`size-3.5 ${isLoggingOut ? "animate-pulse" : ""}`} />
          {isLoggingOut ? "Signing out…" : "Sign out"}
        </button>
      </header>

      <section className="mx-auto w-full max-w-5xl py-8">
        <motion.article
          initial={
            reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.99 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="overflow-hidden rounded-2xl border border-[#d6ddd5] bg-white shadow-[0_20px_60px_rgba(18,55,42,0.1)]"
        >
          <div
            className={`h-2.5 w-full ${
              rejected ? "bg-amber-500" : "bg-forest-800"
            }`}
          />
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_20rem] lg:p-10">
            {/* Left Content Area */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-black ${
                    rejected
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-forest-100 text-forest-900 border border-forest-300"
                  }`}
                >
                  {rejected ? (
                    <AlertTriangle className="size-3.5" />
                  ) : (
                    <Clock className="size-3.5 text-forest-700" />
                  )}
                  {rejected ? "Action Required" : "Identity Review in Progress"}
                </span>
                <span className="text-xs font-semibold text-muted">SLA: &lt; 24 Hours</span>
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-forest-950 sm:text-3xl lg:text-4xl">
                  {rejected
                    ? "Additional Information Required"
                    : `Welcome, ${user.firstName}. Your account is undergoing trust review.`}
                </h1>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted">
                  {rejected
                    ? user.accountReviewReason ||
                      "Our compliance team noted items that require your attention before your account can be certified."
                    : "To ensure a safe ecosystem for tenants and landlords across Nigeria, every profile and credential is audited by our operations team before dashboard activation."}
                </p>
              </div>

              {/* Status Box */}
              {rejected ? (
                <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-xs text-amber-950 space-y-2">
                  <strong className="block font-black text-amber-900 text-sm">
                    Reviewer Instructions:
                  </strong>
                  <p className="leading-relaxed">
                    {user.accountReviewReason || "Please update your profile details or re-upload clear identification documents."}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-forest-200 bg-forest-50 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-forest-950 flex items-center gap-1.5">
                      <ShieldCheck className="size-4 text-forest-700" />
                      What We Are Verifying:
                    </span>
                    <span className="text-[11px] font-bold text-forest-800">Review Round 1</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs text-forest-900">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-600" />
                      <span>Email confirmation (Verified)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>National Identity / Passport Audit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Phone &amp; Profile consistency check</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-sand-400" />
                      <span>Workspace access activation</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {rejected ? (
                  <Link href="/onboarding" className="stitch-button text-xs py-2.5">
                    Update Details &amp; Resubmit
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => void refreshProfile()}
                    disabled={isLoadingProfile}
                    className="stitch-button text-xs py-2.5 disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`size-4 ${
                        isLoadingProfile ? "animate-spin" : ""
                      }`}
                    />
                    Check Current Review Status
                  </button>
                )}
                <Link
                  href="/properties"
                  className="stitch-button stitch-button-secondary text-xs py-2.5"
                >
                  Browse Verified Homes Meanwhile
                </Link>
              </div>
            </div>

            {/* Right Sidebar Timeline */}
            <aside className="rounded-2xl border border-[#d6ddd5] bg-[#f8faf7] p-5 space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-forest-950">
                Verification Journey
              </h2>
              <ol className="space-y-4 text-xs">
                {[
                  {
                    icon: CheckCircle2,
                    title: "Registration & Email",
                    body: "Email verified and profile recorded.",
                    status: "done" as const,
                  },
                  {
                    icon: Clock3,
                    title: "Compliance Review",
                    body: rejected
                      ? "Corrections requested by reviewer."
                      : "Operator inspecting identity credentials.",
                    status: rejected ? "alert" as const : "active" as const,
                  },
                  {
                    icon: ShieldCheck,
                    title: "Full Workspace Access",
                    body: "Dashboard tools unlocked with verified badge.",
                    status: "pending" as const,
                  },
                ].map(({ icon: Icon, title, body, status }) => (
                  <li key={title} className="flex gap-3">
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full text-xs ${
                        status === "done"
                          ? "bg-forest-800 text-white"
                          : status === "active"
                          ? "bg-lime text-forest-950 font-black"
                          : status === "alert"
                          ? "bg-amber-600 text-white"
                          : "bg-sand-200 text-muted"
                      }`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="font-extrabold text-forest-950">{title}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="border-t border-[#eaeee9] pt-4 text-xs text-muted space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-forest-700" />
                  <span>support@linkconn.rent</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="size-3.5 text-forest-700" />
                  <Link href="/help" className="font-bold text-forest-800 hover:underline">
                    Help Center &amp; FAQs
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </motion.article>
      </section>

      <footer className="mx-auto w-full max-w-5xl border-t border-[#d6ddd5] pt-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} LinkConn Rent. Built for Nigeria · <Link href="/trust-and-safety" className="underline hover:text-forest-900">Trust &amp; Safety Standards</Link>
      </footer>
    </main>
  );
}
