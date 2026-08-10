import "server-only";

const API_URL = process.env.API_URL ?? "http://localhost:3301";

export type Role = "ADMIN" | "EMPLOYEE";

export type SafeUser = {
  id: number;
  businessId: number;
  name: string;
  email: string;
  role: Role;
};

export type AuthResult = {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
};

export type RefreshResult = {
  accessToken: string;
  refreshToken: string;
};

export type ApiErrorBody = {
  statusCode: number;
  message: string | string[];
  error: string;
};

export class AuthApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(Array.isArray(body.message) ? body.message.join(" ") : body.message);
    this.status = status;
    this.body = body;
  }
}

async function post<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AuthApiError(
      response.status,
      data ?? { statusCode: response.status, message: "No pudimos completar la solicitud.", error: "Error" }
    );
  }

  return data as T;
}

export function login(email: string, password: string) {
  return post<AuthResult>("/auth/login", { email, password });
}

export function register(input: { businessName: string; name: string; email: string; password: string }) {
  return post<AuthResult>("/auth/register", input);
}

export function refresh(refreshToken: string) {
  return post<RefreshResult>("/auth/refresh", { refreshToken });
}

export function logout(refreshToken: string) {
  return post<void>("/auth/logout", { refreshToken });
}

export function forgotPassword(email: string) {
  return post<void>("/auth/forgot-password", { email });
}

export function resetPassword(token: string, newPassword: string) {
  return post<void>("/auth/reset-password", { token, newPassword });
}
