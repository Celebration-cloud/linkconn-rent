"use client";

import { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Circle,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { cn } from "@/utils/cn";

type IconName = "mail" | "lock" | "user" | "phone";

const ICONS: Record<IconName, React.ReactNode> = {
  mail: <Mail className="size-4" aria-hidden="true" />,
  lock: <LockKeyhole className="size-4" aria-hidden="true" />,
  user: <User className="size-4" aria-hidden="true" />,
  phone: <Phone className="size-4" aria-hidden="true" />,
};

type Props = {
  label: string;
  error?: string;
  hint?: string;
  type?: string;
  value: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string) => void;
  icon?: React.ReactNode | IconName;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "decimal";
  maxLength?: number;
  placeholder?: string;
  showPasswordToggle?: boolean;
  required?: boolean;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, type = "text", value, onChange, icon: iconProp, showPasswordToggle, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const icon = typeof iconProp === "string" ? ICONS[iconProp as IconName] : iconProp;
  const float = focused || value.length > 0;
  const isPassword = showPasswordToggle || type === "password";

  return (
    <div>
      <div
        className={cn(
          "relative rounded-lg border bg-surface transition-all",
          error
            ? "border-error ring-2 ring-error/10"
            : focused
              ? "border-primary ring-2 ring-primary/15"
              : "border-border hover:border-content-muted",
        )}
      >
        {icon ? (
          <span
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center",
              error ? "text-error" : focused ? "text-primary" : "text-content-muted",
            )}
          >
            {icon}
          </span>
        ) : null}
        <label
          className={cn(
            "pointer-events-none absolute transition-all duration-200",
            float
              ? "left-3 top-0 -translate-y-1/2 bg-surface px-1 text-[11px] font-semibold"
              : cn("top-1/2 -translate-y-1/2 text-sm", icon ? "left-10" : "left-3.5"),
            error ? "text-error" : focused ? "text-primary" : "text-content-muted",
          )}
        >
          {label}
          {!float && rest.required ? <span className="text-error"> *</span> : null}
        </label>
        <input
          ref={ref}
          type={isPassword ? (show ? "text" : "password") : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            "min-h-11 w-full rounded-lg bg-transparent px-3.5 py-3 text-sm font-medium text-content outline-none",
            icon && "pl-10",
            isPassword && "pr-11",
          )}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShow((current) => !current)}
            className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-lg text-content-muted hover:bg-surface-muted hover:text-content"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        ) : null}
      </div>
      {error || hint ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("mt-1.5 px-1 text-xs", error ? "text-error" : "text-content-muted")}
          role={error ? "alert" : undefined}
        >
          {error || hint}
        </motion.p>
      ) : null}
    </div>
  );
});

export function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Symbol", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((check) => check.ok).length;
  const color = score <= 1 ? "bg-error" : score === 2 ? "bg-warning" : score === 3 ? "bg-info" : "bg-success";
  const label = score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className={`h-1 flex-1 rounded-full transition-colors ${index < score ? color : "bg-surface-subtle"}`} />
          ))}
        </div>
        <span className="text-[11px] font-semibold text-content-muted">{label}</span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((check) => (
          <span key={check.label} className={cn("inline-flex items-center gap-1 text-[10px] font-medium", check.ok ? "text-success" : "text-content-muted")}>
            {check.ok ? <Check className="size-3" aria-hidden="true" /> : <Circle className="size-2.5" aria-hidden="true" />}
            {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export const AuthInput = Input;
