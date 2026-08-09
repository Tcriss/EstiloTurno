import { Role } from "./role.enum";

export interface User {
  id: number;
  businessId: number;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}
