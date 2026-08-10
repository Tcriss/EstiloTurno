import { NextRequest, NextResponse } from "next/server";
import { apiRouteErrorResponse } from "@/lib/api-route-error";
import { updateAppointment, type UpdateAppointmentInput } from "@/services/appointments.service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as UpdateAppointmentInput;

  try {
    const data = await updateAppointment(Number(id), body);
    return NextResponse.json(data);
  } catch (error) {
    return apiRouteErrorResponse(error);
  }
}
