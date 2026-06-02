"use client";

import React from "react";
import { Button as HeroButton } from "@heroui/react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

/**
 * Props:
 * - variant: 'primary' | 'outline' | 'ghost'
 * - size: 'sm' | 'md' | 'lg'
 * - loading: boolean
 * - icon: React Component (Lucide)
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  ...props
}) {
  const sizeMap = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-2.5 text-lg",
  };

  // HeroUI Button will handle base styling; we add small utilities.
  return (
    <HeroButton
      className={clsx(sizeMap[size], "rounded-xl", className)}
      disabled={loading || props.disabled}
      variant={variant}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </HeroButton>
  );
}
