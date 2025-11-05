"use client";
import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { XCircle, LogIn } from "lucide-react";

export default function RejectedPage({ params }) {
  // ✅ unwrap params for Next.js 15+
  const unwrappedParams = React.use(params);
  const role = unwrappedParams.role;

  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-white dark:bg-gray-950 transition-colors">
      <div className="bg-gray-100 dark:bg-gray-900 p-8 rounded-2xl shadow-md max-w-md w-full">
        <div className="flex flex-col items-center gap-3 mb-4">
          <XCircle className="w-12 h-12 text-red-600 dark:text-red-500" />
          <h1 className="text-2xl font-semibold text-red-600 dark:text-red-400">
            Verification Failed
          </h1>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your account as a <span className="font-medium">{role}</span> was not
          approved. Check your details and reapply.
        </p>

        <Link
          href={`/reapply/${role}`}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Reapply
        </Link>

        {session?.user?.email && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-6">
            Logged in as{" "}
            <span className="font-medium">{session.user.email}</span>
          </p>
        )}
      </div>
    </div>
  );
}
