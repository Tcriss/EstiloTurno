import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { createServerClient } from "@/lib/supabase-server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}