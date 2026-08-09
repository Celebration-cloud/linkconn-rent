"use client";

import type { Dispatch, ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Checkbox, Radio } from "@/components/ui/form-controls";

type ChoiceOption<T extends string> = {
  value: T;
  label: ReactNode;
};

type ChoiceGroupBase<T extends string> = {
  name: string;
  legend: ReactNode;
  hint?: string;
  error?: string;
  options: readonly ChoiceOption<T>[];
  className?: string;
};

type CheckboxChipGroupProps<T extends string> = ChoiceGroupBase<T> & {
  values: readonly T[];
  onChange: Dispatch<T[]>;
};

export function CheckboxChipGroup<T extends string>({
  name,
  legend,
  hint,
  error,
  options,
  values,
  onChange,
  className,
}: CheckboxChipGroupProps<T>) {
  const descriptionId = `${name}-description`;
  return (
    <fieldset
      className={cn("space-y-2", className)}
      aria-describedby={hint || error ? descriptionId : undefined}
      aria-invalid={Boolean(error) || undefined}
    >
      <legend className="text-sm font-semibold text-content">{legend}</legend>
      {hint ? <p className="text-xs text-content-muted">{hint}</p> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = values.includes(option.value);
          return (
            <label key={option.value} className="relative cursor-pointer">
              <Checkbox
                name={name}
                value={option.value}
                checked={checked}
                onChange={() =>
                  onChange(
                    checked
                      ? values.filter((value) => value !== option.value)
                      : [...values, option.value],
                  )
                }
                className="peer sr-only"
              />
              <span className="flex min-h-11 items-center rounded-full border border-line bg-white px-3 text-xs font-semibold text-content-muted transition hover:border-forest-400 peer-checked:border-forest-600 peer-checked:bg-forest-50 peer-checked:text-forest-800 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={descriptionId} className="text-xs text-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <span id={descriptionId} className="sr-only">{hint}</span>
      ) : null}
    </fieldset>
  );
}

type RadioCardGroupProps<T extends string> = ChoiceGroupBase<T> & {
  value: T | undefined;
  onChange: Dispatch<T>;
  columns?: boolean;
};

export function RadioCardGroup<T extends string>({
  name,
  legend,
  hint,
  error,
  options,
  value,
  onChange,
  columns,
  className,
}: RadioCardGroupProps<T>) {
  const descriptionId = `${name}-description`;
  return (
    <fieldset
      className={cn("space-y-2", className)}
      aria-describedby={hint || error ? descriptionId : undefined}
      aria-invalid={Boolean(error) || undefined}
    >
      <legend className="text-sm font-semibold text-content">{legend}</legend>
      {hint ? <p className="text-xs text-content-muted">{hint}</p> : null}
      <div className={columns ? "grid grid-cols-2 gap-2 sm:grid-cols-3" : "space-y-2"}>
        {options.map((option) => {
          const checked = value === option.value;
          return <label key={option.value} className="relative block cursor-pointer">
            <Radio
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className={cn(
              "flex min-h-11 items-center rounded-xl border border-line bg-white px-3 text-sm font-semibold text-content-muted transition hover:border-forest-400 peer-checked:border-forest-600 peer-checked:bg-forest-50 peer-checked:text-forest-800 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
              columns ? "justify-center text-center text-xs" : "justify-between",
            )}>
              {option.label}
              {!columns ? <span className={cn("ml-3 size-4 shrink-0 rounded-full border-2 border-current", checked && "bg-forest-600 shadow-[inset_0_0_0_3px_white]")} aria-hidden="true" /> : null}
            </span>
          </label>;
        })}
      </div>
      {error ? (
        <p id={descriptionId} className="text-xs text-error" role="alert">{error}</p>
      ) : hint ? (
        <span id={descriptionId} className="sr-only">{hint}</span>
      ) : null}
    </fieldset>
  );
}
