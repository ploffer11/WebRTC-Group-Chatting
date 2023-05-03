import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Error } from 'mongoose';

import { ICreateUser, IUserTag } from '@schema/auth';

import { UsersService } from '../users/users.service';

import type { JwtPayload } from 'jsonwebtoken';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User extends IUserTag, JwtPayload {}
  }
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Express.User | null> {
    const user = await this.usersService.findOne({ username });

    if (!user) {
      return null;
    }

    const saltedPassword = this.usersService.saltPassword(password, user.salt);

    if (user.saltedPassword === saltedPassword) {
      return { username: user.username };
    }

    return null;
  }

  async create(opts: ICreateUser) {
    try {
      const createdUser = await this.usersService.create(opts);

      return this.login(createdUser);
    } catch (err) {
      if (err instanceof Error.ValidationError) {
        const [firstError] = Object.values(
          err?.errors,
        ) as Error.ValidatorError[];

        switch (firstError.kind) {
          case 'unique':
            throw new ConflictException({ cause: firstError });
          case 'required':
            throw new BadRequestException({ cause: firstError });
          default:
            throw new InternalServerErrorException({ cause: firstError });
        }
      } else {
        throw new InternalServerErrorException({ cause: err });
      }
    }
  }

  login(user: IUserTag) {
    const payload = user;
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
