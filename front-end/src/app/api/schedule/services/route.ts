import { NextResponse } from "next/server";
import { apiRouteErrorResponse } from "@/lib/api-route-error";
import { getServices } from "@/services/schedule.service";

export async function GET() {
  try {
    const data = await getServices();
    return NextResponse.json(data);
  } catch (error) {
    return apiRouteErrorResponse(error);
  }
}
