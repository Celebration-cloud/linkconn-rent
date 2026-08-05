"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  Gauge,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Logo } from "@/components/shared/icons";
import { useAuth } from "@/providers/auth-provider";

const links = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/verifications", label: "Verification", icon: ShieldCheck },
  { href: "/admin/disputes", label: "Fraud & disputes", icon: AlertTriangle },
  { href: "/admin/moderation", label: "Moderation", icon: Users },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useAuth();
  return (
    <main id="main-content" className="min-h-[100dvh] bg-sand-50 md:grid md:grid-cols-[13rem_1fr]">
      <aside className="hidden border-r border-line bg-sand-50 p-4 md:flex md:min-h-screen md:flex-col">
        <Link href="/" className="flex items-center gap-2 px-1 py-2">
          <Logo className="h-8 w-8" />
          <span className="text-sm font-extrabold text-forest-900">LinkConn Rent</span>
        </Link>
        <span className="mt-1 w-fit rounded-full bg-sand-200 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-muted">Admin portal</span>
        <nav className="mt-8 flex-1 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-xs font-bold ${pathname === href ? "bg-forest-100 text-forest-900" : "text-muted hover:bg-sand-200"}`}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
          <Link href="/dashboard/properties" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-xs font-bold text-muted hover:bg-sand-200">
            <Building2 className="h-4 w-4" /> Properties
          </Link>
        </nav>
        <button disabled={isLoggingOut} onClick={() => void logout()} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60">
          <LogOut className="h-4 w-4" /> {isLoggingOut ? "Logging out…" : "Log out"}
        </button>
      </aside>
      <section className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-sand-50/95 px-4 backdrop-blur md:hidden">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-forest-900"><Logo className="h-7 w-7" /> LinkConn Rent</Link>
          <Menu className="h-5 w-5" aria-hidden />
        </header>
        {children}
      </section>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-white pb-[max(env(safe-area-inset-bottom),.35rem)] pt-1 md:hidden">
        {links.slice(0, 4).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-bold ${pathname === href ? "text-forest-700" : "text-muted"}`}>
            <Icon className="h-5 w-5" /> {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
