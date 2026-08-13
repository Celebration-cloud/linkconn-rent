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
  title,
  description,
  footerHref,
  footerLabel,
  children,
}: AdminAuthShellProps) {
  return (
    <main id="main-content" className="min-h-[100dvh] bg-[#eef2ed] p-3 sm:p-5 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100dvh-2rem)] w-full max-w-6xl overflow-hidden border border-forest-900 bg-white shadow-[0_24px_70px_rgba(18,55,42,0.16)] lg:grid-cols-[minmax(20rem,.82fr)_minmax(0,1.18fr)]">
        <aside className="relative flex min-h-[22rem] flex-col justify-between overflow-hidden bg-forest-950 p-6 text-sand-50 sm:p-9">
          <Link href="/" className="inline-flex min-h-11 w-fit items-center" aria-label="LinkConn Rent home">
            <Logo variant="lockup" priority className="h-16 w-auto brightness-0 invert" sizes="134px" />
          </Link>

          <div className="relative z-10 py-10 lg:py-16">
            <span className="grid size-12 place-items-center bg-lime text-forest-950">
              <ShieldCheck className="size-6" aria-hidden />
            </span>
            <h2 className="mt-7 max-w-sm text-4xl font-extrabold tracking-[-0.03em]">A controlled workspace for accountable decisions.</h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-sand-200">
              Authorized operators review identity, listings, payments, support, maintenance, and disputes with every consequential action recorded.
            </p>
            <div className="mt-8 grid grid-cols-3 border border-white/15 text-center text-[10px] font-bold text-forest-100"><span className="border-r border-white/15 p-3">Authenticated</span><span className="border-r border-white/15 p-3">Authorized</span><span className="p-3">Audited</span></div>
          </div>

          <p className="flex items-center gap-2 text-xs text-sand-300">
            <KeyRound className="size-4 text-lime-200" aria-hidden />
            Neon Auth secured access
          </p>
        </aside>

        <section className="grid place-items-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-extrabold tracking-[-0.035em] text-ink sm:text-4xl">{title}</h1>
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
