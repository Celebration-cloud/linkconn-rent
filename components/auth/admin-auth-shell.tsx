import Link from "next/link";
import type { ReactNode } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
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
  eyebrow,
  title,
  description,
  footerHref,
  footerLabel,
  children,
}: AdminAuthShellProps) {
  return (
    <main id="main-content" className="min-h-[100dvh] bg-sand-50 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto grid min-h-[calc(100dvh-6rem)] w-full max-w-5xl overflow-hidden rounded-2xl border border-forest-100 bg-white shadow-[0_24px_80px_rgba(18,55,42,0.14)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="flex flex-col justify-between bg-forest-950 p-7 text-sand-50 sm:p-10">
          <Link href="/" className="inline-flex min-h-11 w-fit items-center" aria-label="LinkConn Rent home">
            <Logo variant="lockup" priority className="h-16 w-auto brightness-0 invert" sizes="134px" />
          </Link>

          <div className="py-12">
            <span className="grid size-12 place-items-center rounded-xl bg-lime-300 text-forest-950">
              <ShieldCheck className="size-6" aria-hidden />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-lime-200">
              Restricted system
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">LinkConn administration</h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-sand-200">
              This portal is reserved for authorized Admin and Super Admin accounts. Access attempts are authenticated and audited.
            </p>
          </div>

          <p className="flex items-center gap-2 text-xs text-sand-300">
            <KeyRound className="size-4 text-lime-200" aria-hidden />
            Neon Auth secured access
          </p>
        </aside>

        <section className="grid place-items-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-700">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-ink">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
            <div className="mt-7">{children}</div>
            <div className="mt-7 border-t border-line pt-5 text-center text-sm text-muted">
              <Link className="font-bold text-forest-700 hover:text-forest-900 hover:underline" href={footerHref}>
                {footerLabel}
              </Link>
            </div>
            <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted">
              <ShieldCheck className="size-3.5 text-forest-700" aria-hidden />
              No public administrator registration is available.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
