"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileSearch,
  LogOut,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
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
      <main className="grid min-h-[100dvh] place-items-center bg-sand-50 px-4">
        <div className="rounded-2xl border border-line bg-white px-8 py-10 text-center shadow-sm">
          <RefreshCw className="mx-auto size-8 animate-spin text-forest-700" />
          <p className="mt-4 text-sm font-bold text-muted">
            Loading your account review…
          </p>
        </div>
      </main>
    );
  }

  if (profileError || !user) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-sand-50 px-4">
        <div className="max-w-md rounded-2xl border border-line bg-white p-7 text-center shadow-sm">
          <TriangleAlert className="mx-auto size-9 text-amber-700" />
          <h1 className="mt-4 text-2xl font-extrabold text-ink">
            Review status unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {profileError ||
              "Sign in again so we can securely load your review status."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => void refreshProfile()}
              className="stitch-button"
            >
              <RefreshCw className="size-4" />
              Try again
            </button>
            <Link
              href="/properties"
              className="stitch-button stitch-button-secondary"
            >
              Browse homes
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="min-h-[100dvh] bg-sand-100 px-4 py-6 sm:px-6"
    >
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="flex min-h-11 items-center" aria-label="LinkConn Rent home">
          <Logo variant="lockup" priority className="h-14 w-auto" sizes="118px" />
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          disabled={isLoggingOut}
          className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold text-forest-800 transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
        >
          <LogOut className={`size-4 ${isLoggingOut ? "animate-pulse" : ""}`} />
          {isLoggingOut ? "Signing out…" : "Sign out"}
        </button>
      </header>

      <section className="mx-auto grid min-h-[calc(100dvh-6rem)] max-w-5xl place-items-center py-10">
        <motion.article
          initial={
            reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full overflow-hidden border border-line bg-white"
        >
          <div
            className={`h-2 w-full ${
              rejected ? "bg-amber-500" : "bg-forest-700"
            }`}
          />
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_18rem] lg:p-10">
            <div>
              <span
                className={`inline-flex size-14 items-center justify-center rounded-2xl ${
                  rejected
                    ? "bg-amber-100 text-amber-800"
                    : "bg-forest-100 text-forest-800"
                }`}
              >
                {rejected ? (
                  <TriangleAlert className="size-7" />
                ) : (
                  <FileSearch className="size-7" />
                )}
              </span>
              <p className="mt-6 text-xs font-bold text-forest-700">
                Account verification
              </p>
              <h1 className="mt-2 max-w-xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                {rejected
                  ? "We need a little more information"
                  : "Your profile is in the review queue"}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
                {rejected
                  ? user?.accountReviewReason ||
                    "An administrator could not approve the current submission. Update your details and submit it again."
                  : `Thanks${user?.firstName ? `, ${user.firstName}` : ""}. An administrator will check your identity and account details before your workspace is activated.`}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {rejected ? (
                  <Link href="/onboarding" className="stitch-button">
                    Update and resubmit
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => void refreshProfile()}
                    disabled={isLoadingProfile}
                    className="stitch-button disabled:cursor-wait disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`size-4 ${
                        isLoadingProfile ? "animate-spin" : ""
                      }`}
                    />
                    Check review status
                  </button>
                )}
                <Link
                  href="/properties"
                  className="stitch-button stitch-button-secondary"
                >
                  Browse homes meanwhile
                </Link>
              </div>
            </div>

            <aside className="bg-sand-100 p-5">
              <p className="text-xs font-bold text-forest-700">
                What happens next
              </p>
              <ol className="mt-5 space-y-5">
                {[
                  {
                    icon: CheckCircle2,
                    title: "Profile submitted",
                    body: "Your onboarding details are safely stored.",
                    done: true,
                  },
                  {
                    icon: Clock3,
                    title: rejected ? "Details required" : "Admin review",
                    body: rejected
                      ? "Correct the issue described by the reviewer."
                      : "A reviewer checks the identity and account signals.",
                    done: false,
                  },
                  {
                    icon: ShieldCheck,
                    title: "Workspace access",
                    body: "You can enter your dashboard after approval.",
                    done: false,
                  },
                ].map(({ icon: Icon, title, body, done }) => (
                  <li key={title} className="flex gap-3">
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-full ${
                        done
                          ? "bg-forest-700 text-white"
                          : "bg-white text-forest-700"
                      }`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-ink">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </motion.article>
      </section>
    </main>
  );
}
