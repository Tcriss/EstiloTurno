export interface CalendarCredentials {
  id: number;
  businessId: number;
  provider: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiryDate: Date;
  scope: string;
  connectedAt: Date;
}
