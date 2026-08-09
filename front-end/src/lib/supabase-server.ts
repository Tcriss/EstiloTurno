import { createServerClient as createSupabaseServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const persistencePreferenceKey = "estiloturno-auth-persistence";

function getCookieOptions(options: CookieOptions, useSessionCookie: boolean) {
  if (!useSessionCookie || options.maxAge === 0) return options;
  return { ...options, maxAge: undefined, expires: undefined };
}

export async function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  const cookieStore = await cookies();
  const useSessionCookie = cookieStore.get(persistencePreferenceKey)?.value === "session";

  return createSupabaseServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, getCookieOptions(options, useSessionCookie));
          });
        } catch {
          // Middleware refreshes auth cookies when Server Components cannot write them.
        }
      },
    },
  });
}