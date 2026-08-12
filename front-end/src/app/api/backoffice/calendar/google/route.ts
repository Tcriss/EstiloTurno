import { NextResponse } from "next/server";
import { apiRouteErrorResponse } from "@/lib/api-route-error";
import { disconnectGoogleCalendar } from "@/services/calendar.service";

export async function DELETE() {
  try {
    const data = await disconnectGoogleCalendar();
    return NextResponse.json(data);
  } catch (error) {
    return apiRouteErrorResponse(error);
  }
}
