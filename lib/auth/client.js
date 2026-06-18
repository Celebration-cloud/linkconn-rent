"use client";

import { createAuthClient } from "@neondatabase/auth/next";
import { useState, useEffect } from "react";

// Keep Neon Auth's signIn / signOut so the server cookie is properly set.
const _auth = createAuthClient();
export const { signIn, signOut } = _auth;

// ── Custom session hook (avoids hook-ordering issues in the library) ──
export function useSession() {
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const p = json.data;
          setData({
            user: {
              id: p.id,
              email: p.email,
              name: p.fullName,
            },
            emailVerified: p.emailVerified,
          });
        } else {
          setData(null);
        }
      })
      .catch(() => setData(null))
      .finally(() => setIsPending(false));
  }, []);

  return { data, isPending };
}

// ── Helper to refresh session data ─────────────────────────────────
export async function getSession() {
  const res = await fetch("/api/auth/profile");
  const json = await res.json();
  if (json.success && json.data) {
    const p = json.data;
    return {
      user: {
        id: p.id,
        email: p.email,
        name: p.fullName,
      },
    };
  }
  return null;
}

// Re‑export the auth client for methods used elsewhere
export const authClient = {
  ..._auth,
  // Custom getSession that calls our profile endpoint
  getSession,
};
