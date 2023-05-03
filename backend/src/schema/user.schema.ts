import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

import { IUser } from '@schema/auth';

@Schema()
export class User implements IUser {
  @Prop({
    type: 'string',
    index: 'text',
    unique: true,
    required: [true, 'A username is required'],
  })
  username!: string;

  @Prop({
    type: 'string',
    required: [true, 'A salt is required'],
  })
  salt!: string;

  @Prop({
    type: 'string',
    required: [true, 'A (salted) password is required'],
  })
  saltedPassword!: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User).plugin(
  uniqueValidator,
  { message: 'Username should not be duplicated' },
);
