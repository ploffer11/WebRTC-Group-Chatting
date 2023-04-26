import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { User as _User } from '@schema/user';
import { HydratedDocument } from 'mongoose';

export class _User {
  email: string;
  hashedPassword: string;
}

@Schema()
export class User extends _User {
  @Prop()
  email: string;

  @Prop()
  hashedPassword: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
