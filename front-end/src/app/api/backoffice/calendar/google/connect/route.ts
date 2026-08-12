import { NextResponse } from "next/server";
import { apiRouteErrorResponse } from "@/lib/api-route-error";
import { startGoogleCalendarConnection } from "@/services/calendar.service";

export async function GET() {
  try {
    const data = await startGoogleCalendarConnection();
    return NextResponse.json(data);
  } catch (error) {
    return apiRouteErrorResponse(error);
  }
}
