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

interface ICreateUser extends IUserCredentials {}

export { IUserTag, IUserCredentials, IUser, IAuthResult, ICreateUser };
