import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AuthExpiredError } from "@/lib/api-server";
import { getCurrentUser } from "@/services/session.service";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  try {
    const user = await getCurrentUser();
    return <DashboardShell user={user}>{children}</DashboardShell>;
  } catch (error) {
    if (error instanceof AuthExpiredError) {
      redirect("/login");
    }
    throw error;
  }
}
