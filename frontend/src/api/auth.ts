import {
  IUserCredentials,
  IAuthResult,
  ICreateUser,
  IUserTag,
} from '@schema/auth';

import { ApiRequest } from './api';

export const login = new ApiRequest<IUserCredentials, IAuthResult>(
  '/auth/login',
).post();
export const signup = new ApiRequest<ICreateUser, IAuthResult>(
  '/auth/signup',
).post();

// TODO: should replace this IUserTag with proper type
export const profile = new ApiRequest<never, IUserTag>('/auth/profile')
  .requiresAuth()
  .get();
