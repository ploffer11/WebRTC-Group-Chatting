interface IUser {
  email: string;
  hashedPassword: string;
  salt: string;
}

export { IUser };
