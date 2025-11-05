"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Error({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-screen text-center px-6"
    >
      <div className="bg-red-500/10 dark:bg-red-500/20 p-6 rounded-full mb-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
      </div>

      <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        We hit a snag while loading this page. Try refreshing or return home.
      </p>

      <div className="flex gap-3">
        <Button onClick={() => reset()} className="flex items-center gap-2">
          <RotateCcw size={16} />
          Retry
        </Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          Go Home
        </Button>
      </div>
    </motion.div>
  );
}
