interface IUser {
  username: string;
  salt: string;
  saltedPassword: string;
}

interface ICreateUser {
  username: string;
  password: string;
}

export { IUser, ICreateUser };
