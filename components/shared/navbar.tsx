"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, Menu, X } from "lucide-react";
import { canListProperties } from "@/domain/constants/property-access";
import { useAuth } from "@/providers/auth-provider";
import { Logo } from "./icons";
import UserMenu from "./user-menu";

const navigation = [
  { label: "Rent", href: "/properties" },
  { label: "Map", href: "/properties/map" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Trust & Safety", href: "/trust-and-safety" },
  { label: "Pricing", href: "/pricing" },
  { label: "Help", href: "/help" },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/properties/map") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  if (href === "/properties") {
    return (
      (pathname === href || pathname.startsWith(`${href}/`)) &&
      !pathname.startsWith("/properties/map")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const { scrolled } = useScroll();
  const [open, setOpen] = useState(false);
  const { user, isLoadingProfile, profileError, openAuth } = useAuth();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const canList = Boolean(
    user &&
      !isLoadingProfile &&
      !profileError &&
      canListProperties(user.role),
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <motion.header
      initial={reducedMotion ? false : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-[100] isolate border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? "border-forest-900/10 bg-sand-50/95 shadow-[0_10px_35px_rgba(18,55,42,0.08)] backdrop-blur-xl"
          : "border-transparent bg-sand-50/90 backdrop-blur-md"
      }`}
    >
      <nav
        className="stitch-container flex h-16 items-center justify-between gap-4"
        aria-label="Primary navigation"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg"
          aria-label="LinkConn Rent home"
        >
          <Logo className="h-9 w-9" />
          <span className="text-lg font-extrabold tracking-[-0.045em] text-forest-900">
            LinkConn <span className="text-forest-600">Rent</span>
          </span>
        </Link>

        <div className="hidden min-w-0 items-center justify-center gap-0.5 xl:flex">
          {navigation.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative min-h-11 px-2.5 py-3 text-sm transition-colors ${
                  active
                    ? "font-bold text-forest-900"
                    : "font-semibold text-muted hover:text-forest-900"
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-2.5 bottom-1 h-0.5 origin-left rounded-full bg-lime transition-transform duration-200 ${
                    active
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {canList && (
            <Link
              href="/dashboard/properties/new"
              className="hidden min-h-11 items-center gap-2 rounded-lg bg-forest-800 px-4 text-sm font-bold text-white shadow-[0_8px_22px_rgba(18,55,42,0.16)] transition hover:-translate-y-0.5 hover:bg-forest-700 active:translate-y-0 xl:inline-flex"
            >
              <Building2 className="size-4 shrink-0" aria-hidden="true" />
              List a property
            </Link>
          )}
          <UserMenu />
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="grid size-11 place-items-center rounded-lg border border-forest-900/10 bg-white/80 text-forest-900 transition hover:bg-sand-200 xl:hidden"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-forest-900/10 bg-sand-50/98 shadow-[0_20px_35px_rgba(18,55,42,0.1)] backdrop-blur-xl xl:hidden"
          >
            <div className="stitch-container py-4">
              {canList && (
                <Link
                  href="/dashboard/properties/new"
                  className="mb-3 flex min-h-11 items-center justify-between rounded-xl bg-forest-800 px-4 text-sm font-bold text-white"
                >
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="size-4" aria-hidden="true" />
                    List a property
                  </span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}

              <div className="grid gap-1 sm:grid-cols-2">
                {navigation.map((item) => {
                  const active = isActiveRoute(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-forest-100 text-forest-900"
                          : "text-muted hover:bg-sand-200 hover:text-forest-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {!user && !isLoadingProfile && (
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      openAuth("login");
                      setOpen(false);
                    }}
                    className="stitch-button stitch-button-secondary"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openAuth("pick");
                      setOpen(false);
                    }}
                    className="stitch-button"
                  >
                    Create account
                  </button>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function useScroll() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { scrolled };
}
