import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersSerivce: UsersService) {}

  async validateUser(username: string, password: string): Promise<any> {
    console.log(username, password);
    const user = await this.usersSerivce.findOne({ username });
    const saltedPassword = this.usersSerivce.saltPassword(password, user.salt);

    if (user.saltedPassword === saltedPassword) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { salt, saltedPassword, ...result } = user;
      return result;
    }

    return null;
  }
}
