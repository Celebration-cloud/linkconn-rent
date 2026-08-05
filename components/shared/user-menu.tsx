"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { ROLE_LABELS, VERIFICATION_LEVELS } from "@/domain/constants/permissions";
import {
  Bell,
  CheckCircle2,
  CircleAlert,
  CircleDollarSign,
  CreditCard,
  Heart,
  House,
  Info,
  LogOut,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  Wrench,
} from "lucide-react";

export default function UserMenu() {
  const { user, logout, isLoggingOut, openAuth, toggle2fa, notifications, markAllNotificationsRead } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const openAccount = (tab: string) => {
    router.push(`/dashboard?tab=${tab}`);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) {
    return (
      <div className="hidden items-center gap-3 xl:flex">
        <button onClick={() => openAuth("login")} className="rounded-full px-4 py-2 text-sm font-semibold text-navy-800 transition-colors hover:text-navy-950 cursor-pointer">
          Log in
        </button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => openAuth("pick")}
          className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-navy-900/20 transition-colors hover:bg-brandgreen-600 cursor-pointer"
        >
          Get Started
        </motion.button>
      </div>
    );
  }

  const initials = (user.firstName[0] || "") + (user.lastName[0] || "");
  const unread = notifications.filter((n) => !n.read).length;
  const roleMeta = ROLE_LABELS[user.role] || { label: user.role, color: "bg-navy-100 text-navy-700" };
  const verif = VERIFICATION_LEVELS[user.verificationLevel] || { label: user.verificationLevel, color: "bg-navy-100 text-navy-600" };

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      {/* Notifications bell */}
      <div className="relative">
        <button
          onClick={() => { setNotifOpen((o) => !o); setOpen(false); }}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-navy-100 bg-white text-navy-700 shadow-sm transition-colors hover:bg-navy-50 cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="size-5" aria-hidden="true" />
          {unread > 0 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unread}
            </motion.span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-2xl shadow-navy-900/20"
            >
              <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
                <div className="text-sm font-bold text-navy-900">Notifications</div>
                <button onClick={markAllNotificationsRead} className="text-xs font-semibold text-brandgreen-600 hover:underline cursor-pointer">Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && <div className="p-6 text-center text-sm text-navy-500">No notifications</div>}
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex cursor-pointer items-start gap-3 border-b border-navy-50 p-4 transition-colors hover:bg-navy-50 ${!n.read ? "bg-brandgreen-50/40" : "bg-white"}`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                      n.type === "success" ? "bg-success-soft text-success" :
                      n.type === "warning" ? "bg-warning-soft text-warning" :
                      n.type === "payment" ? "bg-primary-soft text-primary" :
                      n.type === "maintenance" ? "bg-surface-subtle text-info" :
                      "bg-info-soft text-info"
                    }`}>
                      {n.type === "success" ? <CheckCircle2 className="size-4" aria-hidden="true" /> : n.type === "warning" ? <CircleAlert className="size-4" aria-hidden="true" /> : n.type === "payment" ? <CircleDollarSign className="size-4" aria-hidden="true" /> : n.type === "maintenance" ? <Wrench className="size-4" aria-hidden="true" /> : <Info className="size-4" aria-hidden="true" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-navy-900">{n.title}</div>
                      <div className="text-xs text-navy-600">{n.body}</div>
                      <div className="mt-1 text-[10px] text-navy-400">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Account button */}
      <button
        onClick={() => openAccount("overview")}
        className="hidden items-center gap-2 rounded-full border border-navy-100 bg-white px-2 py-1.5 pr-4 shadow-sm transition-shadow hover:shadow-md sm:flex cursor-pointer"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-800 text-xs font-bold text-white">
          {initials.toUpperCase()}
        </div>
        <div className="hidden text-left md:block">
          <div className="text-xs font-bold leading-tight text-navy-900">{user.firstName}</div>
          <div className="text-[10px] leading-tight text-navy-500">{user.role}</div>
        </div>
      </button>

      {/* User menu mobile */}
      <div className="relative">
        <button
          onClick={() => { setOpen((o) => !o); setNotifOpen(false); }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-100 bg-white text-navy-700 shadow-sm transition-colors hover:bg-navy-50 sm:hidden cursor-pointer"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-800 text-[10px] font-bold text-white">
            {initials.toUpperCase()}
          </div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-2xl shadow-navy-900/20"
            >
              <div className="border-b border-navy-100 bg-gradient-to-br from-navy-50 to-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-800 text-base font-bold text-white">
                    {initials.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-navy-900">{user.firstName} {user.lastName}</div>
                    <div className="truncate text-xs text-navy-500">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${roleMeta.color}`}><UserRound className="size-3" aria-hidden="true" /> {user.role}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${verif.color}`}>{verif.label}</span>
                </div>
                {!user.emailVerified && (
                  <button onClick={() => openAuth("verify")} className="mt-3 block w-full rounded-lg bg-amber-brand-100 px-2 py-1.5 text-xs font-semibold text-amber-brand-700 cursor-pointer">
                    <span className="inline-flex items-center gap-1"><TriangleAlert className="size-3" aria-hidden="true" /> Verify your email</span>
                  </button>
                )}
              </div>

              <div className="p-2 text-sm">
                {[
                  { icon: House, label: "My Dashboard", tab: "overview" },
                  { icon: UserRound, label: "My Profile", tab: "profile" },
                  { icon: Heart, label: "Saved Homes", tab: "saved" },
                  { icon: Bell, label: "Notifications", tab: "notifications" },
                  { icon: ShieldCheck, label: "Security", tab: "security" },
                  { icon: CreditCard, label: "Payments", tab: "payments" },
                ].map((m) => (
                  <button
                    key={m.label}
                    onClick={() => { setOpen(false); openAccount(m.tab); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-navy-50 cursor-pointer"
                  >
                    <m.icon className="size-4 shrink-0 text-content-muted" aria-hidden="true" />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-navy-900">{m.label}</span>
                    </span>
                  </button>
                ))}

                {/* 2FA toggle */}
                <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-navy-50">
                  <div>
                    <div className="text-sm font-semibold text-navy-900">Two-Factor Auth</div>
                    <div className="text-[11px] text-navy-500">{user.twoFactorEnabled ? "Enabled" : "Enable for extra safety"}</div>
                  </div>
                  <button
                    onClick={() => toggle2fa(!user.twoFactorEnabled)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${user.twoFactorEnabled ? "bg-brandgreen-500" : "bg-navy-200"}`}
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${user.twoFactorEnabled ? "left-[22px]" : "left-0.5"}`}
                    />
                  </button>
                </div>
              </div>

              <div className="border-t border-navy-100 p-2">
                <button
                  onClick={() => { setOpen(false); void logout(); }}
                  disabled={isLoggingOut}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                >
                  <LogOut className="size-4" aria-hidden="true" /> {isLoggingOut ? "Logging out…" : "Log out"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
