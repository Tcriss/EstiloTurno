"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, Menu, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";
import { getSupabaseClient } from "@/lib/supabase";
import { getInitials } from "@/lib/dashboard-utils";

type TopBarProps = {
  onMenuClick: () => void;
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [displayName, setDisplayName] = useState("Usuario");
  const [displayEmail, setDisplayEmail] = useState("");
  const [avatarInitials, setAvatarInitials] = useState("U");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (!user) return;

      const fullName: string = user.user_metadata?.full_name ?? user.email ?? "Usuario";
      const email: string = user.email ?? "";
      setDisplayName(fullName);
      setDisplayEmail(email);
      setAvatarInitials(getInitials(fullName));
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  async function handleSignOut() {
    const supabase = getSupabaseClient();

    if (!supabase) {
      sileo.error({
        title: "No pudimos cerrar la sesión",
        description: "Intenta de nuevo en unos momentos.",
        fill: "#ba1a1a",
      });
      return;
    }

    setIsSigningOut(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      setIsSigningOut(false);
      sileo.error({
        title: "No pudimos cerrar la sesión",
        description: "Intenta de nuevo en unos momentos.",
        fill: "#ba1a1a",
      });
      return;
    }

    sileo.success({
      title: "Sesión cerrada",
      description: "Tu cuenta quedó protegida.",
      fill: "#006a66",
    });
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-6 lg:px-8">
      <button
        className="rounded-lg p-2 text-[#718096] hover:bg-[#f7fafc] hover:text-[#0F172A] lg:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-[#f7fafc]"
            onClick={() => setDropdownOpen((current) => !current)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#38b2ac]/15 text-sm font-bold text-[#006a66]">
              {avatarInitials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-[#0F172A]">{displayName}</p>
              {displayEmail && <p className="text-xs text-[#718096]">{displayEmail}</p>}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#E2E8F0] bg-white py-1 shadow-panel">
              <button
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#2D3748] hover:bg-[#f7fafc]"
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/dashboard/perfil");
                }}
              >
                <User className="h-4 w-4 text-[#718096]" />
                Mi perfil
              </button>
              <button
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#2D3748] hover:bg-[#f7fafc]"
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/dashboard/configuracion");
                }}
              >
                <Settings className="h-4 w-4 text-[#718096]" />
                Configuración
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          title="Cerrar sesión"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-70 sm:px-4"
          disabled={isSigningOut}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{isSigningOut ? "Cerrando..." : "Cerrar sesión"}</span>
        </button>
      </div>
    </header>
  );
}