"use client";

import { InputHTMLAttributes, ReactNode, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  labelAction?: ReactNode;
  labelClassName?: string;
  error?: string;
  helpText?: ReactNode;
  icon?: ReactNode;
  id?: string;
};

export function Input({
  label,
  labelAction,
  labelClassName,
  error,
  helpText,
  icon,
  className,
  type = "text",
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const helpTextId = `${inputId}-help`;
  const descriptionIds = [helpText ? helpTextId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={inputId} className={clsx("block text-sm font-bold text-navy", labelClassName)}>
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#718096]">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          type={resolvedType}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionIds || undefined}
          className={clsx(
            "h-12 w-full rounded-lg border bg-white px-4 text-sm text-[#0F172A] outline-none transition placeholder:text-[#9FB7C1] focus:border-primary focus:ring-4 focus:ring-primary/10",
            icon && "pl-11",
            isPassword && "pr-11",
            error ? "border-red-400" : "border-[#E2E8F0]",
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#718096] transition hover:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-primary/30"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {helpText && (
        <div id={helpTextId} className="text-sm leading-5 text-[#718096]">
          {helpText}
        </div>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
