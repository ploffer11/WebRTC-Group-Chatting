import { IsString } from 'class-validator';

import { ICreateUser } from '@schema/auth';

export class SignUpRequestDto implements ICreateUser {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}
