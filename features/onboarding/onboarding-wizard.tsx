"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, FormProvider, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import OnboardingStepIndicator from "./onboarding-step-indicator";
import PersonalDetailsStep from "./steps/personal-details";
import TenantPreferencesStep from "./steps/tenant-preferences";
import TenantEmploymentStep from "./steps/tenant-employment";
import LandlordBusinessStep from "./steps/landlord-business";
import LandlordPayoutStep from "./steps/landlord-payout";
import type { Role } from "@/domain/types/auth";
import {
  completeTenantOnboardingSchema,
  completeLandlordOnboardingSchema,
  personalDetailsSchema,
  tenantPreferencesSchema,
  landlordBusinessSchema,
  type CompleteOnboardingPayload,
} from "@/schemas/onboarding";
import { z } from "zod";
import { toastError, toastSuccess } from "@/stores/toast-store";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type TenantFormData = z.infer<typeof completeTenantOnboardingSchema>;
type LandlordFormData = z.infer<typeof completeLandlordOnboardingSchema>;

// ─────────────────────────────────────────────────────────────
// Step config per role
// ─────────────────────────────────────────────────────────────

const TENANT_STEPS = ["Personal Details", "Housing Preferences", "Employment & Income"];
const LANDLORD_STEPS = ["Personal Details", "Business Info", "Payout Setup"];

const SLIDE_VARIANTS = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
  }),
};

// ─────────────────────────────────────────────────────────────
// Wizard component
// ─────────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  role: Role;
}

export default function OnboardingWizard({ role }: OnboardingWizardProps) {
  const { completeOnboarding } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const isTenant = role === "Tenant";
  const steps = isTenant ? TENANT_STEPS : LANDLORD_STEPS;

  // Each role gets its own schema & form
  const tenantMethods = useForm<TenantFormData>({
    resolver: zodResolver(completeTenantOnboardingSchema),
    defaultValues: {
      role: "Tenant",
      personal: { firstName: "", lastName: "", phone: "", nin: "" },
      preferences: { preferredLocations: [], preferredTypes: [] },
      employment: { employmentType: "Employed", incomeRange: "Below50k" },
    },
    mode: "onChange",
  });

  const landlordMethods = useForm<LandlordFormData>({
    resolver: zodResolver(completeLandlordOnboardingSchema),
    defaultValues: {
      role: "Landlord",
      personal: { firstName: "", lastName: "", phone: "", nin: "" },
      business: { businessName: "", propertyCount: 1, propertyTypesOffered: [] },
      payout: { bankName: "", accountNumber: "", accountName: "" },
    },
    mode: "onChange",
  });

  const methods = (isTenant ? tenantMethods : landlordMethods) as unknown as UseFormReturn<CompleteOnboardingPayload>;

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/onboarding/draft", { cache: "no-store" })
      .then((response) => response.json())
      .then(
        (result: {
          success: boolean;
          data?: Record<string, unknown> & { role?: Role };
        }) => {
          if (
            cancelled ||
            !result.success ||
            !result.data ||
            result.data.role !== role
          ) {
            return;
          }
          if (role === "Tenant") {
            tenantMethods.reset({
              ...tenantMethods.getValues(),
              ...result.data,
              role: "Tenant",
            } as TenantFormData);
          } else {
            landlordMethods.reset({
              ...landlordMethods.getValues(),
              ...result.data,
              role: "Landlord",
            } as LandlordFormData);
          }
          const savedStep = Number(
            window.localStorage.getItem(`onboarding-step:${role}`),
          );
          if (Number.isInteger(savedStep) && savedStep >= 0 && savedStep < steps.length) {
            setCurrentStep(savedStep);
          }
        },
      )
      .catch(() => {
        // The empty defaults remain usable if no draft exists yet.
      });
    return () => {
      cancelled = true;
    };
  }, [methods, role, steps.length]);

  // Per-step validation schemas (subset of the full schema)
  async function validateStep(step: number): Promise<boolean> {
    const values = methods.getValues() as Record<string, unknown>;

    if (step === 0) {
      const result = personalDetailsSchema.safeParse(values.personal);
      if (!result.success) {
        result.error.errors.forEach((e) => {
          const field = `personal.${e.path.join(".")}` as Parameters<typeof methods.setError>[0];
          methods.setError(field, { message: e.message });
        });
        return false;
      }
      return true;
    }

    if (step === 1) {
      if (isTenant) {
        const result = tenantPreferencesSchema.safeParse(values.preferences);
        if (!result.success) {
          result.error.errors.forEach((e) => {
            const field = `preferences.${e.path.join(".")}` as Parameters<typeof methods.setError>[0];
            methods.setError(field, { message: e.message });
          });
          return false;
        }
      } else {
        const result = landlordBusinessSchema.safeParse(values.business);
        if (!result.success) {
          result.error.errors.forEach((e) => {
            const field = `business.${e.path.join(".")}` as Parameters<typeof methods.setError>[0];
            methods.setError(field, { message: e.message });
          });
          return false;
        }
      }
      return true;
    }

    return true; // Step 2 validated on submit
  }

  const handleNext = async () => {
    const valid = await validateStep(currentStep);
    if (!valid) return;
    setDirection(1);
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  };

  const handleSubmit = methods.handleSubmit(async (data: CompleteOnboardingPayload) => {
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await completeOnboarding(data);
    if (!result.ok) {
      setSubmitError(result.error ?? "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
    // On success: completeOnboarding() navigates to the account-review page.
  });

  const handleSaveAndExit = async () => {
    setIsSavingDraft(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/onboarding/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...methods.getValues(),
          role,
          currentStep,
        }),
      });
      const result = (await response.json()) as {
        success: boolean;
        message: string;
      };
      if (!result.success) throw new Error(result.message);
      window.localStorage.setItem(
        `onboarding-step:${role}`,
        String(currentStep),
      );
      toastSuccess("Progress saved", "Continue onboarding whenever you are ready.");
      router.push("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save your progress.";
      setSubmitError(message);
      toastError("Progress not saved", message);
      setIsSavingDraft(false);
    }
  };

  // ─── Render current step content ───
  function renderStep() {
    if (isTenant) {
      switch (currentStep) {
        case 0: return <PersonalDetailsStep />;
        case 1: return <TenantPreferencesStep />;
        case 2: return <TenantEmploymentStep />;
      }
    } else {
      switch (currentStep) {
        case 0: return <PersonalDetailsStep />;
        case 1: return <LandlordBusinessStep />;
        case 2: return <LandlordPayoutStep />;
      }
    }
  }

  const isLastStep = currentStep === steps.length - 1;

  return (
    <FormProvider {...methods}>
      <form
        id="onboarding-form"
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          const submitter = (event.nativeEvent as SubmitEvent)
            .submitter as HTMLButtonElement | null;
          if (submitter?.value === "save-exit") {
            void handleSaveAndExit();
          }
        }}
      >
        {/* Progress */}
        <OnboardingStepIndicator steps={steps} currentStep={currentStep} />

        {/* Role badge */}
        <div className="flex items-center gap-2 rounded-2xl border border-navy-100 bg-navy-50/70 px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-brandgreen-400" />
          <span className="text-xs font-medium text-navy-700">
            Setting up your <strong>{role}</strong> account
          </span>
        </div>

        {/* Step content with slide animation */}
        <div className="relative min-h-[320px] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error */}
        {submitError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {submitError}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3 pt-2">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting || isSavingDraft}
              className="flex items-center gap-1.5 rounded-2xl border border-navy-200 bg-white px-5 py-3 text-sm font-semibold text-navy-800 transition hover:bg-navy-50 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}

          <button
            type="button"
            onClick={isLastStep ? handleSubmit : handleNext}
            disabled={isSubmitting || isSavingDraft}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-navy-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-800 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : isLastStep ? (
              <>Submit for Review</>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Step counter */}
        <p className="text-center text-xs text-navy-400">
          Step {currentStep + 1} of {steps.length}
        </p>
      </form>
    </FormProvider>
  );
}
