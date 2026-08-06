import Link from "next/link";
import { cacheLife } from "next/cache";
import { Mail, ShieldCheck } from "lucide-react";
import { Logo } from "./icons";

const exploreLinks = [
  { label: "Rentals", href: "/properties" },
  { label: "Map view", href: "/properties/map" },
  { label: "Compare homes", href: "/compare" },
];

const learnLinks = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Trust & Safety", href: "/trust-and-safety" },
  { label: "Pricing", href: "/pricing" },
  { label: "Help center", href: "/help" },
];

const footerLinkClass =
  "inline-flex min-h-11 items-center text-sm font-semibold text-sand-300 transition-colors hover:text-white";

export default async function Footer() {
  "use cache";
  cacheLife("days");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-forest-800 bg-forest-950 text-sand-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-28 size-80 rounded-full border border-lime/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-44 right-24 size-96 rounded-full border border-white/5"
      />

      <div className="stitch-container relative py-12 sm:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center rounded-lg bg-sand-50 px-3 py-2"
              aria-label="LinkConn Rent home"
            >
              <Logo variant="lockup" className="h-16 w-auto" sizes="134px" />
            </Link>
            <p className="mt-5 max-w-md text-pretty text-sm leading-7 text-sand-300">
              Find verified homes, speak directly with landlords, and review
              every move-in cost before you pay.
            </p>
            <div className="mt-6 inline-flex items-start gap-3 border-l-2 border-lime/70 pl-4">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-lime"
                aria-hidden="true"
              />
              <p className="max-w-sm text-xs leading-5 text-sand-400">
                Built for clearer, safer rental decisions across Nigeria.
              </p>
            </div>
          </div>

          <nav className="lg:col-span-2" aria-label="Explore LinkConn Rent">
            <h2 className="text-sm font-bold text-white">Explore</h2>
            <ul className="mt-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="lg:col-span-2" aria-label="Learn about LinkConn Rent">
            <h2 className="text-sm font-bold text-white">Learn</h2>
            <ul className="mt-3">
              {learnLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2 lg:col-span-3">
            <h2 className="text-sm font-bold text-white">Need help?</h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-sand-400">
              Get support with your account, payments, or an urgent safety
              concern.
            </p>
            <a
              href="mailto:support@linkconn.rent"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-bold text-white transition hover:border-lime/50 hover:bg-white/10"
            >
              <Mail className="size-4 shrink-0 text-lime" aria-hidden="true" />
              support@linkconn.rent
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-sand-400 sm:flex-row sm:items-center">
          <p>© {currentYear} LinkConn Rent. Built for Nigeria.</p>
          <p className="inline-flex items-center gap-2">
            <ShieldCheck className="size-4 text-lime" aria-hidden="true" />
            Payments secured by Paystack
          </p>
        </div>
      </div>
    </footer>
  );
}
