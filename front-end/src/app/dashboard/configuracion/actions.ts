"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api-server";
import { updateBusiness, type UpdateBusinessInput } from "@/services/business.service";

export type UpdateBusinessResult = { success: true } | { success: false; error: string };

export async function updateBusinessAction(input: UpdateBusinessInput): Promise<UpdateBusinessResult> {
  try {
    await updateBusiness(input);
  } catch (error) {
    if (error instanceof ApiError) {
      const message = Array.isArray(error.body.message) ? error.body.message.join(" ") : error.body.message;
      return { success: false, error: message };
    }
    return { success: false, error: "No pudimos guardar los cambios." };
  }

  revalidatePath("/dashboard/configuracion");
  return { success: true };
}
