"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SearchX, Home } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSession } from "next-auth/react";

export default function NotFound() {
      const { data: session, status } = useSession();
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center h-screen text-center px-6"
    >
      <div className="bg-blue-500/10 dark:bg-blue-500/20 p-6 rounded-full mb-4">
        <SearchX className="w-14 h-14 text-blue-500" />
      </div>

      <h1 className="text-3xl font-semibold mb-2">Page Not Found</h1>
      <p className="text-sm text-muted-foreground max-w-md mb-8">
        The page you’re looking for doesn’t exist or was moved. Check the URL or
        return to your dashboard.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/dashboard?role=${session?.user?.role}`}>
          <Button className="flex items-center gap-2">
            <Home size={16} />
            Go to Dashboard
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            Back Home
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
