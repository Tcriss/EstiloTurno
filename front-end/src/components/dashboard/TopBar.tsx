"use client";

import { useState } from "react";
import { LogOut, Menu, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth.actions";
import { getInitials } from "@/lib/dashboard-utils";
import type { SafeUser } from "@/services/auth.service";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TopBarProps = {
  user: SafeUser;
  onMenuClick: () => void;
};

export function TopBar({ user, onMenuClick }: TopBarProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await logoutAction();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6 lg:px-8">
      <button
        className="rounded-lg p-2 text-text-muted hover:bg-background hover:text-text-main lg:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-background"
              aria-label="Menú de cuenta"
            >
              <Avatar>
                <AvatarFallback className="bg-teal/15 font-bold text-primary">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-text-main">{user.name}</p>
                <p className="text-xs text-text-muted">{user.email}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onSelect={() => router.push("/dashboard/perfil")}>
              <User className="h-4 w-4 text-text-muted" />
              Mi perfil
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/dashboard/configuracion")}>
              <Settings className="h-4 w-4 text-text-muted" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={isSigningOut} onSelect={handleSignOut}>
              <LogOut className="h-4 w-4" />
              {isSigningOut ? "Cerrando..." : "Cerrar sesión"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
