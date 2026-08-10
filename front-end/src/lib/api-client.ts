export class ClientApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    const message =
      body && typeof body === "object" && "message" in body
        ? Array.isArray((body as { message: unknown }).message)
          ? ((body as { message: string[] }).message.join(" "))
          : String((body as { message: unknown }).message)
        : "No pudimos completar la solicitud.";
    super(message);
    this.status = status;
    this.body = body;
  }
}

type ClientFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  searchParams?: Record<string, string | number | undefined>;
};

function buildPath(path: string, searchParams?: ClientFetchOptions["searchParams"]) {
  if (!searchParams) return path;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined) params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

// Habla siempre con rutas propias /api/* (mismo origen) — el backend NestJS nunca es
// alcanzado directo desde el navegador, así el JWT no queda expuesto al JS del cliente.
export async function clientFetch<T>(path: string, options: ClientFetchOptions = {}): Promise<T> {
  const response = await fetch(buildPath(path, options.searchParams), {
    method: options.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401) {
    window.location.href = "/login";
    throw new ClientApiError(401, { message: "Sesión expirada." });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ClientApiError(response.status, data);
  }

  return data as T;
}
