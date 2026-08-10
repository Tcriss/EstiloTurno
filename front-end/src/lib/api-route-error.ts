import { NextResponse } from "next/server";
import { ApiError, AuthExpiredError } from "@/lib/api-server";

// Traduce errores de apiFetch() a una Response HTTP para los Route Handlers proxy en /api/*.
export function apiRouteErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthExpiredError) {
    return NextResponse.json({ statusCode: 401, message: error.message, error: "Unauthorized" }, { status: 401 });
  }

  if (error instanceof ApiError) {
    return NextResponse.json(error.body, { status: error.status });
  }

  return NextResponse.json(
    { statusCode: 500, message: "Error inesperado.", error: "Internal Server Error" },
    { status: 500 }
  );
}
