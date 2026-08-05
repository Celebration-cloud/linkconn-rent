"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";

export function SocialButtons() {
  const providers = [
    { name: "Google", icon: "/icons/social-google.svg" },
    { name: "Apple", icon: "/icons/social-apple.svg" },
    { name: "Facebook", icon: "/icons/social-facebook.svg" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {providers.map((p) => (
        <motion.button
          key={p.name}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => alert(`${p.name} OAuth would open here (demo)`)}
          className="group flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white py-3 text-sm font-semibold text-navy-700 transition-colors hover:border-navy-300 hover:bg-navy-50 cursor-pointer"
        >
          <Image src={p.icon} alt="" width={16} height={16} className="size-4" aria-hidden="true" />
          {p.name}
        </motion.button>
      ))}
    </div>
  );
}

export function Divider({ text = "or continue with email" }: { text?: string }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-navy-200" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">{text}</span>
      <div className="h-px flex-1 bg-navy-200" />
    </div>
  );
}

export function PrimaryButton({
  children, loading, type = "button", onClick, disabled,
}: { children: React.ReactNode; loading?: boolean; type?: "button" | "submit"; onClick?: () => void; disabled?: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-navy-900 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy-900/25 transition-colors hover:bg-brandgreen-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          <span>Please wait…</span>
        </>
      ) : children}
    </motion.button>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-navy-200 bg-white text-navy-600 transition-colors hover:bg-navy-50 hover:text-navy-900 cursor-pointer z-10">
      <ArrowLeft className="size-4" strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
}
