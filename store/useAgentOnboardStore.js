"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAgentOnboardStore = create(
  persist(
    (set, get) => ({
      // Step 1: Identity info (identity)
      identity: null,
      setIdentity: (data) => set({ identity: data }),

      // Step 2: License info
      license: null,
      setLicense: (data) => set({ license: data }),

      // Step 3: Payout info
      payout: null,
      setPayout: (data) => set({ payout: data }),

      // Step tracking
      step: 1,
      nextStep: () => set({ step: get().step + 1 }),
      prevStep: () => set({ step: get().step - 1 }),
      setStep: (num) => set({ step: num }),

      // Reset after completion
      resetOnboarding: () =>
        set({
          identity: null,
          license: null,
          payout: null,
          step: 1,
        }),
    }),
    {
      name: "agent-onboarding-storage",
      partialize: (state) => ({
        identity: state.identity,
        license: state.license,
        payout: state.payout,
        step: state.step,
      }),
    }
  )
);
