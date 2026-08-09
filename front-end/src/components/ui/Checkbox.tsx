"use client";

import { InputHTMLAttributes, ReactNode, useId } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> & {
  label: ReactNode;
  error?: string;
  id?: string;
};

export function Checkbox({ label, error, id, className, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-2">
      <label className="flex items-start gap-3 text-sm text-[#2D3748]" htmlFor={inputId}>
        <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            id={inputId}
            type="checkbox"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={clsx(
              "peer h-5 w-5 appearance-none rounded-md border border-[#9FB7C1] bg-white transition checked:border-primary checked:bg-primary focus:outline-none focus:ring-4 focus:ring-primary/20",
              className,
            )}
            {...props}
          />
          <Check
            className="pointer-events-none absolute h-4 w-4 text-white opacity-0 transition peer-checked:opacity-100"
            aria-hidden="true"
          />
        </span>
        <span>{label}</span>
      </label>
      {error && (
        <p id={errorId} className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
