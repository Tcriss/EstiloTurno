import { Business } from "../entities/business.entity";

export const BUSINESS_REPOSITORY = Symbol("BUSINESS_REPOSITORY");

export interface UpdateBusinessSettingsInput {
  name?: string;
  whatsappPhoneNumberId?: string | null;
  workStartMinutes?: number;
  workEndMinutes?: number;
  slotIntervalMinutes?: number;
  botEnabled?: boolean;
}

export interface BusinessRepository {
  findById(id: number): Promise<Business | null>;
  findByWhatsappPhoneNumberId(phoneNumberId: string): Promise<Business | null>;
  findAll(): Promise<Business[]>;
  create(name: string): Promise<Business>;
  update(id: number, input: UpdateBusinessSettingsInput): Promise<Business | null>;
}
