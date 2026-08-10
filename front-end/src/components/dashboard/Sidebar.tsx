"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Scissors,
  Settings,
  Users,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import { Logo } from "@/components/brand/Logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agenda", href: "/dashboard/agenda", icon: CalendarDays },
  { label: "Clientes", href: "/dashboard/clientes", icon: Users },
  { label: "Servicios", href: "/dashboard/servicios", icon: Scissors },
  { label: "Personal", href: "/dashboard/personal", icon: Users },
  { label: "Analíticas", href: "/dashboard/analiticas", icon: BarChart3 },
  { label: "Configuración", href: "/dashboard/configuracion", icon: Settings },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <Logo darkBg compact />
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3" aria-label="Navegación principal">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={clsx(
                "flex items-center gap-3 rounded-lg border-l-4 px-3 py-3 text-sm font-semibold transition",
                isActive
                  ? "border-teal bg-slate-dark/40 text-white"
                  : "border-transparent text-white/50 hover:bg-slate-dark/20 hover:text-white/80",
              )}
            >
              <Icon className={clsx("h-5 w-5 shrink-0", isActive ? "text-teal" : "text-white/50")} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="h-6" />
    </div>
  );
}

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="fixed left-0 top-0 z-50 hidden h-full w-64 bg-slate-dark lg:flex lg:flex-col">
        <SidebarNav />
      </aside>

      {/* Mobile sidebar — drawer */}
      <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
        <SheetContent side="left" className="w-64 bg-slate-dark p-0 lg:hidden [&_[data-slot=sheet-close]]:text-white">
          <SheetTitle className="sr-only">Navegación principal</SheetTitle>
          <SidebarNav onNavigate={onClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}
