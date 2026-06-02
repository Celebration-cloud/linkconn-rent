"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useTenantOnboardStore = create(
  persist(
    (set, get) => ({
      // Step 1: Identity info
      identity: null,
      setIdentity: (data) => set({ identity: data }),

      // Step 2: Employment info
      employment: null,
      setEmployment: (data) => set({ employment: data }),

      // Step 3: Preference info
      preference: null,
      setPreference: (data) => set({ preference: data }),

      // Step tracking (optional)
      step: 1,
      nextStep: () => set({ step: get().step + 1 }),
      prevStep: () => set({ step: get().step - 1 }),
      setStep: (num) => set({ step: num }),

      // Reset after success
      resetOnboarding: () =>
        set({
          identity: null,
          employment: null,
          preference: null,
          step: 1,
        }),
    }),
    {
      name: "tenant-onboarding-storage", // localStorage key
      partialize: (state) => ({
        identity: state.identity,
        employment: state.employment,
        preference: state.preference,
        step: state.step,
      }),
    },
  ),
);
