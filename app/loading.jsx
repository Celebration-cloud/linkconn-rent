"use client";

import { Skeleton } from "@heroui/react";
import { Spinner } from "@heroui/react";

export default function SpinnerLoading() {
  return (
    <Skeleton>
      <div suppressHydrationWarning className="flex justify-center h-screen">
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Spinner
            className="animate-spin drop-shadow-md text-primary"
            color="primary"
            size="lg"
          />
          <p className="text-sm font-medium bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    </Skeleton>
  );
}
