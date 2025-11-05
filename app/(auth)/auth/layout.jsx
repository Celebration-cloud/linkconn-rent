"use client";

import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { motion } from "framer-motion";
import { ThemeSwitch } from "@/components/theme-switch";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground transition-colors duration-300">
      {/* LEFT SIDE: Branding / Illustration */}
      <div className="hidden md:flex relative w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-white">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/30" />

        {/* Branding content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center text-center px-10"
        >
          <Image
            src={siteConfig.logo}
            alt="LinkConn Rent Logo"
            width={120}
            height={120}
            className="mb-6 drop-shadow-lg"
            priority
          />
          <h1 className="text-3xl font-bold mb-3">Welcome to LinkConn Rent</h1>
          <p className="text-white/90 max-w-sm leading-relaxed">
            Simplify property management for landlords, agents, and tenants —
            all in one powerful platform.
          </p>
        </motion.div>

        {/* Decorative background glow */}
        <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -bottom-20 -right-20" />
      </div>

      {/* RIGHT SIDE: Form / Onboarding content */}
      <div className="flex-1 flex flex-col items-center justify-center bg-content1 relative px-6 sm:px-8 py-10">
        {/* Top Controls */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {/* Back to Home */}
          <Link
            href="/"
            className="p-2 rounded-full hover:bg-foreground/10 transition flex items-center gap-1 text-sm font-medium"
            aria-label="Back to Home"
          >
            <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.9 }}>
              <ArrowLeft className="w-5 h-5" />
            </motion.div>
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>

        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeSwitch className="p-2 rounded-full transition hover:opacity-80" />
        </div>

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-card rounded-2xl shadow-xl p-6 sm:p-8"
        >
          {children}
        </motion.div>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}{" "}
          <Link
            href={siteConfig.url || "/"}
            className="text-primary hover:underline"
          >
            {siteConfig.name || "LinkConn Rent"}
          </Link>{" "}
          — All rights reserved.
        </footer>
      </div>
    </div>
  );
}
