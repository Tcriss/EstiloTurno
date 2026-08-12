import { NextRequest, NextResponse } from "next/server";
import { apiRouteErrorResponse } from "@/lib/api-route-error";
import { createService, type CreateServiceInput } from "@/services/schedule.service";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CreateServiceInput;

  try {
    const data = await createService(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return apiRouteErrorResponse(error);
  }
}
