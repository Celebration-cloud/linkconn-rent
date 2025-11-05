"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useLandlordOnboardStore = create(
  persist(
    (set, get) => ({
      identity: null,
      setIdentity: (data) => set({ identity: data }),

      property: null,
      setProperty: (data) => set({ property: data }),

      payout: null,
      setPayout: (data) => set({ payout: data }),

      step: 1,
      nextStep: () => set({ step: get().step + 1 }),
      prevStep: () => set({ step: get().step - 1 }),
      setStep: (num) => set({ step: num }),

      resetOnboarding: () =>
        set({
          identity: null,
          property: null,
          payout: null,
          step: 1,
        }),
    }),
    {
      name: "landlord-onboarding-storage",
      partialize: (state) => ({
        identity: state.identity,
        property: state.property,
        payout: state.payout,
        step: state.step,
      }),
    }
  )
);
