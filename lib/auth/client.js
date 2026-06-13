"use client";

import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();

export const { signIn, signOut, useSession } = authClient;

export async function getSession() {
  const { data } = await authClient.getSession();
  return data;
}
