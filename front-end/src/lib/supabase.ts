import { createBrowserClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;
export type AuthPersistence = "local" | "session";

const persistencePreferenceKey = "estiloturno-auth-persistence";
const persistentCookieMaxAge = 400 * 24 * 60 * 60;
let authPersistence: AuthPersistence = "local";

function serializeCookie(name: string, value: string, options: CookieOptions) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  if (options.path) parts.push(`Path=${options.path}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (typeof options.maxAge === "number") parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.sameSite) {
    const sameSite = options.sameSite === true ? "Strict" : String(options.sameSite);
    parts.push(`SameSite=${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`);
  }
  if (options.secure) parts.push("Secure");

  document.cookie = parts.join("; ");
}

function getBrowserCookies() {
  if (typeof document === "undefined" || !document.cookie) return [];

  return document.cookie.split("; ").map((entry) => {
    const separatorIndex = entry.indexOf("=");
    const name = separatorIndex >= 0 ? entry.slice(0, separatorIndex) : entry;
    const value = separatorIndex >= 0 ? entry.slice(separatorIndex + 1) : "";
    return { name: decodeURIComponent(name), value: decodeURIComponent(value) };
  });
}

export function setAuthPersistence(mode: AuthPersistence) {
  authPersistence = mode;
  supabaseClient = null;

  if (typeof document === "undefined") return;

  serializeCookie(persistencePreferenceKey, mode, {
    path: "/",
    sameSite: "lax",
    maxAge: mode === "local" ? persistentCookieMaxAge : undefined,
  });
}

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  if (!supabaseClient) {
    const savedPreference = getBrowserCookies().find(({ name }) => name === persistencePreferenceKey)?.value;
    authPersistence = savedPreference === "session" ? "session" : "local";

    supabaseClient = createBrowserClient(supabaseUrl, supabasePublishableKey, {
      isSingleton: false,
      cookies: {
        getAll: getBrowserCookies,
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const isRemoval = options.maxAge === 0;
            serializeCookie(name, value, {
              ...options,
              maxAge: isRemoval
                ? 0
                : authPersistence === "local"
                  ? options.maxAge ?? persistentCookieMaxAge
                  : undefined,
              expires: authPersistence === "session" && !isRemoval ? undefined : options.expires,
            });
          });
        },
      },
    });
  }

  return supabaseClient;
}