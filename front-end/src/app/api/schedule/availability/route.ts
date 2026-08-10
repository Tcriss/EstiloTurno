import { NextRequest, NextResponse } from "next/server";
import { apiRouteErrorResponse } from "@/lib/api-route-error";
import { getAvailability } from "@/services/schedule.service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!date || !serviceId) {
    return NextResponse.json(
      { statusCode: 400, message: "Faltan parámetros date/serviceId.", error: "Bad Request" },
      { status: 400 }
    );
  }

  try {
    const data = await getAvailability({ date, serviceId: Number(serviceId) });
    return NextResponse.json(data);
  } catch (error) {
    return apiRouteErrorResponse(error);
  }
}
