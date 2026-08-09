"use client";

import { useState } from "react";
import { Facebook } from "lucide-react";
import type { Provider } from "@supabase/supabase-js";
import { Button } from "@/components/ui/Button";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { getSupabaseClient, setAuthPersistence, type AuthPersistence } from "@/lib/supabase";

type OAuthButtonsProps = {
  onError: (message: string) => void;
  persistence?: AuthPersistence;
};

const providers: Array<{ provider: Provider; label: string; icon: React.ReactNode }> = [
  {
    provider: "google",
    label: "Google",
    icon: <span className="text-lg font-extrabold text-[#4285F4]">G</span>,
  },
  {
    provider: "facebook",
    label: "Facebook",
    icon: <Facebook className="h-5 w-5 text-[#1877F2]" aria-hidden="true" />,
  },
];

export function OAuthButtons({ onError, persistence = "local" }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  async function handleOAuth(provider: Provider) {
    onError("");
    setAuthPersistence(persistence);

    const supabase = getSupabaseClient();

    if (!supabase) {
      onError("No pudimos conectar con el servicio de acceso. Intenta de nuevo más tarde.");
      return;
    }

    setLoadingProvider(provider);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setLoadingProvider(null);
      onError(getAuthErrorMessage(error, "oauth"));
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {providers.map(({ provider, label, icon }) => (
        <Button
          key={provider}
          type="button"
          variant="secondary"
          fullWidth
          className="h-14 text-base font-semibold"
          disabled={Boolean(loadingProvider)}
          onClick={() => handleOAuth(provider)}
        >
          {icon}
          {loadingProvider === provider ? "Conectando..." : label}
        </Button>
      ))}
    </div>
  );
}
