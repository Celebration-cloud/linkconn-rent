import Link from "next/link";
import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/shared/icons";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footerText: string;
  footerHref: string;
  footerLabel: string;
  children: ReactNode;
};

export default function AuthPageShell({
  eyebrow,
  title,
  description,
  footerText,
  footerHref,
  footerLabel,
  children,
}: AuthPageShellProps) {
  const isSignup = eyebrow === "Create account";

  return (
    <main id="main-content" className="min-h-[100dvh] bg-sand-50">
      <section className="grid min-h-[calc(100dvh-4rem)] place-items-center px-4 py-10 sm:px-6">
        <div className={`w-full ${isSignup ? "max-w-3xl" : "max-w-md"}`}>
          <div className="mb-5 flex justify-center">
            <Link href="/" className="flex items-center" aria-label="LinkConn Rent home">
              <Logo variant="lockup" priority className="h-16 w-auto" sizes="134px" />
            </Link>
          </div>
          <div className="rounded-xl border border-line bg-white p-5 shadow-[0_8px_30px_rgba(18,55,42,0.08)] sm:p-7">
            <div className="mb-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-700">{eyebrow}</p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-ink sm:text-3xl">{title}</h1>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">{description}</p>
            </div>
            {children}
            <div className="mt-6 border-t border-line pt-5 text-center text-sm text-muted">
              {footerText}{" "}
              <Link className="font-bold text-forest-700 transition hover:text-forest-900 hover:underline" href={footerHref}>
                {footerLabel}
              </Link>
            </div>
            <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-forest-700" />
              Security, verification, and account standards apply.
            </p>
          </div>
        </div>
      </section>
      <footer className="border-t border-line bg-forest-950 px-5 py-6 text-center text-xs text-sand-300">
        © 2026 LinkConn Rent. Privacy · Terms · Support
      </footer>
    </main>
  );
}
