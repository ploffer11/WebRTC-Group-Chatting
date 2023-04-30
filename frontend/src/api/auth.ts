import {
  IUserCredentials,
  IAuthResult,
  ICreateUser,
  IUserTag,
} from '@schema/auth';

import { GetApi, PostApi } from './api';

export const login = PostApi<IUserCredentials, IAuthResult>('/auth/login', {});
export const signup = PostApi<ICreateUser, IAuthResult>('/auth/signup', {});

// TODO: should replace this IUserTag with proper type
export const profile = GetApi<IUserTag>('/auth/profile', {});
