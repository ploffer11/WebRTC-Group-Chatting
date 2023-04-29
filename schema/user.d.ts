interface IUserTag {
  username: string;
}

interface IUser extends IUserTag {
  salt: string;
  saltedPassword: string;
}

interface ICreateUser {
  username: string;
  password: string;
}

export { IUserTag, IUser, ICreateUser };
