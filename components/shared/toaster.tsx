"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { useToastStore } from "@/stores/toast-store";

const ICONS = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info,
} as const;

export default function Toaster() {
  const { items, remove } = useToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const timers = items.map((item) =>
      window.setTimeout(() => remove(item.id), 3800)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [items, remove]);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,24rem)] flex-col gap-3">
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const Icon = ICONS[item.tone];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "pointer-events-auto rounded-2xl border bg-surface p-4 shadow-[0_16px_50px_rgba(18,55,42,0.14)]",
                item.tone === "success" && "border-success/30",
                item.tone === "error" && "border-error/30",
                item.tone === "info" && "border-info/30"
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    item.tone === "success" && "bg-success-soft text-success",
                    item.tone === "error" && "bg-error-soft text-error",
                    item.tone === "info" && "bg-info-soft text-info"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-navy-950">{item.title}</div>
                  {item.message && (
                    <p className="mt-1 text-sm leading-6 text-navy-600">{item.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="rounded-full p-1 text-navy-400 transition hover:bg-navy-50 hover:text-navy-700"
                  aria-label="Dismiss toast"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}
