import { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";

type AuthLayoutProps = {
  mode: "login" | "register";
  children: ReactNode;
};

export function AuthLayout({ mode, children }: AuthLayoutProps) {
  if (mode === "login") {
    return (
      <main className="grid min-h-screen w-full bg-white lg:grid-cols-[40%_60%]">
        <AuthBrandPanel mode="login" />
        <section className="flex min-w-0 items-center justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-[480px]">
            <div className="mb-8 flex justify-center lg:hidden">
              <Logo centered compact />
            </div>
            {children}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f7fafc] px-4 py-5 sm:px-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-7xl overflow-hidden rounded-3xl bg-white shadow-soft lg:grid-cols-[1.05fr_0.95fr]">
        <AuthBrandPanel mode="register" />
        <section className="flex min-w-0 items-center justify-center overflow-hidden bg-white px-5 py-8 sm:px-8 lg:px-14">
          <div className="min-w-0 w-full max-w-full sm:max-w-xl">
            <div className="mb-8 flex justify-center lg:hidden">
              <Logo centered />
            </div>
            <div className="min-w-0 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-panel sm:p-8 lg:p-10">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}