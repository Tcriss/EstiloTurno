export interface Business {
  id: number;
  name: string;
  whatsappPhoneNumberId: string | null;
  workStartMinutes: number;
  workEndMinutes: number;
  slotIntervalMinutes: number;
  botEnabled: boolean;
}
