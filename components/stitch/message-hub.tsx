"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/icons";
import {
  Archive,
  ArrowLeft,
  CalendarDays,
  FileText,
  Home,
  MoreHorizontal,
  Search,
  Send,
} from "lucide-react";
import { Input, Textarea } from "@/components/ui/form-controls";
import { useAuth } from "@/providers/auth-provider";
import { toastError } from "@/stores/toast-store";

type Person = {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
};

type ApiConversation = {
  id: string;
  tenantId: string;
  landlordId: string;
  tenant: Person;
  landlord: Person;
  property?: { id: string; title: string; location: string } | null;
  application?: { status: string } | null;
  messages: Array<{ body: string; createdAt: string; senderId: string; readAt?: string | null }>;
  _count?: { messages: number };
  lastMessageAt: string;
};

type ApiMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  pending?: boolean;
  failed?: boolean;
};

export function MessageHub() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [mobileThread, setMobileThread] = useState(false);
  const threadEnd = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    const response = await fetch("/api/conversations", { cache: "no-store" });
    if (!response.ok) return;
    const result = (await response.json()) as {
      success: boolean;
      data?: ApiConversation[];
    };
    if (result.success && result.data) {
      setConversations(result.data);
      setActiveId((current) => current || result.data?.[0]?.id || null);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    const response = await fetch(
      `/api/conversations/${conversationId}/messages?limit=60`,
      { cache: "no-store" },
    );
    if (!response.ok) return;
    const result = (await response.json()) as {
      success: boolean;
      data?: { messages: ApiMessage[] };
    };
    if (result.success && result.data) {
      setMessages((current) => {
        const pending = current.filter((item) => item.pending);
        const serverIds = new Set(result.data?.messages.map((item) => item.id));
        return [
          ...(result.data?.messages || []),
          ...pending.filter((item) => !serverIds.has(item.id)),
        ];
      });
    }
  }, []);

  useEffect(() => {
    void loadConversations();
    let timer = 0;
    const poll = () => {
      void loadConversations();
      timer = window.setTimeout(
        poll,
        document.visibilityState === "visible" ? 5000 : 20000,
      );
    };
    timer = window.setTimeout(poll, 5000);
    return () => window.clearTimeout(timer);
  }, [loadConversations]);

  useEffect(() => {
    if (!activeId) return;
    void loadMessages(activeId);
    let timer = 0;
    const poll = () => {
      void loadMessages(activeId);
      timer = window.setTimeout(
        poll,
        document.visibilityState === "visible" ? 5000 : 20000,
      );
    };
    timer = window.setTimeout(poll, 5000);
    return () => window.clearTimeout(timer);
  }, [activeId, loadMessages]);

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const visible = useMemo(
    () =>
      conversations.filter((item) => {
        const other = item.tenantId === user?.id ? item.landlord : item.tenant;
        return `${other.firstName} ${other.lastName} ${item.property?.title || ""}`
          .toLowerCase()
          .includes(query.toLowerCase());
      }),
    [conversations, query, user?.id],
  );
  const active = conversations.find((item) => item.id === activeId);
  const other =
    active && (active.tenantId === user?.id ? active.landlord : active.tenant);

  async function send(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !activeId || !user) return;
    const clientId = `optimistic-${crypto.randomUUID()}`;
    setMessages((items) => [
      ...items,
      {
        id: clientId,
        senderId: user.id,
        body,
        createdAt: new Date().toISOString(),
        pending: true,
      },
    ]);
    setDraft("");
    const response = await fetch(`/api/conversations/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, clientId }),
    });
    if (!response.ok) {
      setMessages((items) =>
        items.map((item) =>
          item.id === clientId ? { ...item, pending: false, failed: true } : item,
        ),
      );
      toastError("Message not sent", "Check your connection and try again.");
      return;
    }
    setMessages((items) => items.filter((item) => item.id !== clientId));
    await Promise.all([loadMessages(activeId), loadConversations()]);
  }

  async function archive() {
    if (!activeId) return;
    await fetch(`/api/conversations/${activeId}/archive`, { method: "POST" });
    setActiveId(null);
    setMobileThread(false);
    await loadConversations();
  }

  return (
    <main id="main-content" className="min-h-[100dvh] bg-sand-50 p-3 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-7xl overflow-hidden rounded-2xl border border-line bg-white shadow-sm sm:min-h-[calc(100dvh-3rem)]">
        <aside className={`${mobileThread ? "hidden" : "flex"} w-full flex-col border-r border-line md:flex md:w-[22rem]`}>
          <header className="border-b border-line p-5">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/" className="inline-flex items-center" aria-label="LinkConn Rent home"><Logo variant="lockup" priority className="h-10 w-auto" sizes="86px" /></Link>
                <h1 className="mt-1 text-2xl font-extrabold text-ink">Messages</h1>
              </div>
              <Link href="/dashboard" className="grid h-11 w-11 place-items-center rounded-full bg-sand-200 text-forest-900" aria-label="Back to dashboard"><Home className="h-4 w-4" /></Link>
            </div>
            <label className="mt-4 block">
              <span className="sr-only">Search conversations</span>
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations" leadingIcon={Search} />
            </label>
          </header>
          <div className="flex-1 overflow-y-auto">
            {visible.length ? visible.map((item) => {
              const participant = item.tenantId === user?.id ? item.landlord : item.tenant;
              const latest = item.messages[0];
              const unread = item._count?.messages || 0;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveId(item.id); setMobileThread(true); }}
                  className={`flex min-h-24 w-full gap-3 border-b border-line p-4 text-left transition ${activeId === item.id ? "bg-forest-50" : "hover:bg-sand-100"}`}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest-800 text-xs font-extrabold text-white">{participant.firstName[0]}{participant.lastName[0]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <strong className="truncate text-sm text-ink">{participant.firstName} {participant.lastName}</strong>
                      {unread > 0 && <span className="grid min-h-5 min-w-5 shrink-0 place-items-center rounded-full bg-forest-700 px-1 text-[10px] font-bold text-white">{unread}</span>}
                    </span>
                    <span className="mt-1 block truncate text-xs font-semibold text-forest-700">{item.property?.title || "General enquiry"}</span>
                    <span className="mt-1 block truncate text-xs text-muted">{latest?.body || "Start the conversation"}</span>
                  </span>
                </button>
              );
            }) : <p className="p-8 text-center text-sm text-muted">No conversations yet.</p>}
          </div>
        </aside>

        <section className={`${mobileThread ? "flex" : "hidden"} min-w-0 flex-1 flex-col md:flex`}>
          {active && other ? (
            <>
              <header className="flex min-h-20 items-center gap-3 border-b border-line px-4 sm:px-6">
                <button onClick={() => setMobileThread(false)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand-200 md:hidden" aria-label="Back to conversations"><ArrowLeft className="h-5 w-5" /></button>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-800 text-xs font-extrabold text-white">{other.firstName[0]}{other.lastName[0]}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-extrabold text-ink">{other.firstName} {other.lastName}</h2>
                  <p className="truncate text-xs text-muted">{active.property?.title || "General enquiry"}</p>
                </div>
                <button onClick={archive} className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand-200" aria-label="Archive conversation"><Archive className="h-4 w-4" /></button>
                <button className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand-200" aria-label="More options"><MoreHorizontal className="h-4 w-4" /></button>
              </header>

              {active.property && (
                <div className="flex flex-wrap items-center gap-2 border-b border-line bg-sand-100 px-4 py-3 sm:px-6">
                  <Link href={`/properties/${active.property.id}`} className="stitch-button-secondary text-xs"><Home className="h-4 w-4" /> View property</Link>
                  <button className="stitch-button-secondary text-xs"><CalendarDays className="h-4 w-4" /> Arrange viewing</button>
                  <button className="stitch-button-secondary text-xs"><FileText className="h-4 w-4" /> Documents</button>
                  {active.application && <span className="ml-auto rounded-md bg-forest-100 px-2 py-1 text-[11px] font-bold text-forest-800">{active.application.status}</span>}
                </div>
              )}

              <div className="flex-1 space-y-3 overflow-y-auto bg-sand-50 p-4 sm:p-6">
                {messages.map((message) => {
                  const mine = message.senderId === user?.id;
                  return (
                    <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${mine ? "rounded-br-sm bg-forest-800 text-white" : "rounded-bl-sm border border-line bg-white text-ink"} ${message.failed ? "opacity-60" : ""}`}>
                        <p>{message.body}</p>
                        <p className={`mt-1 text-[10px] ${mine ? "text-white/65" : "text-muted"}`}>{message.pending ? "Sending…" : message.failed ? "Failed" : new Date(message.createdAt).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={threadEnd} />
              </div>

              <form onSubmit={send} className="flex items-end gap-2 border-t border-line bg-white p-3 sm:p-4">
                <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={1} className="min-h-11 flex-1 resize-none py-3" placeholder="Write a message…" aria-label="Message" />
                <button type="submit" className="stitch-button h-11 w-11 shrink-0 p-0" aria-label="Send message"><Send className="h-4 w-4" /></button>
              </form>
            </>
          ) : (
            <div className="grid flex-1 place-items-center bg-sand-50 p-8 text-center">
              <div><MessageSquareIcon /><h2 className="mt-4 text-lg font-extrabold text-ink">Your conversations live here</h2><p className="mt-2 text-sm text-muted">Choose a conversation to continue.</p></div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MessageSquareIcon() {
  return <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest-100 text-3xl text-forest-800">•••</span>;
}
