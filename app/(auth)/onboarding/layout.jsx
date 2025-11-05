"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { ArrowLeft } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

export default function OnboardingLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground transition-colors duration-300">
      {/* LEFT PANEL */}
      <div className="hidden md:flex relative w-1/2 items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-white">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/30" />

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
          <h1 className="text-3xl font-bold mb-3">Getting Started</h1>
          <p className="text-white/90 max-w-sm leading-relaxed">
            Let’s personalize your LinkConn Rent experience in just a few easy
            steps.
          </p>
        </motion.div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center bg-content1 relative px-6 sm:px-8 py-10">
        {/* Top Controls */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
         <BackButton />
        </div>

        <div className="absolute top-4 right-4">
          <ThemeSwitch />
        </div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl bg-card rounded-2xl p-6 sm:p-8"
        >
          {children}
        </motion.div>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} LinkConn Rent — All rights reserved.
        </footer>
      </div>
    </div>
  );
}
