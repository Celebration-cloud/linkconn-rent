"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";

export function buildAdminItemHref(path: string, current: URLSearchParams, itemId: string) {
  const next = new URLSearchParams(current);
  next.set("item", itemId);
  return `${path}?${next.toString()}`;
}

export function AdminItemLink({ itemId, children, ...props }: { itemId: string; children: ReactNode } & Omit<ComponentProps<typeof Link>, "href">) {
  const path = usePathname();
  const search = useSearchParams();
  return <Link {...props} href={buildAdminItemHref(path, new URLSearchParams(search), itemId)}>{children}</Link>;
}
