import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "../../domain/entities/user.entity";
import { USER_REPOSITORY, UserRepository } from "../../domain/ports/user.repository";

@Injectable()
export class GetCurrentUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException("Usuario no encontrado.");
    }

    return user;
  }
}
