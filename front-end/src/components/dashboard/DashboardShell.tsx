"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import type { SafeUser } from "@/services/auth.service";

export function DashboardShell({ children, user }: { children: ReactNode; user: SafeUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content — offset by sidebar width on desktop */}
      <div className="flex min-h-screen w-full flex-col lg:pl-60">
        <TopBar user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
