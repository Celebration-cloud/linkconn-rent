"use client";

import { useState } from "react";
import {
  Home,
  CreditCard,
  Wrench,
  FileText,
  MessageSquare,
  Settings,
  Menu,
  SquareChevronLeft,
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Overview", href: "/dashboard/tenant", icon: Home },
  { label: "Payments", href: "/dashboard/tenant/payments", icon: CreditCard },
  { label: "Maintenance", href: "/dashboard/tenant/maintenance", icon: Wrench },
  { label: "Lease", href: "/dashboard/tenant/lease", icon: FileText },
  {
    label: "Messages",
    href: "/dashboard/tenant/messages",
    icon: MessageSquare,
  },
  { label: "Settings", href: "/dashboard/tenant/settings", icon: Settings },
];

export default function TenantDashboardLayout({ children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen fixed-top bg-gray-50 dark:bg-gray-900 -mt-10">
      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-16 left-0 h-full z-40 w-64",
          "bg-white dark:bg-gray-900",
          "border-r border-gray-200 dark:border-gray-800",
          "shadow-md dark:shadow-none",
          "transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="px-6 py-6 font-semibold text-xl border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
          Tenant Dashboard
        </div>

        <nav className="px-4 mt-6 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Content area */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            Dashboard
          </span>
          <button
            onClick={() => setOpen(true)}
            className="text-gray-700 dark:text-gray-300"
          >
            <SquareChevronLeft size={28} />
          </button>
        </div>

        <main className="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
