interface IUserTag {
  username: string;
}

interface IUserCredentials {
  username: string;
  password: string;
}

interface IUser extends IUserTag {
  salt: string;
  saltedPassword: string;
}

interface IAuthResult {
  access_token: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ICreateUser extends IUserCredentials {}

export { IUserTag, IUserCredentials, IUser, IAuthResult, ICreateUser };
