"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BillingPeriod, PlanKey, SignupRole } from "@/domain/billing";
import { getDefaultChoice } from "@/domain/billing";

/* eslint-disable no-unused-vars -- parameter labels document store actions */
type AuthFlowState = {
  role: SignupRole;
  planKey: PlanKey;
  billingPeriod: BillingPeriod;
  setRole: (role: SignupRole) => void;
  setPlan: (planKey: PlanKey, billingPeriod?: BillingPeriod) => void;
  hydrateFromQuery: (next: Partial<AuthFlowState>) => void;
  clearFlow: () => void;
};
/* eslint-enable no-unused-vars */

const DEFAULT_CHOICE = getDefaultChoice("Tenant");

export const useAuthFlowStore = create<AuthFlowState>()(
  persist(
    (set) => ({
      role: DEFAULT_CHOICE.role,
      planKey: DEFAULT_CHOICE.planKey,
      billingPeriod: DEFAULT_CHOICE.billingPeriod,
      setRole: (role) =>
        set(() => {
          const next = getDefaultChoice(role);
          return {
            role: next.role,
            planKey: next.planKey,
            billingPeriod: next.billingPeriod,
          };
        }),
      setPlan: (planKey, billingPeriod) =>
        set((state) => ({
          planKey,
          billingPeriod: billingPeriod || state.billingPeriod,
        })),
      hydrateFromQuery: (next) =>
        set((state) => ({
          role: next.role || state.role,
          planKey: next.planKey || state.planKey,
          billingPeriod: next.billingPeriod || state.billingPeriod,
        })),
      clearFlow: () =>
        set({
          role: DEFAULT_CHOICE.role,
          planKey: DEFAULT_CHOICE.planKey,
          billingPeriod: DEFAULT_CHOICE.billingPeriod,
        }),
    }),
    {
      name: "linkconn.auth-flow",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        role: state.role,
        planKey: state.planKey,
        billingPeriod: state.billingPeriod,
      }),
    }
  )
);
