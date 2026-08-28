"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, FormProvider, useWatch, type FieldErrors, type FieldPath, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import OnboardingStepIndicator from "./onboarding-step-indicator";
import PersonalDetailsStep from "./steps/personal-details";
import TenantPreferencesStep from "./steps/tenant-preferences";
import TenantEmploymentStep from "./steps/tenant-employment";
import LandlordBusinessStep from "./steps/landlord-business";
import LandlordPayoutStep from "./steps/landlord-payout";
import DocumentsStep from "./steps/documents";
import type { Role } from "@/domain/types/auth";
import {
  completeTenantOnboardingSchema,
  completeLandlordOnboardingSchema,
  personalDetailsSchema,
  tenantPreferencesSchema,
  tenantEmploymentSchema,
  landlordBusinessSchema,
  landlordPayoutSchema,
  type CompleteOnboardingPayload,
} from "@/schemas/onboarding";
import { z } from "zod";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { getFirstInvalidOnboardingStep } from "@/features/onboarding/utils/step-validation";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type TenantFormData = z.infer<typeof completeTenantOnboardingSchema>;
type LandlordFormData = z.infer<typeof completeLandlordOnboardingSchema>;

// ─────────────────────────────────────────────────────────────
// Step config per role
// ─────────────────────────────────────────────────────────────

const TENANT_STEPS = ["Personal Details", "Housing Preferences", "Employment & Income", "Documents"];
const LANDLORD_STEPS = ["Personal Details", "Business Info", "Payout Setup", "Documents"];

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
  const [invalidFocusRevision, setInvalidFocusRevision] = useState(0);
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const [hasNavigated, setHasNavigated] = useState(false);

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
      documents: [],
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
      documents: [],
    },
    mode: "onChange",
  });
  const tenantEmploymentType = useWatch({
    control: tenantMethods.control,
    name: "employment.employmentType",
  });
  const methods = (isTenant ? tenantMethods : landlordMethods) as unknown as UseFormReturn<CompleteOnboardingPayload>;

  const focusFirstInvalidControl = () => {
    requestAnimationFrame(() => {
      const control = stepContainerRef.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"], input:invalid, select:invalid, textarea:invalid',
      );
      control?.focus();
    });
  };

  useEffect(() => {
    if (!hasNavigated) return;
    const container = stepContainerRef.current;
    container?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (invalidFocusRevision === 0) {
      container?.focus({ preventScroll: true });
      return;
    }
    const timer = window.setTimeout(() => {
      container?.querySelector<HTMLElement>(
        '[aria-invalid="true"], input:invalid, select:invalid, textarea:invalid',
      )?.focus();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [currentStep, hasNavigated, invalidFocusRevision]);

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
  }, [landlordMethods, methods, role, steps.length, tenantMethods]);

  // Per-step validation schemas (subset of the full schema)
  async function validateStep(step: number): Promise<boolean> {
    const values = methods.getValues() as Record<string, unknown>;
    const validation = step === 0
      ? { section: "personal", result: personalDetailsSchema.safeParse(values.personal) }
      : step === 1 && isTenant
        ? { section: "preferences", result: tenantPreferencesSchema.safeParse(values.preferences) }
        : step === 1
          ? { section: "business", result: landlordBusinessSchema.safeParse(values.business) }
          : step === 2 && isTenant
            ? { section: "employment", result: tenantEmploymentSchema.safeParse(values.employment) }
            : { section: "payout", result: landlordPayoutSchema.safeParse(values.payout) };

    methods.clearErrors(validation.section as FieldPath<CompleteOnboardingPayload>);
    if (validation.result.success) return true;

    validation.result.error.errors.forEach((issue) => {
      const path = `${validation.section}.${issue.path.join(".")}` as FieldPath<CompleteOnboardingPayload>;
      methods.setError(path, { type: "validation", message: issue.message });
    });
    focusFirstInvalidControl();
    return false;
  }

  async function persistDraft(step: number) {
    const response = await fetch("/api/onboarding/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...methods.getValues(),
        role,
        currentStep: step,
      }),
    });
    const result = (await response.json()) as {
      success: boolean;
      message: string;
    };
    if (!result.success) throw new Error(result.message);
  }

  const handleNext = async () => {
    const valid = await validateStep(currentStep);
    if (!valid) return;
    const nextStep = currentStep + 1;
    if (nextStep === steps.length - 1) {
      setIsSavingDraft(true);
      setSubmitError(null);
      try {
        // Persist the selected Tenant/Landlord role before document upload so
        // the UI requirements and server authorization use the same profile.
        await persistDraft(nextStep);
        window.localStorage.setItem(`onboarding-step:${role}`, String(nextStep));
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : "Unable to prepare secure document uploads.";
        setSubmitError(message);
        toastError("Documents not ready", message);
        return;
      } finally {
        setIsSavingDraft(false);
      }
    }
    setHasNavigated(true);
    setDirection(1);
    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    setHasNavigated(true);
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  };

  const submitOnboarding = methods.handleSubmit(async (data: CompleteOnboardingPayload) => {
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await completeOnboarding(data);
    if (!result.ok) {
      setSubmitError(result.error ?? "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
    // On success: completeOnboarding() navigates to the account-review page.
  }, (errors: FieldErrors<CompleteOnboardingPayload>) => {
    const invalidStep = getFirstInvalidOnboardingStep(
      isTenant ? "Tenant" : "Landlord",
      errors as Record<string, unknown>,
    );
    setHasNavigated(true);
    setDirection(invalidStep < currentStep ? -1 : 1);
    setCurrentStep(invalidStep);
    setSubmitError("Please correct the highlighted fields before submitting.");
    setInvalidFocusRevision((revision) => revision + 1);
  });

  const handleSaveAndExit = async () => {
    setIsSavingDraft(true);
    setSubmitError(null);
    try {
      await persistDraft(currentStep);
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
        case 3: return <DocumentsStep role="Tenant" employmentType={tenantEmploymentType} />;
      }
    } else {
      switch (currentStep) {
        case 0: return <PersonalDetailsStep />;
        case 1: return <LandlordBusinessStep />;
        case 2: return <LandlordPayoutStep />;
        case 3: return <DocumentsStep role="Landlord" />;
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
          } else if (isLastStep) {
            void submitOnboarding();
          } else {
            void handleNext();
          }
        }}
      >
        {/* Progress */}
        <OnboardingStepIndicator steps={steps} currentStep={currentStep} />

        {/* Role badge */}
        <div className="flex items-center gap-2 border border-line bg-sand-100 px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-brandgreen-400" />
          <span className="text-xs font-medium text-navy-700">
            Setting up your <strong>{role}</strong> account
          </span>
        </div>

        {/* Step content with slide animation */}
        <div
          ref={stepContainerRef}
          tabIndex={-1}
          role="group"
          aria-label={steps[currentStep]}
          className="relative min-h-[320px] scroll-mt-24 overflow-x-clip outline-none"
        >
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
          <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {submitError}
          </div>
        )}

        {/* Navigation */}
        <div className="sticky bottom-0 z-20 -mx-5 flex items-center gap-3 border-t border-line bg-white/95 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-7 sm:px-7">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting || isSavingDraft}
              className="stitch-button stitch-button-secondary disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}

          <button
            type="submit"
            name="intent"
            value={isLastStep ? "submit" : "next"}
            disabled={isSubmitting || isSavingDraft}
            className="stitch-button flex-1 disabled:opacity-60"
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
