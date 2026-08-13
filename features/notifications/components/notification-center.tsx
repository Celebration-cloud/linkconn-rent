"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useState } from "react";
import type { NotificationCenterData } from "@/features/notifications/contracts";

export function NotificationCenter({ initial, onCountChange }: { initial: NotificationCenterData; onCountChange: (_count: number) => void }) {
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function mark(notificationId?: string) {
    setBusy(true);
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notificationId ? { action: "mark_read", notificationId } : { action: "mark_all_read" }),
    });
    setBusy(false);
    if (!response.ok) return;
    const result = await response.json() as { success: boolean; data?: { unreadCount: number } };
    if (!result.success || !result.data) return;
    const now = new Date().toISOString();
    const items = data.items.map((item) => !notificationId || item.id === notificationId ? { ...item, readAt: item.readAt ?? now } : item);
    const unreadCount = result.data.unreadCount;
    setData({ items, unreadCount });
    onCountChange(unreadCount);
  }

  return <div className="min-w-0">
    <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
      <div><h2 className="text-sm font-extrabold text-ink">Notifications</h2><p className="mt-1 text-xs text-muted">{data.unreadCount} unread</p></div>
      {data.unreadCount ? <button type="button" disabled={busy} onClick={() => void mark()} className="flex min-h-11 items-center gap-2 px-2 text-xs font-bold text-forest-800 disabled:opacity-50"><CheckCheck className="size-4" />Mark all read</button> : null}
    </div>
    <div className="max-h-96 overflow-y-auto">
      {data.items.length ? data.items.map((item) => <Link key={item.id} href={item.href} onClick={() => { if (!item.readAt) void mark(item.id); }} className={`block border-b border-line px-1 py-4 last:border-b-0 hover:bg-sand-50 ${item.readAt ? "opacity-70" : ""}`}>
        <span className="flex items-start gap-3"><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-forest-100 text-forest-800"><Bell className="size-4" /></span><span className="min-w-0"><strong className="block text-sm text-ink">{item.title}</strong><span className="mt-1 block text-xs leading-5 text-muted">{item.body}</span><span className="mt-2 block text-[11px] font-semibold text-forest-700">{new Date(item.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</span></span></span>
      </Link>) : <div className="py-8 text-center"><Bell className="mx-auto size-5 text-muted" /><p className="mt-3 text-sm font-bold text-ink">You are all caught up</p><p className="mt-1 text-xs text-muted">Lifecycle updates will appear here.</p></div>}
    </div>
  </div>;
}
