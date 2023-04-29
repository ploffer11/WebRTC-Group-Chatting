import { IsString } from 'class-validator';
import { ICreateUser } from '@schema/user';

export class SignUpRequestDto implements ICreateUser {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
