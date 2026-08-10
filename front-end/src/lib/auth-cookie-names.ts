// Nombres de cookie compartidos entre middleware (Edge, no puede importar next/headers)
// y lib/cookies.ts (Server Actions / Route Handlers).
export const ACCESS_TOKEN_COOKIE = "et_access_token";
export const REFRESH_TOKEN_COOKIE = "et_refresh_token";
