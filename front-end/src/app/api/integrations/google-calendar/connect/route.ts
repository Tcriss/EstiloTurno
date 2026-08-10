import { NextResponse } from "next/server";

// Placeholder: el backend no tiene implementada la integración con Google Calendar todavía.
export async function POST() {
  return NextResponse.json(
    { statusCode: 501, message: "Integración con Google Calendar disponible próximamente.", error: "Not Implemented" },
    { status: 501 }
  );
}
