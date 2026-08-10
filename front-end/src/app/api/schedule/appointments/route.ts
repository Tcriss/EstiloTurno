import { NextRequest, NextResponse } from "next/server";
import { apiRouteErrorResponse } from "@/lib/api-route-error";
import { createAppointment, type CreateAppointmentInput } from "@/services/schedule.service";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CreateAppointmentInput;

  try {
    const data = await createAppointment(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return apiRouteErrorResponse(error);
  }
}
