import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};

export function Button({
  className,
  variant = "primary",
  fullWidth = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70",
        variant === "primary" &&
          "bg-primary text-white shadow-panel hover:bg-[#005a57] focus:ring-primary/20 disabled:hover:bg-primary",
        variant === "secondary" &&
          "border border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm hover:border-[#9FB7C1] focus:ring-primary/10",
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
