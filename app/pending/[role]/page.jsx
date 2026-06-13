"use client";
import React from "react";
import { Loader2, ShieldCheck, LogOut } from "lucide-react";

import { signOut, useSession } from "@/lib/auth/client";
import Button from "@/components/ui/Button";

export default function PendingPage({ params }) {
  // Unwrap the params promise properly
  const unwrappedParams = React.use(params);
  const role = unwrappedParams.role;

  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-white dark:bg-gray-950 transition-colors">
      <div className="bg-gray-100 dark:bg-gray-900 p-8 rounded-2xl shadow-md max-w-md w-full">
        <div className="flex flex-col items-center gap-3 mb-4">
          <ShieldCheck className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Verification Pending
          </h1>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your account as a <span className="font-medium">{role}</span> is under
          review. You’ll get access once verified.
        </p>

        {session?.user?.email && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Logged in as{" "}
            <span className="font-medium">{session.user.email}</span>
          </p>
        )}

        <Button
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          onPress={async () => {
            await signOut();
            window.location.href = "/";
          }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      <div className="flex items-center gap-2 mt-8 text-gray-400 dark:text-gray-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Waiting for admin verification
      </div>
    </div>
  );
}
