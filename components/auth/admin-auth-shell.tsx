import Link from "next/link";
import type { ReactNode } from "react";
import { KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/icons";

type AdminAuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footerHref: string;
  footerLabel: string;
  children: ReactNode;
};

export function AdminAuthShell({
  title,
  description,
  footerHref,
  footerLabel,
  children,
}: AdminAuthShellProps) {
  return (
    <main id="main-content" className="min-h-dvh w-full bg-white grid lg:grid-cols-[minmax(22rem,0.85fr)_minmax(0,1.15fr)]">
      {/* ========================================================= */}
      {/* Left Operations Console Showcase (Edge-to-Edge Desktop) */}
      {/* ========================================================= */}
      <aside className="relative flex flex-col justify-between overflow-hidden bg-forest-950 p-6 text-sand-50 sm:p-10 lg:p-14">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-lime/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex min-h-11 w-fit items-center" aria-label="LinkConn Rent home">
            <Logo variant="lockup" priority className="h-14 w-auto brightness-0 invert" sizes="124px" />
          </Link>
          <p className="mt-2 text-xs font-semibold text-forest-300">
            Administrative Operations &amp; Ledger Studio
          </p>
        </div>

        <div className="relative z-10 my-8 space-y-6 max-w-md">
          <span className="grid size-12 place-items-center bg-lime text-forest-950">
            <ShieldCheck className="size-6" aria-hidden />
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl leading-tight">
            A controlled workspace for accountable decisions.
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-forest-200">
            Authorized operators review identity credentials, title deeds, payment reconciliations, and dispute arbitration with every action logged in the audit ledger.
          </p>
          <div className="grid grid-cols-3 border border-white/15 text-center text-[10px] font-extrabold uppercase tracking-wider text-forest-100 bg-white/[0.03]">
            <span className="border-r border-white/15 p-3">Authenticated</span>
            <span className="border-r border-white/15 p-3">Authorized</span>
            <span className="p-3">Audited</span>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-forest-300">
          <span className="flex items-center gap-1.5 font-semibold">
            <KeyRound className="size-4 text-lime" aria-hidden />
            Neon Auth Secured Access
          </span>
          <span className="text-[11px] text-forest-400">Strict IP &amp; Device Auditing</span>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* Right Login Form (Edge-to-Edge) */}
      {/* ========================================================= */}
      <section className="flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto bg-white min-h-dvh">
        <div className="mx-auto w-full my-auto max-w-md">
          <div>
            <span className="inline-block rounded-md bg-forest-100 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-forest-900">
              Operations Login
            </span>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted">
              {description}
            </p>
          </div>

          <div className="mt-6">{children}</div>

          <div className="mt-6 border-t border-line pt-4 text-center text-xs text-muted">
            <Link className="font-bold text-forest-800 hover:text-forest-950 hover:underline" href={footerHref}>
              {footerLabel}
            </Link>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1 text-center text-[11px] text-muted">
            <ShieldCheck className="size-3.5 text-forest-700" aria-hidden />
            No public administrator registration is available.
          </p>
        </div>

        <div className="mt-8 border-t border-line pt-4 text-center text-[11px] text-muted">
          © {new Date().getFullYear()} LinkConn Rent Administrative System
        </div>
      </section>
    </main>
  );
}
