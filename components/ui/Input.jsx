"use client";

import React from "react";
import { Input as HeroInput } from "@heroui/react";
import { AlertCircle } from "lucide-react";
import clsx from "clsx";

export default function Input({
  label,
  icon: Icon,
  error,
  type = "text",
  className = "",
  ...props
}) {
  return (
    <div className={clsx("w-full space-y-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className={clsx("relative")}>
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon className="h-4 w-4" />
          </span>
        )}

        <HeroInput
          type={type}
          className={clsx(
            Icon ? "pl-10" : "pl-3",
            error ? "border-red-500" : "",
            "rounded-xl"
          )}
          {...props}
        />
      </div>

      {error && (
        <div className="flex items-center text-sm text-red-600 mt-1">
          <AlertCircle className="mr-1 h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
