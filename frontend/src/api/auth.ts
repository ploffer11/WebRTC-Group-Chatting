import {
  IUserCredentials,
  IAuthResult,
  ICreateUser,
  IUserTag,
} from '@schema/auth';

import { GetApi, PostApi } from './api';

export const login = PostApi<IUserCredentials, IAuthResult>(
  '/auth/login',
).build();
export const signup = PostApi<ICreateUser, IAuthResult>('/auth/signup').build();

// TODO: should replace this IUserTag with proper type
export const profile = GetApi<IUserTag>('/auth/profile').requiresAuth().build();
