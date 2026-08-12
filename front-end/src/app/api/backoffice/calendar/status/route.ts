import { NextResponse } from "next/server";
import { apiRouteErrorResponse } from "@/lib/api-route-error";
import { getCalendarStatus } from "@/services/calendar.service";

export async function GET() {
  try {
    const data = await getCalendarStatus();
    return NextResponse.json(data);
  } catch (error) {
    return apiRouteErrorResponse(error);
  }
}
