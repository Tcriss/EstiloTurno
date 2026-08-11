import { ReactNode } from "react";
import clsx from "clsx";
import { Logo } from "@/components/brand/Logo";

type AuthLayoutProps = {
  children: ReactNode;
  /** Register needs a roomier card for its two-column fields. */
  size?: "sm" | "md";
};

export function AuthLayout({ children, size = "sm" }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className={clsx("w-full", size === "md" ? "max-w-[520px]" : "max-w-[400px]")}>
        <div className="mb-8 flex justify-center">
          <Logo centered compact />
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-card sm:p-8">{children}</div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          EstiloTurno — Agenda. Automatiza. Gestiona.
        </p>
      </div>
    </main>
  );
}
