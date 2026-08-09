import { User } from "../entities/user.entity";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface CreateBusinessOwnerInput {
  businessName: string;
  name: string;
  email: string;
  passwordHash: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  /**
   * Crea el negocio y su usuario ADMIN dueño en una sola transacción —
   * si falla el usuario, no queda un negocio huérfano.
   */
  createBusinessOwner(input: CreateBusinessOwnerInput): Promise<User>;
}
