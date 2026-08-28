"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function OnboardingStepIndicator({
  steps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative mb-6 h-1.5 w-full overflow-hidden bg-sand-300">
        <motion.div
          className="absolute inset-y-0 left-0 origin-left bg-forest-700"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: (currentStep + 1) / steps.length }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      {/* Step labels */}
      <div className="flex items-start justify-between">
        {steps.map((label, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;

          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1">
              {/* Dot */}
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300",
                  isDone
                    ? "border-brandgreen-500 bg-brandgreen-500 text-white"
                    : isActive
                    ? "border-navy-950 bg-navy-950 text-white"
                    : "border-navy-200 bg-white text-navy-400"
                )}
              >
                {isDone ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "hidden text-center text-xs font-medium leading-tight sm:block",
                  isActive ? "text-navy-950" : "text-navy-400"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
