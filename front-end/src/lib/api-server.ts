import "server-only";
import { clearAuthCookies, getAccessToken, getRefreshToken, setAuthCookies } from "@/lib/cookies";
import { refresh as refreshTokens } from "@/services/auth.service";
import type { ApiErrorBody } from "@/services/auth.service";

const API_URL = process.env.API_URL ?? "http://localhost:3301";

export class AuthExpiredError extends Error {
  constructor() {
    super("Tu sesión expiró. Iniciá sesión de nuevo.");
    this.name = "AuthExpiredError";
  }
}

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(Array.isArray(body.message) ? body.message.join(" ") : body.message);
    this.status = status;
    this.body = body;
  }
}

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  searchParams?: Record<string, string | number | undefined>;
};

function buildUrl(path: string, searchParams?: ApiFetchOptions["searchParams"]) {
  const url = new URL(path, API_URL);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function rawFetch(path: string, token: string, options: ApiFetchOptions): Promise<Response> {
  return fetch(buildUrl(path, options.searchParams), {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });
}

async function tryRefresh(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const result = await refreshTokens(refreshToken);
    await setAuthCookies(result.accessToken, result.refreshToken);
    return result.accessToken;
  } catch {
    return null;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data ?? { statusCode: response.status, message: "No pudimos completar la solicitud.", error: "Error" }
    );
  }

  return data as T;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const token = await getAccessToken();

  if (!token) {
    throw new AuthExpiredError();
  }

  let response = await rawFetch(path, token, options);

  if (response.status === 401) {
    const newToken = await tryRefresh();

    if (!newToken) {
      await clearAuthCookies();
      throw new AuthExpiredError();
    }

    response = await rawFetch(path, newToken, options);

    if (response.status === 401) {
      await clearAuthCookies();
      throw new AuthExpiredError();
    }
  }

  return parseResponse<T>(response);
}
