"use client";

import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  title: string;
  message?: string;
  tone: ToastTone;
};

/* eslint-disable no-unused-vars -- parameter labels document store actions */
type ToastState = {
  items: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => string;
  remove: (id: string) => void;
  clear: () => void;
};
/* eslint-enable no-unused-vars */

export const useToastStore = create<ToastState>((set, get) => ({
  items: [],
  push: (toast) => {
    const id = `toast_${Math.random().toString(36).slice(2, 9)}`;
    set({ items: [{ id, ...toast }, ...get().items].slice(0, 4) });
    return id;
  },
  remove: (id) =>
    set((state) => ({
      items: state.items.filter((toast) => toast.id !== id),
    })),
  clear: () => set({ items: [] }),
}));

export function toastSuccess(title: string, message?: string) {
  useToastStore.getState().push({ title, message, tone: "success" });
}

export function toastError(title: string, message?: string) {
  useToastStore.getState().push({ title, message, tone: "error" });
}

export function toastInfo(title: string, message?: string) {
  useToastStore.getState().push({ title, message, tone: "info" });
}
