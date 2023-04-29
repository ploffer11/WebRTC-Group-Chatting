import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { IUserTag } from '../../../schema/user';
import { JwtService } from '@nestjs/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends IUserTag {}
  }
}

@Injectable()
export class AuthService {
  constructor(
    private usersSerivce: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Express.User> {
    const user = await this.usersSerivce.findOne({ username });
    const saltedPassword = this.usersSerivce.saltPassword(password, user.salt);

    if (user.saltedPassword === saltedPassword) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return { username: user.username };
    }

    return null;
  }

  async login(user: IUserTag) {
    const payload = user;
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
