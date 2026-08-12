"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Scissors, Settings, LayoutDashboard, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agenda", href: "/dashboard/agenda", icon: CalendarDays },
  { label: "Servicios", href: "/dashboard/servicios", icon: Scissors },
  { label: "Configuración", href: "/dashboard/configuracion", icon: Settings },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center border-b border-sidebar-border px-5">
        <Logo compact />
      </div>

      <nav className="flex-1 space-y-0.5 p-3" aria-label="Navegación principal">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={clsx(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between border-t border-sidebar-border px-3 py-3">
        <ThemeToggle />
        <span className="pr-2 text-xs text-muted-foreground">© EstiloTurno</span>
      </div>
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
      <aside className="fixed left-0 top-0 z-50 hidden h-full w-60 border-r border-sidebar-border lg:flex lg:flex-col">
        <SidebarNav />
      </aside>

      {/* Mobile sidebar — drawer */}
      <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
        <SheetContent side="left" className="w-60 bg-sidebar p-0 lg:hidden">
          <SheetTitle className="sr-only">Navegación principal</SheetTitle>
          <SidebarNav onNavigate={onClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}
