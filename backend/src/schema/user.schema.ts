import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser } from '@schema/user';
import { HydratedDocument } from 'mongoose';

@Schema()
export class User implements IUser {
  @Prop()
  username: string;

  @Prop()
  salt: string;

  @Prop()
  saltedPassword: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
