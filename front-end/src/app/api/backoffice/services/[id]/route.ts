import { NextRequest, NextResponse } from "next/server";
import { apiRouteErrorResponse } from "@/lib/api-route-error";
import { deleteService, updateService, type UpdateServiceInput } from "@/services/schedule.service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as UpdateServiceInput;

  try {
    const data = await updateService(Number(id), body);
    return NextResponse.json(data);
  } catch (error) {
    return apiRouteErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await deleteService(Number(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiRouteErrorResponse(error);
  }
}
