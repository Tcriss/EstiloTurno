import { NextRequest, NextResponse } from "next/server";
import { apiRouteErrorResponse } from "@/lib/api-route-error";
import { listAppointments, type AppointmentStatus } from "@/services/appointments.service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date") ?? undefined;
  const status = (searchParams.get("status") as AppointmentStatus | null) ?? undefined;

  try {
    const data = await listAppointments({ date, status: status ?? undefined });
    return NextResponse.json(data);
  } catch (error) {
    return apiRouteErrorResponse(error);
  }
}
