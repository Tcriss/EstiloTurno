import { apiFetch } from "@/lib/api-server";

export type Business = {
  id: number;
  name: string;
  whatsappPhoneNumberId: string | null;
  workStartMinutes: number;
  workEndMinutes: number;
  slotIntervalMinutes: number;
  botEnabled: boolean;
};

export type UpdateBusinessInput = Partial<Omit<Business, "id">>;

export function getBusiness() {
  return apiFetch<Business>("/backoffice/business");
}

export function updateBusiness(input: UpdateBusinessInput) {
  return apiFetch<Business>("/backoffice/business", { method: "PATCH", body: input });
}
