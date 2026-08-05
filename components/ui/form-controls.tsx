"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  const descriptionId = `${htmlFor}-description`;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-content">
        {label}
        {required ? <span className="ml-1 text-error" aria-hidden="true">*</span> : null}
      </label>
      {children}
      {error || hint ? (
        <p
          id={descriptionId}
          className={cn("text-xs leading-5", error ? "text-error" : "text-content-muted")}
          role={error ? "alert" : undefined}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  leadingIcon?: LucideIcon;
  trailingAction?: ReactNode;
  invalid?: boolean;
};

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "size-4 shrink-0 rounded border-line accent-forest-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leadingIcon: LeadingIcon, trailingAction, invalid, ...props },
  ref,
) {
  return (
    <span className="relative block">
      {LeadingIcon ? (
        <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-11 items-center justify-center text-content-muted">
          <LeadingIcon className="size-4 shrink-0" aria-hidden="true" />
        </span>
      ) : null}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "form-control",
          LeadingIcon && "pl-10",
          trailingAction && "pr-11",
          className,
        )}
        {...props}
      />
      {trailingAction ? (
        <span className="absolute inset-y-0 right-0 z-10 flex w-11 items-center justify-center">
          {trailingAction}
        </span>
      ) : null}
    </span>
  );
});

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  leadingIcon?: LucideIcon;
  invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, leadingIcon: LeadingIcon, invalid, children, ...props },
  ref,
) {
  return (
    <span className="relative block">
      {LeadingIcon ? (
        <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-11 items-center justify-center text-content-muted">
          <LeadingIcon className="size-4 shrink-0" aria-hidden="true" />
        </span>
      ) : null}
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn("form-control appearance-none pr-10", LeadingIcon && "pl-10", className)}
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center text-content-muted">
        <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
      </span>
    </span>
  );
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  leadingIcon?: LucideIcon;
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, leadingIcon: LeadingIcon, invalid, ...props }, ref) {
    return (
      <span className="relative block">
        {LeadingIcon ? (
          <span className="pointer-events-none absolute left-0 top-0 z-10 flex h-11 w-11 items-center justify-center text-content-muted">
            <LeadingIcon className="size-4 shrink-0" aria-hidden="true" />
          </span>
        ) : null}
        <textarea
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(
            "form-control min-h-28 resize-y",
            LeadingIcon && "pl-10",
            className,
          )}
          {...props}
        />
      </span>
    );
  },
);
