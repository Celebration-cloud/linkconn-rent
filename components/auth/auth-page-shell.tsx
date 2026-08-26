import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Check, HelpCircle, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/shared/icons";
import { LINKCONN_ASSETS } from "@/domain/constants/linkconn-assets";

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
  const supportPoints = isSignup
    ? ["Choose the account role that matches your work", "Verify your email before protected access", "Continue with a role-specific onboarding checklist"]
    : ["Return to saved homes and conversations", "Open the workspace that matches your role", "Account status is checked before access"];

  return (
    <main id="main-content" className="min-h-[100dvh] bg-sand-100 lg:grid lg:grid-cols-[minmax(19rem,.74fr)_minmax(0,1.26fr)]">
      <aside className="relative hidden min-h-dvh overflow-hidden bg-forest-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-9 xl:p-12">
        <Image src={isSignup ? LINKCONN_ASSETS.landlordAdekunle.src : LINKCONN_ASSETS.tenantAmaka.src} alt="" fill priority className="object-cover opacity-35" sizes="38vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/55 via-forest-950/70 to-forest-950" />
        <Link href="/" className="relative inline-flex min-h-11 w-fit items-center bg-sand-50 px-3" aria-label="LinkConn Rent home"><Logo variant="lockup" priority className="h-12 w-auto" sizes="112px" /></Link>
        <div className="relative max-w-md py-16">
          <ShieldCheck className="size-7 text-lime" aria-hidden="true" />
          <h2 className="mt-7 text-4xl font-extrabold leading-[1.02] tracking-[-.035em]">Your rental work should leave a clear record.</h2>
          <ul className="mt-8 space-y-4">{supportPoints.map((point) => <li key={point} className="flex items-start gap-3 text-sm leading-6 text-sand-200"><span className="mt-0.5 grid size-5 shrink-0 place-items-center bg-lime text-forest-950"><Check className="size-3.5" /></span>{point}</li>)}</ul>
        </div>
        <Link href="/help" className="relative inline-flex min-h-11 w-fit items-center gap-2 text-sm font-bold text-sand-200 hover:text-white"><HelpCircle className="size-4" />Need account help?</Link>
      </aside>

      <section className="flex min-h-dvh flex-col">
        <header className="flex min-h-20 items-center justify-between border-b border-line px-4 sm:px-8 lg:px-10">
          <Link href="/" className="inline-flex min-h-11 items-center lg:hidden" aria-label="LinkConn Rent home"><Logo variant="lockup" priority className="h-12 w-auto" sizes="112px" /></Link>
          <p className="ml-auto text-xs font-bold text-muted">{eyebrow}</p>
        </header>
        <div className="flex flex-1 items-center px-4 py-10 sm:px-8 lg:px-10 xl:px-16">
          <div className={`mx-auto w-full ${isSignup ? "max-w-4xl" : "max-w-lg"}`}>
            <div className="mb-8 border-b border-line pb-7">
              <h1 className="text-balance text-3xl font-extrabold tracking-[-.035em] text-ink sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{description}</p>
            </div>
            {children}
            <div className="mt-7 flex flex-col gap-3 border-t border-line pt-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
              <p>{footerText} <Link className="font-extrabold text-forest-700 hover:underline" href={footerHref}>{footerLabel}</Link></p>
              <p className="inline-flex items-center gap-1.5 text-xs"><ShieldCheck className="size-4 text-forest-700" />Protected account flow</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
