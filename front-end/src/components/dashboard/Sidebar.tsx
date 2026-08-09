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
import { Logo } from "@/components/brand/Logo";
import clsx from "clsx";

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

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-5 py-6">
        <Logo darkBg compact />
      </div>

      {/* Nav */}
      <nav className="mt-2 flex-1 space-y-1 px-3" aria-label="Navegación principal">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={clsx(
                "flex items-center gap-3 rounded-lg border-l-4 px-3 py-3 text-sm font-semibold transition",
                isActive
                  ? "border-[#38b2ac] bg-[#3a4859] text-white"
                  : "border-transparent text-white/50 hover:bg-[#1e293b] hover:text-white/80",
              )}
            >
              <Icon
                className={clsx("h-5 w-5 shrink-0", isActive ? "text-[#38b2ac]" : "text-white/50")}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom spacer */}
      <div className="h-6" />
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="fixed left-0 top-0 z-50 hidden h-full w-64 bg-[#0F172A] lg:flex lg:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar — slide in/out */}
      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-[#0F172A] transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
