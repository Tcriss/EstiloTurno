import "server-only";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth-cookie-names";

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE };

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 8; // 8h — igual al expiresIn del JWT del backend
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30);

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  const base = { httpOnly: true, secure: isProd, sameSite: "lax" as const, path: "/" };

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, { ...base, maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS });
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...base,
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}
