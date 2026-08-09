"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { sileo } from "sileo";
import { Button } from "@/components/ui/Button";
import { getSupabaseClient } from "@/lib/supabase";

export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    const supabase = getSupabaseClient();

    if (!supabase) {
      sileo.error({ title: "No pudimos cerrar la sesión", description: "Intenta de nuevo.", fill: "#ba1a1a" });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      setIsLoading(false);
      sileo.error({ title: "No pudimos cerrar la sesión", description: "Intenta de nuevo.", fill: "#ba1a1a" });
      return;
    }

    sileo.success({ title: "Sesión cerrada", description: "Tu cuenta quedó protegida.", fill: "#006a66" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700 hover:text-white disabled:hover:bg-red-600 disabled:hover:text-white"
      disabled={isLoading}
      onClick={handleSignOut}
    >
      <LogOut className="h-5 w-5" aria-hidden="true" />
      {isLoading ? "Cerrando..." : "Cerrar sesión"}
    </Button>
  );
}